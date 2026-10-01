import os
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt

_backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_backend_dir, ".env"))
load_dotenv()

# Auth credentials come ONLY from environment variables — this repository is
# public, so no secret may ever be hardcoded here. The server refuses to boot
# without them (fail closed) rather than falling back to known defaults.
#   Local:  backend/.env            (JWT_SECRET=, ADMIN_USERNAME=, ADMIN_PASSWORD_HASH=)
#   Vercel: Project Settings → Environment Variables
SECRET_KEY = os.getenv("JWT_SECRET")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH")
if not SECRET_KEY or not ADMIN_USERNAME or not ADMIN_PASSWORD_HASH:
    raise RuntimeError(
        "JWT_SECRET, ADMIN_USERNAME and ADMIN_PASSWORD_HASH must all be set in "
        "backend/.env (local) or the Vercel Environment Variables (production). "
        "Generate a JWT_SECRET with: python -c \"import secrets; print(secrets.token_hex(32))\" "
        "and a password hash with: python -c \"import bcrypt; print(bcrypt.hashpw(b'YOUR-PASSWORD', bcrypt.gensalt()).decode())\""
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 4 * 60  # 4 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")

router = APIRouter(prefix="/api/admin", tags=["Auth"])

# ---- Login rate limiting (per client IP) ----
# In-memory sliding window: counts FAILED login attempts only. On Vercel each
# warm instance has its own counter, which still multiplies an attacker's cost;
# pair with Vercel Firewall rate rules for a hard global cap.
_LOGIN_WINDOW_SECONDS = 15 * 60
_LOGIN_MAX_FAILURES = 10
_login_failures = defaultdict(deque)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _register_login_failure(ip: str) -> None:
    now = time.time()
    attempts = _login_failures[ip]
    while attempts and now - attempts[0] > _LOGIN_WINDOW_SECONDS:
        attempts.popleft()
    attempts.append(now)
    # Bound memory under distributed abuse
    if len(_login_failures) > 50_000:
        _login_failures.clear()
        _login_failures[ip].append(now)


def _login_is_rate_limited(ip: str) -> bool:
    now = time.time()
    attempts = _login_failures.get(ip)
    if not attempts:
        return False
    while attempts and now - attempts[0] > _LOGIN_WINDOW_SECONDS:
        attempts.popleft()
    return len(attempts) >= _LOGIN_MAX_FAILURES

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login")
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    ip = _client_ip(request)
    if _login_is_rate_limited(ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Try again in a few minutes.",
            headers={"Retry-After": "300"},
        )
    if form_data.username != ADMIN_USERNAME or not verify_password(form_data.password, ADMIN_PASSWORD_HASH):
        _register_login_failure(ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    _login_failures.pop(ip, None)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": ADMIN_USERNAME}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_admin(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username != ADMIN_USERNAME:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username

@router.get("/verify")
async def verify_admin_token(admin: str = Depends(get_current_admin)):
    """Lightweight endpoint for the frontend to verify a stored JWT is still valid."""
    return {"authenticated": True, "user": admin}

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "hash":
        password = sys.argv[2]
        print(f"Hash for '{password}': {get_password_hash(password)}")
