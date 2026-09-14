from fastapi import APIRouter, Depends, HTTPException
from database import get_db
import psycopg

router = APIRouter(prefix="/api/genres", tags=["Genres"])

@router.get("")
def get_genres(db = Depends(get_db)):
    try:
        db.execute("SELECT genre_id, genre_name, genre_id AS id, genre_name AS name FROM genres ORDER BY genre_name")
        return db.fetchall()
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
