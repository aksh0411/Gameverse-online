from fastapi import APIRouter, Depends, HTTPException
from database import get_db
import psycopg

router = APIRouter(prefix="/api/platforms", tags=["Platforms"])

@router.get("")
def get_platforms(db = Depends(get_db)):
    try:
        db.execute("SELECT platform_id, platform_name, platform_id AS id, platform_name AS name FROM platforms ORDER BY platform_name")
        return db.fetchall()
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
