import time
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth import get_current_admin
import psycopg

router = APIRouter(prefix="/api/developers", tags=["Developers"])

_cache = None
_cache_time = 0
CACHE_TTL = 3600  # 1 hour in-memory cache

class DeveloperCreate(BaseModel):
    developer_name: str
    country: Optional[str] = None
    founded_year: Optional[int] = None

@router.get("")
def get_developers(db = Depends(get_db)):
    global _cache, _cache_time
    now = time.time()
    if _cache is not None and (now - _cache_time) < CACHE_TTL:
        return JSONResponse(
            content=_cache,
            headers={"Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"}
        )
    try:
        db.execute("SELECT developer_id, developer_name, country, founded_year, developer_id AS id, developer_name AS name FROM developers ORDER BY developer_name")
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
def create_developer(dev: DeveloperCreate, admin: str = Depends(get_current_admin), db = Depends(get_db)):
    global _cache
    try:
        db.execute(
            "INSERT INTO developers (developer_name, country, founded_year) VALUES (%s, %s, %s) RETURNING developer_id",
            [dev.developer_name, dev.country, dev.founded_year]
        )
        dev_id = db.fetchone()['developer_id']
        _cache = None  # Invalidate cache
        return {"developer_id": dev_id, "id": dev_id, "message": "Developer created successfully"}
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
