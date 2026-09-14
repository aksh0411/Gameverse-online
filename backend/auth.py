import os
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt

_backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_backend_dir, ".env"))
load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "gameverse-super-secret-jwt-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60  # 24 hours

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
# Default hash for password 'admin123'
DEFAULT_HASH = "$2b$12$WvZYgsG1DEbWjlWZfGG1P.7hA2x5O0AhfuYCmgZEQQ0GPV83I9/NW"
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", DEFAULT_HASH)
if not ADMIN_PASSWORD_HASH or ADMIN_PASSWORD_HASH.startswith("<"):
    ADMIN_PASSWORD_HASH = DEFAULT_HASH

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")

router = APIRouter(prefix="/api/admin", tags=["Auth"])

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
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != ADMIN_USERNAME or not verify_password(form_data.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
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

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "hash":
        password = sys.argv[2]
        print(f"Hash for '{password}': {get_password_hash(password)}")
