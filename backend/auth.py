import hashlib
import hmac
import logging
import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import bcrypt
import httpx
import jwt
import psycopg
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordRequestForm
from jwt.exceptions import PyJWTError

from database import get_db

_logger = logging.getLogger("gameverse.auth")

_backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_backend_dir, ".env"))
load_dotenv()


def _clean_env(val: Optional[str]) -> str:
    if not val:
        return ""
    val = val.strip()
    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
        val = val[1:-1].strip()
    return val


# --- Configuration (strictly from environment, zero hardcoded secrets/fallbacks) ---
SUPABASE_URL = _clean_env(os.getenv("SUPABASE_URL")).rstrip("/")
if not SUPABASE_URL:
    _db_url = _clean_env(os.getenv("DATABASE_URL"))
    _match = re.search(r"(?:postgres|db)\.([a-z0-9]+)", _db_url)
    if _match:
        SUPABASE_URL = f"https://{_match.group(1)}.supabase.co"

SUPABASE_ANON_KEY = _clean_env(os.getenv("SUPABASE_ANON_KEY"))
SUPABASE_SECRET_KEY = _clean_env(os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
SUPABASE_JWT_SECRET = _clean_env(os.getenv("SUPABASE_JWT_SECRET"))

JWT_SECRET = _clean_env(os.getenv("JWT_SECRET"))
ADMIN_JWT_SECRET = _clean_env(os.getenv("ADMIN_JWT_SECRET"))
ADMIN_JWT_ISSUER = _clean_env(os.getenv("ADMIN_JWT_ISSUER")) or "gameverse-admin"
ADMIN_JWT_AUDIENCE = _clean_env(os.getenv("ADMIN_JWT_AUDIENCE")) or "gameverse-admin"
ADMIN_TOKEN_TYPE = "gameverse_admin"

ADMIN_USERNAME = _clean_env(os.getenv("ADMIN_USERNAME"))
ADMIN_EMAIL = _clean_env(os.getenv("ADMIN_EMAIL"))
ADMIN_PASSWORD_HASH = _clean_env(os.getenv("ADMIN_PASSWORD_HASH"))
ADMIN_PASSWORD = _clean_env(os.getenv("ADMIN_PASSWORD"))

_INSECURE_SECRET_MARKERS = {
    "gameverse_fallback_jwt_secret_key_2026_super_secure",
    "[generated-random-hex]",
    "changeme",
    "secret",
    "jwt_secret",
    "default",
    "password",
}
_INSECURE_USERNAME_MARKERS = {
    "pick-a-name-that-is-not-admin",
    "[admin-username]",
}
_INSECURE_HASH_MARKERS = {
    "[generated-bcrypt-hash]",
}


def _derive_admin_signing_key() -> bytes:
    """Return dedicated HMAC key for admin JWTs, separated from any Supabase JWT secret."""
    if ADMIN_JWT_SECRET:
        return ADMIN_JWT_SECRET.encode("utf-8")
    # Domain-separate from JWT_SECRET so admin tokens and any HS256 user tokens never share a key
    return hmac.new(JWT_SECRET.encode("utf-8"), b"gameverse:admin-jwt:v1", hashlib.sha256).digest()


def validate_auth_config() -> None:
    """Fail loudly at startup if required auth secrets/credentials are missing or insecure."""
    signing_secret = ADMIN_JWT_SECRET or JWT_SECRET
    if not signing_secret:
        raise RuntimeError(
            "JWT_SECRET (or ADMIN_JWT_SECRET) is not set. Configure a strong >=32-char secret in "
            "backend/.env or Vercel Environment Variables."
        )
    if len(signing_secret) < 32 or signing_secret.lower() in _INSECURE_SECRET_MARKERS:
        raise RuntimeError(
            "JWT_SECRET / ADMIN_JWT_SECRET is insecure or shorter than 32 characters. "
            "Set a strong random secret in backend/.env or Vercel Environment Variables."
        )
    if ADMIN_JWT_SECRET and SUPABASE_JWT_SECRET and hmac.compare_digest(ADMIN_JWT_SECRET, SUPABASE_JWT_SECRET):
        raise RuntimeError(
            "ADMIN_JWT_SECRET and SUPABASE_JWT_SECRET must be distinct values."
        )

    if not ADMIN_USERNAME or ADMIN_USERNAME.lower() in _INSECURE_USERNAME_MARKERS:
        raise RuntimeError(
            "ADMIN_USERNAME is not set (or uses placeholder text). Set ADMIN_USERNAME in "
            "backend/.env or Vercel Environment Variables."
        )

    if not ADMIN_PASSWORD_HASH and not ADMIN_PASSWORD:
        raise RuntimeError(
            "Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is set. Configure ADMIN_PASSWORD_HASH "
            "in backend/.env or Vercel Environment Variables."
        )

    if ADMIN_PASSWORD_HASH:
        if ADMIN_PASSWORD_HASH.lower() in _INSECURE_HASH_MARKERS or not (
            ADMIN_PASSWORD_HASH.startswith(("$2a$", "$2b$", "$2y$")) and len(ADMIN_PASSWORD_HASH) >= 50
        ):
            raise RuntimeError(
                "ADMIN_PASSWORD_HASH is invalid. Provide a valid bcrypt hash (e.g. $2b$12$...)."
            )


validate_auth_config()


# Pinned asymmetric signing keys from Supabase JWKS (ES256 / RS256)
PINNED_ALGORITHMS = ["ES256", "RS256"]
_jwks_client: Optional[jwt.PyJWKClient] = None


def get_jwks_client() -> Optional[jwt.PyJWKClient]:
    global _jwks_client
    if _jwks_client is None and SUPABASE_URL:
        jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = jwt.PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


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
        db.execute("DELETE FROM public.login_attempts WHERE attempted_at < now() - interval '1 day'")

        db.execute(
            "SELECT count(*) AS cnt FROM public.login_attempts WHERE ip = %s AND attempted_at > now() - interval '15 minutes'",
            [ip],
        )
        row_ip = db.fetchone()
        if row_ip and row_ip.get("cnt", 0) >= 10:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts from this network. Try again in 15 minutes.",
            )

        if identifier:
            max_attempts = 20 if identifier.strip().lower() == ADMIN_USERNAME.lower() else 15
            db.execute(
                "SELECT count(*) AS cnt FROM public.login_attempts WHERE lower(identifier) = lower(%s) AND attempted_at > now() - interval '15 minutes'",
                [identifier],
            )
            row_acc = db.fetchone()
            if row_acc and row_acc.get("cnt", 0) >= max_attempts:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many failed login attempts for this account. Try again in 15 minutes.",
                )
    except psycopg.errors.UndefinedTable:
        init_login_attempts_table(db)


