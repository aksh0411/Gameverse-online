from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth import get_current_admin
import psycopg

router = APIRouter(prefix="/api/developers", tags=["Developers"])

class DeveloperCreate(BaseModel):
    developer_name: str
    country: Optional[str] = None
    founded_year: Optional[int] = None

@router.get("")
def get_developers(db = Depends(get_db)):
    try:
        db.execute("SELECT developer_id, developer_name, country, founded_year, developer_id AS id, developer_name AS name FROM developers ORDER BY developer_name")
        return db.fetchall()
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
def create_developer(dev: DeveloperCreate, admin: str = Depends(get_current_admin), db = Depends(get_db)):
    try:
        db.execute(
            "INSERT INTO developers (developer_name, country, founded_year) VALUES (%s, %s, %s) RETURNING developer_id",
            [dev.developer_name, dev.country, dev.founded_year]
        )
        dev_id = db.fetchone()['developer_id']
        return {"developer_id": dev_id, "id": dev_id, "message": "Developer created successfully"}
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

