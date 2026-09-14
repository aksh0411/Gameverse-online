from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth import get_current_admin
import psycopg

router = APIRouter(prefix="/api/publishers", tags=["Publishers"])

class PublisherCreate(BaseModel):
    publisher_name: str
    country: Optional[str] = None

@router.get("")
def get_publishers(db = Depends(get_db)):
    try:
        db.execute("SELECT publisher_id, publisher_name, country, publisher_id AS id, publisher_name AS name FROM publishers ORDER BY publisher_name")
        return db.fetchall()
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
def create_publisher(pub: PublisherCreate, admin: str = Depends(get_current_admin), db = Depends(get_db)):
    try:
        db.execute(
            "INSERT INTO publishers (publisher_name, country) VALUES (%s, %s) RETURNING publisher_id",
            [pub.publisher_name, pub.country]
        )
        pub_id = db.fetchone()['publisher_id']
        return {"publisher_id": pub_id, "id": pub_id, "message": "Publisher created successfully"}
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