def record_login_failure(ip: str, identifier: str, db) -> None:
    """Record a failed login attempt in PostgreSQL and prune entries older than 24h."""
    try:
        db.execute(
            "INSERT INTO public.login_attempts (ip, identifier) VALUES (%s, %s)",
            [ip, identifier.strip().lower() if identifier else ""],
        )
        db.execute("DELETE FROM public.login_attempts WHERE attempted_at < now() - interval '1 day'")
    except psycopg.errors.UndefinedTable:
        init_login_attempts_table(db)
        db.execute(
            "INSERT INTO public.login_attempts (ip, identifier) VALUES (%s, %s)",
            [ip, identifier.strip().lower() if identifier else ""],
        )


def clear_login_failures(ip: str, identifier: str, db) -> None:
    """Clear failed attempts upon successful authentication."""
    try:
        db.execute(
            "DELETE FROM public.login_attempts WHERE lower(identifier) = lower(%s) OR ip = %s",
            [identifier.strip().lower() if identifier else "", ip],
        )
    except Exception:
        pass


# ==============================================================================
# Token Verification (Strictly Disjoint Admin JWT vs Supabase User JWT)
# ==============================================================================

def _peek_unverified_claims(token: str) -> Optional[Dict[str, Any]]:
    """Inspect JWT payload structure without trusting signature, solely for verifier routing."""
    try:
        claims = jwt.decode(token, options={"verify_signature": False})
        return claims if isinstance(claims, dict) else None
    except PyJWTError:
        return None


def _is_admin_token_shape(claims: Optional[Dict[str, Any]]) -> bool:
    if not claims:
        return False
    return claims.get("typ") == ADMIN_TOKEN_TYPE or claims.get("iss") == ADMIN_JWT_ISSUER


def decode_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a Supabase user JWT. Never accepts admin tokens."""
    unverified = _peek_unverified_claims(token)
    if _is_admin_token_shape(unverified):
        return None

    expected_issuer = f"{SUPABASE_URL}/auth/v1" if SUPABASE_URL else None

    # 1. Asymmetric JWKS (ES256, RS256)
    client = get_jwks_client()
    if client:
        try:
            signing_key = client.get_signing_key_from_jwt(token)
            decode_kwargs: Dict[str, Any] = {
                "algorithms": PINNED_ALGORITHMS,
                "audience": "authenticated",
            }
            if expected_issuer:
                decode_kwargs["issuer"] = expected_issuer
            payload = jwt.decode(token, signing_key.key, **decode_kwargs)
            if not _is_admin_token_shape(payload):
                return payload
        except Exception:
            pass

    # 2. Dedicated SUPABASE_JWT_SECRET HS256 verification (never falls back to JWT_SECRET)
    if SUPABASE_JWT_SECRET:
        try:
            decode_kwargs = {
                "algorithms": ["HS256"],
                "audience": "authenticated",
            }
            if expected_issuer:
                decode_kwargs["issuer"] = expected_issuer
            payload = jwt.decode(token, SUPABASE_JWT_SECRET, **decode_kwargs)
            if not _is_admin_token_shape(payload):
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
                        "apikey": SUPABASE_ANON_KEY,
                    },
                )
                if res.status_code == 200:
                    user_data = res.json()
                    return {
                        "sub": user_data.get("id"),
                        "email": user_data.get("email"),
                        "user_metadata": user_data.get("user_metadata", {}),
                    }
        except Exception as e:
            _logger.debug("Supabase REST auth fallback error: %s", type(e).__name__)

    return None


def decode_admin_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify a server-signed GameVerse admin JWT with strict claims and dedicated key."""
    try:
        payload = jwt.decode(
            token,
            _derive_admin_signing_key(),
            algorithms=["HS256"],
            audience=ADMIN_JWT_AUDIENCE,
            issuer=ADMIN_JWT_ISSUER,
            options={"require": ["exp", "iat", "sub", "typ", "role"]},
        )
    except PyJWTError:
        return None

    if payload.get("typ") != ADMIN_TOKEN_TYPE or payload.get("role") != "admin":
        return None
    sub = payload.get("sub")
    if not isinstance(sub, str) or not sub.strip():
        return None
    return payload


