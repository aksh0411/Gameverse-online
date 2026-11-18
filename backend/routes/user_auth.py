import os
import re
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import httpx
import psycopg

from database import get_db
from auth import (
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SECRET_KEY,
    get_client_ip,
    check_login_rate_limit,
    record_login_failure,
    clear_login_failures
)

_logger = logging.getLogger("gameverse.user_auth")

router = APIRouter(prefix="/api/auth", tags=["User Authentication"])

RESERVED_USERNAMES = {
    "admin", "administrator", "gameverse", "support",
    "moderator", "mod", "root", "staff", "system", "owner"
}

USERNAME_REGEX = re.compile(r"^[A-Za-z]{4,20}$")


class LoginRequest(BaseModel):
    identifier: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=1)


class ForgotRequest(BaseModel):
    identifier: str = Field(..., min_length=1, max_length=255)


@router.get("/config")
def get_auth_config():
    """Returns public Supabase configuration so the frontend client can initialize."""
    return {
        "supabase_url": SUPABASE_URL,
        "supabase_anon_key": SUPABASE_ANON_KEY
    }


@router.get("/username-available")
def check_username_available(
    u: str = Query(..., min_length=1, description="Username to check"),
    db = Depends(get_db)
):
    """Live validation of username availability and format rules."""
    username = u.strip()

    if not USERNAME_REGEX.match(username):
        return {
            "available": False,
            "reason": "Username must be 4–20 characters and contain letters only (A–Z)."
        }

    if username.lower() in RESERVED_USERNAMES:
        return {
            "available": False,
            "reason": "This username is reserved."
        }

    try:
        db.execute(
            "SELECT 1 FROM public.profiles WHERE lower(username) = lower(%s)",
            [username]
        )
        if db.fetchone():
            return {
                "available": False,
                "reason": "That username is already taken."
            }
    except psycopg.errors.UndefinedTable:
        # If public.profiles is not migrated yet
        pass

    return {
        "available": True,
        "reason": None
    }


@router.post("/login")
async def user_login(
    request: Request,
    body: LoginRequest,
    db = Depends(get_db)
):
    """
    Authenticate user via Email OR Username.
    Proxies to Supabase Auth with IP forwarding and Postgres-backed rate limiting.
    """
    ip = get_client_ip(request)
    ident = body.identifier.strip()
    if not ident or not body.password:
        raise HTTPException(status_code=400, detail="Identifier and password required")

    # 1. Enforce PostgreSQL rate limiting (both IP-based and account-based)
    check_login_rate_limit(ip, ident, db)

    # 2. Resolve username to email if identifier has no '@'
    if "@" in ident:
        email = ident.lower()
    else:
        try:
            db.execute(
                """
                SELECT u.email 
                FROM auth.users u 
                JOIN public.profiles p ON p.id = u.id 
                WHERE lower(p.username) = lower(%s)
                """,
                [ident]
            )
            row = db.fetchone()
            if not row or not row.get("email"):
                record_login_failure(ip, ident, db)
                raise HTTPException(status_code=401, detail="Invalid credentials")
            email = row["email"]
        except psycopg.errors.UndefinedTable:
            record_login_failure(ip, ident, db)
            raise HTTPException(status_code=401, detail="Invalid credentials")

    # 3. Call Supabase Auth Token endpoint
    if not SUPABASE_URL:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_URL is not configured on the server"
        )

    # Use secret API key for IP forwarding when available, fallback to anon key
    auth_key = SUPABASE_SECRET_KEY or SUPABASE_ANON_KEY
    headers = {
        "apikey": auth_key,
        "Authorization": f"Bearer {auth_key}",
        "Sb-Forwarded-For": ip,
        "Content-Type": "application/json"
    }

    auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(
                auth_url,
                headers=headers,
                json={"email": email, "password": body.password}
            )
    except Exception as exc:
        _logger.error("Supabase auth request error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Authentication service unavailable"
        )

    # 4. Handle Authentication Result
    if res.status_code == 200:
        clear_login_failures(ip, ident, db)
        data = res.json()
        user_info = data.get("user", {})
        user_id = user_info.get("id")

        # Fetch profile info from database
        profile_data = {}
        if user_id:
            try:
                db.execute(
                    "SELECT username, role, avatar_url FROM public.profiles WHERE id = %s",
                    [user_id]
                )
                p_row = db.fetchone()
                if p_row:
                    profile_data = dict(p_row)
            except Exception:
                pass

        return {
            "access_token": data.get("access_token"),
            "refresh_token": data.get("refresh_token"),
            "token_type": "bearer",
            "expires_in": data.get("expires_in"),
            "user": {
                "id": user_id,
                "email": email,
                "username": profile_data.get("username") or ident,
                "role": profile_data.get("role", "user"),
                "avatar_url": profile_data.get("avatar_url")
            }
        }
    else:
        # Check if error indicates unconfirmed email
        err_body = {}
        try:
            err_body = res.json()
        except Exception:
            pass

        err_msg = (err_body.get("msg") or err_body.get("error_description") or err_body.get("error") or "").lower()
        err_code = err_body.get("error_code", "")

        if "confirm" in err_msg or err_code == "email_not_confirmed":
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "detail": "Email not confirmed. Please enter the verification code sent to your email.",
                    "email_confirmed": False,
                    "email": email
                }
            )

        # Record failure & return uniform error to avoid account enumeration
        record_login_failure(ip, ident, db)
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/forgot")
async def forgot_password(
    request: Request,
    body: ForgotRequest,
    db = Depends(get_db)
):
    """
    Initiates password recovery for email or username.
    Always returns uniform message to prevent username/email probing.
    """
    ip = get_client_ip(request)
    ident = body.identifier.strip()
    if not ident:
        raise HTTPException(status_code=400, detail="Identifier required")

    check_login_rate_limit(ip, ident, db)

    # Resolve identifier to email
    email = None
    if "@" in ident:
        email = ident.lower()
    else:
        try:
            db.execute(
                """
                SELECT u.email 
                FROM auth.users u 
                JOIN public.profiles p ON p.id = u.id 
                WHERE lower(p.username) = lower(%s)
                """,
                [ident]
            )
            row = db.fetchone()
            if row and row.get("email"):
                email = row["email"]
        except Exception:
            pass

    if email and SUPABASE_URL:
        origin = request.headers.get("origin") or str(request.base_url).rstrip("/")
        redirect_to = f"{origin}/reset-password.html"

        auth_key = SUPABASE_SECRET_KEY or SUPABASE_ANON_KEY
        headers = {
            "apikey": auth_key,
            "Authorization": f"Bearer {auth_key}",
            "Sb-Forwarded-For": ip,
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                await client.post(
                    f"{SUPABASE_URL}/auth/v1/recover",
                    headers=headers,
                    json={"email": email, "redirect_to": redirect_to}
                )
        except Exception as exc:
            _logger.error("Supabase password recovery error: %s", exc)

    return {
        "message": "If an account exists, a password reset link has been sent to the registered email."
    }
