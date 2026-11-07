import time
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from database import get_db
import psycopg

router = APIRouter(prefix="/api/genres", tags=["Genres"])

_cache = None
_cache_time = 0
CACHE_TTL = 3600  # 1 hour in-memory cache

@router.get("")
def get_genres(db = Depends(get_db)):
    global _cache, _cache_time
    now = time.time()
    if _cache is not None and (now - _cache_time) < CACHE_TTL:
        return JSONResponse(
            content=_cache,
            headers={"Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"}
        )
    try:
        db.execute("SELECT genre_id, genre_name, genre_id AS id, genre_name AS name FROM genres ORDER BY genre_name")
        rows = db.fetchall()
        _cache = rows
        _cache_time = now
        return JSONResponse(
            content=rows,
            headers={"Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"}
        )
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