def decode_legacy_token(token: str) -> Optional[str]:
    """Compatibility wrapper returning the verified admin username or None."""
    payload = decode_admin_token(token)
    return payload.get("sub") if payload else None


async def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db=Depends(get_db),
) -> Dict[str, Any]:
    """Extract and verify the authenticated user or admin from Bearer token (fail closed)."""
    if not creds or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = creds.credentials
    unverified = _peek_unverified_claims(token)
    if not unverified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Disjoint verification path: admin tokens and Supabase user tokens never cross over.
    if _is_admin_token_shape(unverified):
        admin_payload = decode_admin_token(token)
        if not admin_payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {
            "id": "legacy_admin",
            "username": admin_payload["sub"],
            "email": None,
            "role": "admin",
            "avatar_url": None,
            "is_admin": True,
        }

    payload = decode_supabase_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload["sub"]
    role = "user"
    username = (payload.get("user_metadata") or {}).get("username") or "user"
    avatar_url = None

    try:
        db.execute("SELECT id, username, role, avatar_url FROM public.profiles WHERE id = %s", [user_id])
        profile = db.fetchone()
        if profile:
            role = profile.get("role", "user")
            username = profile.get("username", username)
            avatar_url = profile.get("avatar_url")
    except Exception:
        # Fail closed: if DB profile lookup fails, role remains "user"
        role = "user"

    is_admin = (role == "admin")
    return {
        "id": user_id,
        "username": username,
        "email": payload.get("email"),
        "role": "admin" if is_admin else "user",
        "avatar_url": avatar_url,
        "is_admin": is_admin,
    }


async def get_current_admin(
    user: Dict[str, Any] = Depends(get_current_user),
) -> str:
    """Enforce admin privileges on the verified server-side identity."""
    if user.get("is_admin") is not True or user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user["username"]


# ==============================================================================
# Admin Credential Verification & Login
# ==============================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_admin_password(password: str) -> bool:
    if not password:
        return False
    if ADMIN_PASSWORD and hmac.compare_digest(password, ADMIN_PASSWORD):
        return True
    if ADMIN_PASSWORD_HASH and verify_password(password, ADMIN_PASSWORD_HASH):
        return True
    return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {k: v for k, v in data.items() if k not in ("typ", "iss", "aud", "role", "iat", "exp", "jti")}
    now_utc = datetime.now(timezone.utc)
    expire = now_utc + (expires_delta or timedelta(minutes=4 * 60))
    to_encode.update({
        "typ": ADMIN_TOKEN_TYPE,
        "iss": ADMIN_JWT_ISSUER,
        "aud": ADMIN_JWT_AUDIENCE,
        "role": "admin",
        "jti": secrets.token_hex(16),
        "iat": now_utc,
        "exp": expire,
    })
    return jwt.encode(to_encode, _derive_admin_signing_key(), algorithm="HS256")


@router.post("/login")
async def legacy_admin_login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db=Depends(get_db),
):
    ip = get_client_ip(request)
    check_login_rate_limit(ip, form_data.username, db)

    uname = form_data.username.strip().lower()
    pwd = form_data.password.strip()
    admin_target = ADMIN_USERNAME.strip().lower()
    admin_email_target = ADMIN_EMAIL.strip().lower() if ADMIN_EMAIL else ""

    is_admin_user = (
        uname == admin_target
        or (bool(admin_email_target) and uname == admin_email_target)
    )
    authenticated = False
    resolved_username = ADMIN_USERNAME

    if is_admin_user and check_admin_password(pwd):
        authenticated = True
        resolved_username = form_data.username.strip()

    # Also support DB profiles explicitly marked role = 'admin'
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
                [uname, uname],
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
    token = create_access_token({"sub": resolved_username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": resolved_username,
        "role": "admin",
    }


@router.get("/verify")
async def verify_admin_status(user: Dict[str, Any] = Depends(get_current_user)):
    """Frontend check to verify the active session identity and capabilities."""
    return {
        "authenticated": True,
        "is_admin": bool(user.get("is_admin", False)),
        "username": user.get("username"),
        "role": user.get("role", "user"),
        "avatar_url": user.get("avatar_url"),
    }
