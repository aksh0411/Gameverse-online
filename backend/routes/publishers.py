import time
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth import get_current_admin
import psycopg

router = APIRouter(prefix="/api/publishers", tags=["Publishers"])

_cache = None
_cache_time = 0
CACHE_TTL = 3600  # 1 hour in-memory cache

class PublisherCreate(BaseModel):
    publisher_name: str
    country: Optional[str] = None

@router.get("")
def get_publishers(db = Depends(get_db)):
    global _cache, _cache_time
    now = time.time()
    if _cache is not None and (now - _cache_time) < CACHE_TTL:
        return JSONResponse(
            content=_cache,
            headers={"Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"}
        )
    try:
        db.execute("SELECT publisher_id, publisher_name, country, publisher_id AS id, publisher_name AS name FROM publishers ORDER BY publisher_name")
        rows = db.fetchall()
        _cache = rows
        _cache_time = now
        return JSONResponse(
            content=rows,
            headers={"Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"}
        )
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
def create_publisher(pub: PublisherCreate, admin: str = Depends(get_current_admin), db = Depends(get_db)):
    global _cache
    try:
        db.execute(
            "INSERT INTO publishers (publisher_name, country) VALUES (%s, %s) RETURNING publisher_id",
            [pub.publisher_name, pub.country]
        )
        pub_id = db.fetchone()['publisher_id']
        _cache = None  # Invalidate cache
        return {"publisher_id": pub_id, "id": pub_id, "message": "Publisher created successfully"}
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
