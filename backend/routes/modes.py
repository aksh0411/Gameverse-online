from fastapi import APIRouter, Depends, HTTPException
from database import get_db
import psycopg

router = APIRouter(prefix="/api/modes", tags=["Game Modes"])

@router.get("")
def get_modes(db = Depends(get_db)):
    try:
        db.execute("SELECT mode_id, mode_name, mode_id AS id, mode_name AS name FROM gamemodes ORDER BY mode_name")
        return db.fetchall()
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
