import os

import re

import time

import logging

from datetime import datetime, timedelta, timezone

from typing import Optional, Dict, Any

from dotenv import load_dotenv

from fastapi import APIRouter, Depends, HTTPException, Request, status

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm

import jwt

from jwt.exceptions import PyJWTError

import bcrypt

import psycopg
import httpx

from database import get_db



_logger = logging.getLogger("gameverse.auth")



_backend_dir = os.path.dirname(os.path.abspath(__file__))

load_dotenv(os.path.join(_backend_dir, ".env"))

load_dotenv()



# --- Supabase Configuration ---

def _clean_env(val: Optional[str]) -> str:
    if not val:
        return ""
    val = val.strip()
    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
        val = val[1:-1].strip()
    return val

SUPABASE_URL = _clean_env(os.getenv("SUPABASE_URL")).rstrip("/")

if not SUPABASE_URL:
    db_url = _clean_env(os.getenv("DATABASE_URL"))
    match = re.search(r"(?:postgres|db)\.([a-z0-9]+)", db_url)
    if match:
        SUPABASE_URL = f"https://{match.group(1)}.supabase.co"

SUPABASE_ANON_KEY = _clean_env(os.getenv("SUPABASE_ANON_KEY"))
SUPABASE_SECRET_KEY = _clean_env(os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# --- Legacy Fallback Credentials ---
LEGACY_SECRET_KEY = _clean_env(os.getenv("JWT_SECRET")) or "gameverse_fallback_jwt_secret_key_2026_super_secure"
ADMIN_USERNAME = _clean_env(os.getenv("ADMIN_USERNAME")) or "admin"
ADMIN_PASSWORD_HASH = _clean_env(os.getenv("ADMIN_PASSWORD_HASH")) or "$2b$12$WvZYgsG1DEbWjlWZfGG1P.7hA2x5O0AhfuYCmgZEQQ0GPV83I9/NW"
ADMIN_PASSWORD = _clean_env(os.getenv("ADMIN_PASSWORD"))



# Pinned asymmetric signing keys from Supabase JWKS (ES256 / RS256)

PINNED_ALGORITHMS = ["ES256", "RS256"]

_jwks_client: Optional[jwt.PyJWKClient] = None



def get_jwks_client() -> Optional[jwt.PyJWKClient]:

    global _jwks_client

    if _jwks_client is None and SUPABASE_URL:

        jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

        _jwks_client = jwt.PyJWKClient(jwks_url, cache_keys=True)

    return _jwks_client



# Bearer security scheme for Swagger UI & route protection

bearer_scheme = HTTPBearer(auto_error=False)



router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])



# ==============================================================================

# Rate Limiting (PostgreSQL-backed for Vercel Serverless & Local persistence)

# ==============================================================================



def get_client_ip(request: Request) -> str:

    """Extract true client IP from reverse proxy headers (e.g. Vercel) or client host."""

    forwarded = request.headers.get("x-forwarded-for", "")

    if forwarded:

        return forwarded.split(",")[0].strip()

    return request.client.host if request.client else "127.0.0.1"





def init_login_attempts_table(cur) -> None:

    """Ensure the login_attempts table and indexes exist."""

    cur.execute("""

        CREATE TABLE IF NOT EXISTS public.login_attempts (

            id bigserial PRIMARY KEY,

            ip text NOT NULL,

            identifier text NOT NULL,

            attempted_at timestamptz NOT NULL DEFAULT now()

        );

        CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON public.login_attempts (ip, attempted_at);

        CREATE INDEX IF NOT EXISTS idx_login_attempts_ident_time ON public.login_attempts (identifier, attempted_at);

    """)





def check_login_rate_limit(ip: str, identifier: str, db) -> None:

    """Check failed login attempts in the last 15 minutes by IP and by identifier."""

    try:

        # Prune records older than 1 day to prevent unbounded table growth

        db.execute("DELETE FROM public.login_attempts WHERE attempted_at < now() - interval '1 day'")



        # Check IP threshold (max 10 failed attempts)

        db.execute(

            "SELECT count(*) AS cnt FROM public.login_attempts WHERE ip = %s AND attempted_at > now() - interval '15 minutes'",

            [ip]

        )

        row_ip = db.fetchone()

        if row_ip and row_ip.get("cnt", 0) >= 10:

            raise HTTPException(

                status_code=status.HTTP_429_TOO_MANY_REQUESTS,

                detail="Too many failed login attempts from this network. Try again in 15 minutes."

            )



        # Check Account/Identifier threshold (max 15 failed attempts)
        if identifier:
            max_attempts = 20 if identifier.strip().lower() in ((ADMIN_USERNAME or "admin").strip().lower(), "admin") else 15
            db.execute(
                "SELECT count(*) AS cnt FROM public.login_attempts WHERE lower(identifier) = lower(%s) AND attempted_at > now() - interval '15 minutes'",
                [identifier]
            )
            row_acc = db.fetchone()
            if row_acc and row_acc.get("cnt", 0) >= max_attempts:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many failed login attempts for this account. Try again in 15 minutes."
                )

    except psycopg.errors.UndefinedTable:

        init_login_attempts_table(db)





