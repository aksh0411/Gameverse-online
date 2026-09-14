from fastapi import APIRouter, Depends, HTTPException
from database import get_db
import psycopg

router = APIRouter(prefix="/api/stats", tags=["Stats"])

@router.get("")
def get_stats(db = Depends(get_db)):
    try:
        db.execute("""
            SELECT 
                COUNT(*) as total_games,
                COUNT(*) FILTER (WHERE LOWER(play_status) = 'playing') as playing,
                COUNT(*) FILTER (WHERE LOWER(play_status) = 'completed') as completed,
                COUNT(*) FILTER (WHERE is_bookmarked = true) as bookmarked,
                COUNT(*) FILTER (WHERE is_favorited = true) as favorited
            FROM games
        """)
        row = db.fetchone()
        if not row:
            return {
                "total_games": 0, "playing": 0, "completed": 0, "bookmarked": 0, "favorited": 0
            }
        if isinstance(row, dict):
            return {
                "total_games": row.get('total_games', 0),
                "playing": row.get('playing', 0),
                "completed": row.get('completed', 0),
                "bookmarked": row.get('bookmarked', 0),
                "favorited": row.get('favorited', 0)
            }
        else:
            return {
                "total_games": row[0] or 0,
                "playing": row[1] or 0,
                "completed": row[2] or 0,
                "bookmarked": row[3] or 0,
                "favorited": row[4] or 0
            }
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

