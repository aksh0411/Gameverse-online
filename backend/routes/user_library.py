import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
import psycopg

from database import get_db
from auth import get_current_user

_logger = logging.getLogger("gameverse.user_library")

router = APIRouter(prefix="/api/me", tags=["User Library"])

VALID_STATUSES = {
    "playing", "completed", "backlog", "dropped", 
    "play_later", "not_started", "wont_play"
}


class ProfileUpdateRequest(BaseModel):
    avatar_url: Optional[str] = Field(None, max_length=500)


class UserGameUpdate(BaseModel):
    is_favorite: Optional[bool] = None
    is_bookmarked: Optional[bool] = None
    status: Optional[str] = Field(None, description="One of: playing, completed, backlog, dropped, play_later, not_started, wont_play")
    rating: Optional[int] = Field(None, ge=1, le=10, description="Rating from 1 to 10")


@router.get("/profile")
def get_user_profile(
    user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Fetch the authenticated user's profile information."""
    try:
        db.execute(
            "SELECT id, username, role, avatar_url, created_at FROM public.profiles WHERE id = %s",
            [user["id"]]
        )
        row = db.fetchone()
        if row:
            res = dict(row)
            res["email"] = user.get("email")
            return res
    except Exception:
        pass

    return {
        "id": user["id"],
        "username": user["username"],
        "email": user.get("email"),
        "role": user.get("role", "user"),
        "avatar_url": user.get("avatar_url")
    }


@router.patch("/profile")
def update_user_profile(
    body: ProfileUpdateRequest,
    user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update authenticated user's profile information (e.g. gamer avatar)."""
    if user.get("id") == "legacy_admin":
        return {"status": "ok", "avatar_url": body.avatar_url}

    user_id = user["id"]
    try:
        db.execute(
            """
            INSERT INTO public.profiles (id, username, role, avatar_url)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE
            SET avatar_url = EXCLUDED.avatar_url
            RETURNING id, username, role, avatar_url
            """,
            [user_id, user.get("username", "User"), user.get("role", "user"), body.avatar_url]
        )
        row = db.fetchone()
        if row:
            res = dict(row)
            res["email"] = user.get("email")
            return res
    except Exception as e:
        _logger.error("Failed to update profile: %s", e)
        raise HTTPException(status_code=500, detail="Failed to update profile")

    return {"status": "ok", "avatar_url": body.avatar_url}


@router.get("/games")
def get_user_games(
    status: Optional[str] = Query(None, description="Filter by status (playing, completed, backlog, dropped, play_later, not_started)"),
    favorite: Optional[bool] = Query(None, description="Filter favorites"),
    bookmarked: Optional[bool] = Query(None, description="Filter bookmarks"),
    user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Retrieve the logged-in user's personal game library.
    Filters strictly by the user_id extracted from the verified token.
    """
    user_id = user["id"]
    if user_id == "legacy_admin":
        return {"games": [], "count": 0}
    query = """
        SELECT 
            ug.game_id,
            ug.game_id AS id,
            ug.is_favorite,
            ug.is_bookmarked,
            ug.status,
            ug.rating,
            ug.updated_at,
            g.game_name,
            g.game_name AS name,
            g.cover_image,
            g.price,
            g.is_free_to_play,
            g.rating AS global_rating,
            d.developer_name AS developer,
            p.publisher_name AS publisher
        FROM public.user_games ug
        JOIN public.games g ON ug.game_id = g.game_id
        LEFT JOIN public.developers d ON g.developer_id = d.developer_id
        LEFT JOIN public.publishers p ON g.publisher_id = p.publisher_id
        WHERE ug.user_id = %s
    """
    params = [user_id]

    if status:
        query += " AND ug.status = %s"
        params.append(status.lower())

    if favorite is not None:
        query += " AND ug.is_favorite = %s"
        params.append(favorite)

    if bookmarked is not None:
        query += " AND ug.is_bookmarked = %s"
        params.append(bookmarked)

    query += " ORDER BY ug.updated_at DESC"

    try:
        db.execute(query, params)
        rows = db.fetchall()
        return {"games": rows, "count": len(rows)}
    except psycopg.errors.UndefinedTable:
        # Table not migrated yet
        return {"games": [], "count": 0}


@router.put("/games/{game_id}")
def upsert_user_game(
    game_id: int,
    body: UserGameUpdate,
    user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Upsert personal game status, favorite flag, or rating.
    Always updates `updated_at = now()` on conflict.
    """
    user_id = user["id"]
    if user_id == "legacy_admin":
        return {"success": True, "entry": {"game_id": game_id}}

    if body.status is not None and body.status.lower() not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{body.status}'. Must be one of: {', '.join(sorted(VALID_STATUSES))}"
        )

    # 1. Verify that the game actually exists in public.games
    db.execute("SELECT game_id FROM public.games WHERE game_id = %s", [game_id])
    if not db.fetchone():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")

    status_val = body.status.lower() if body.status else None

    # 2. Upsert with updated_at = now()
    upsert_sql = """
        INSERT INTO public.user_games (
            user_id,
            game_id,
            is_favorite,
            is_bookmarked,
            status,
            rating,
            updated_at
        ) VALUES (
            %s,
            %s,
            COALESCE(%s, false),
            COALESCE(%s, false),
            %s,
            %s,
            now()
        )
        ON CONFLICT (user_id, game_id) DO UPDATE SET
            is_favorite = COALESCE(EXCLUDED.is_favorite, public.user_games.is_favorite),
            is_bookmarked = COALESCE(EXCLUDED.is_bookmarked, public.user_games.is_bookmarked),
            status = COALESCE(EXCLUDED.status, public.user_games.status),
            rating = COALESCE(EXCLUDED.rating, public.user_games.rating),
            updated_at = now()
        RETURNING user_id, game_id, is_favorite, is_bookmarked, status, rating, updated_at;
    """

    try:
        db.execute(
            upsert_sql,
            [user_id, game_id, body.is_favorite, body.is_bookmarked, status_val, body.rating]
        )
        saved = db.fetchone()
        return {"success": True, "entry": saved}
    except psycopg.errors.UndefinedTable:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="User library database table has not been initialized yet"
        )


@router.delete("/games/{game_id}")
def remove_user_game(
    game_id: int,
    user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Remove a game entry from the user's personal library."""
    user_id = user["id"]
    if user_id == "legacy_admin":
        return {"success": True, "game_id": game_id}
    try:
        db.execute(
            "DELETE FROM public.user_games WHERE user_id = %s AND game_id = %s RETURNING game_id",
            [user_id, game_id]
        )
        deleted = db.fetchone()
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in your library")
        return {"success": True, "game_id": game_id}
    except psycopg.errors.UndefinedTable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Library table not initialized")