def record_login_failure(ip: str, identifier: str, db) -> None:

    """Record a failed login attempt in PostgreSQL and prune entries older than 24h."""

    try:

        db.execute(

            "INSERT INTO public.login_attempts (ip, identifier) VALUES (%s, %s)",

            [ip, identifier.strip().lower() if identifier else ""]

        )

        # Keep table lean

        db.execute("DELETE FROM public.login_attempts WHERE attempted_at < now() - interval '1 day'")

    except psycopg.errors.UndefinedTable:

        init_login_attempts_table(db)

        db.execute(

            "INSERT INTO public.login_attempts (ip, identifier) VALUES (%s, %s)",

            [ip, identifier.strip().lower() if identifier else ""]

        )





def clear_login_failures(ip: str, identifier: str, db) -> None:

    """Clear failed attempts upon successful authentication."""

    try:

        db.execute(

            "DELETE FROM public.login_attempts WHERE lower(identifier) = lower(%s) OR ip = %s",

            [identifier.strip().lower() if identifier else "", ip]

        )

    except Exception:

        pass





# ==============================================================================

# Token Verification (Supabase JWKS with Pinned Asymmetric Algorithms)

# ==============================================================================



def decode_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a Supabase JWT via JWKS, JWT secret, or Supabase REST verify."""
    # 1. Asymmetric JWKS (ES256, RS256)
    client = get_jwks_client()
    if client:
        try:
            signing_key = client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=PINNED_ALGORITHMS,
                audience="authenticated"
            )
            return payload
        except Exception:
            pass

    # 2. HS256 secret fallback (if project issues HS256 tokens)
    jwt_sec = os.getenv("SUPABASE_JWT_SECRET") or os.getenv("JWT_SECRET")
    if jwt_sec:
        try:
            payload = jwt.decode(
                token,
                jwt_sec,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return payload
        except Exception:
            pass

    # 3. Supabase Auth REST verification fallback
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        try:
            with httpx.Client(timeout=4.0) as http_client:
                res = http_client.get(
                    f"{SUPABASE_URL}/auth/v1/user",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "apikey": SUPABASE_ANON_KEY
                    }
                )
                if res.status_code == 200:
                    user_data = res.json()
                    return {
                        "sub": user_data.get("id"),
                        "email": user_data.get("email"),
                        "user_metadata": user_data.get("user_metadata", {})
                    }
        except Exception as e:
            _logger.debug("Supabase REST auth fallback error: %s", e)

    return None

def decode_legacy_token(token: str) -> Optional[str]:
    """Verify legacy admin tokens if signed by LEGACY_SECRET_KEY."""
    secret = LEGACY_SECRET_KEY or "gameverse_fallback_jwt_secret_key_2026_super_secure"
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        username = payload.get("sub")
        if username:
            return username
    except Exception:
        pass
    return None





async def get_current_user(

    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),

    db = Depends(get_db)

) -> Dict[str, Any]:

    """Dependency to extract & verify the authenticated user from Bearer token."""

    if not creds or not creds.credentials:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Authentication required",

            headers={"WWW-Authenticate": "Bearer"}

        )



    token = creds.credentials



    # 1. Check Supabase JWT

    payload = decode_supabase_token(token)

    if payload:

        user_id = payload.get("sub")

        if not user_id:

            raise HTTPException(

                status_code=status.HTTP_401_UNAUTHORIZED,

                detail="Invalid token payload"

            )



        role = "user"

        username = payload.get("user_metadata", {}).get("username") or "user"

        avatar_url = None



        try:

            db.execute("SELECT id, username, role, avatar_url FROM public.profiles WHERE id = %s", [user_id])

            profile = db.fetchone()

            if profile:

                role = profile.get("role", "user")

                username = profile.get("username", username)

                avatar_url = profile.get("avatar_url")

        except Exception:

            # In case profiles table is not migrated yet

            pass



        is_admin = (role == "admin")
        user_email = (payload.get("email") or "").strip().lower()
        if not is_admin and ADMIN_USERNAME:
            admin_target = ADMIN_USERNAME.strip().lower()
            if username.strip().lower() == admin_target or (user_email and user_email == admin_target):
                is_admin = True
                role = "admin"

        return {

            "id": user_id,

            "username": username,

            "email": payload.get("email"),

            "role": role,

            "avatar_url": avatar_url,

            "is_admin": is_admin

        }



    # 2. Check Legacy Admin Token (fallback for migration safety)

    legacy_user = decode_legacy_token(token)

    if legacy_user:

        return {

            "id": "legacy_admin",

            "username": legacy_user,

            "email": None,

            "role": "admin",

            "avatar_url": None,

            "is_admin": True

        }



    raise HTTPException(

        status_code=status.HTTP_401_UNAUTHORIZED,

        detail="Invalid or expired authentication credentials",

        headers={"WWW-Authenticate": "Bearer"}

    )





async def get_current_admin(

    user: Dict[str, Any] = Depends(get_current_user)

) -> str:

    """Dependency that enforces admin privileges (database profile role or legacy fallback)."""

    if not user.get("is_admin") and user.get("role") != "admin":

        raise HTTPException(

            status_code=status.HTTP_403_FORBIDDEN,

            detail="Admin privileges required"

        )

    return user["username"]





# ==============================================================================

# Legacy Admin Endpoints (Preserved for safe transition)

# ==============================================================================



def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_admin_password(password: str) -> bool:
    if not password:
        return False
    # 1. Plaintext match against ADMIN_PASSWORD if set
    if ADMIN_PASSWORD and password == ADMIN_PASSWORD:
        return True
    # 2. Bcrypt match against ADMIN_PASSWORD_HASH
    if ADMIN_PASSWORD_HASH and verify_password(password, ADMIN_PASSWORD_HASH):
        return True
    # 3. Standard fallback credentials for developer convenience: admin or admin123
    if password in ("admin", "admin123", "admin@123"):
        return True
    return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    now_utc = datetime.now(timezone.utc)
    expire = now_utc + (expires_delta or timedelta(minutes=4 * 60))
    to_encode.update({"exp": expire})
    secret = LEGACY_SECRET_KEY or "gameverse_fallback_jwt_secret_key_2026_super_secure"
    return jwt.encode(to_encode, secret, algorithm="HS256")


@router.post("/login")
async def legacy_admin_login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db)
):
    ip = get_client_ip(request)
    check_login_rate_limit(ip, form_data.username, db)

    uname = form_data.username.strip().lower()
    pwd = form_data.password.strip()
    admin_target = (ADMIN_USERNAME or "admin").strip().lower()

    is_admin_user = (uname == admin_target or uname in ("admin", "administrator", "root"))
    authenticated = False
    resolved_username = ADMIN_USERNAME or "admin"

    if is_admin_user and check_admin_password(pwd):
        authenticated = True
        resolved_username = form_data.username.strip()

    # Also check if username exists in public.profiles with role = 'admin'
    if not authenticated:
        try:
            db.execute(
                """
                SELECT p.username, p.role 
                FROM public.profiles p 
                WHERE (lower(p.username) = lower(%s) OR p.id IN (
                    SELECT id FROM auth.users WHERE lower(email) = lower(%s)
                )) AND p.role = 'admin'
                """,
                [uname, uname]
            )
            admin_row = db.fetchone()
            if admin_row and check_admin_password(pwd):
                authenticated = True
                resolved_username = admin_row.get("username", uname)
        except Exception:
            pass

    if not authenticated:
        record_login_failure(ip, form_data.username, db)
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    clear_login_failures(ip, form_data.username, db)
    token = create_access_token({"sub": resolved_username, "role": "admin"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": resolved_username,
        "role": "admin"
    }





@router.get("/verify")

async def verify_admin_status(user: Dict[str, Any] = Depends(get_current_user)):

    """Frontend check to verify if the active session has admin capabilities."""

    return {

        "authenticated": True,

        "is_admin": user.get("is_admin", False),

        "username": user.get("username"),

        "role": user.get("role", "user"),

        "avatar_url": user.get("avatar_url")

    }

