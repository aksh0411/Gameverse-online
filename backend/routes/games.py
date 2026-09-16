from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from database import get_db
from auth import get_current_admin
import psycopg
import os
import shutil
import json

router = APIRouter(prefix="/api/games", tags=["Games"])

@router.get("")
def get_games(
    search: Optional[str] = None,
    genre: Optional[str] = None,
    platform: Optional[str] = None,
    status: Optional[str] = None,
    bookmarked: Optional[bool] = None,
    favorited: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500),
    db = Depends(get_db)
):
    offset = (page - 1) * limit
    
    query = """
        SELECT 
            g.game_id, g.game_name, g.game_id AS id, g.game_name AS name,
            g.description, g.release_date, g.rating, g.price, g.is_free_to_play,
            g.play_status, g.is_bookmarked, g.is_favorited, g.cover_image,
            g.game_engine, g.game_engine AS engine,
            d.developer_name, d.developer_name AS developer,
            p.publisher_name, p.publisher_name AS publisher,
            COALESCE(
                (SELECT array_agg(genre_name) 
                 FROM genres gn JOIN gamegenres gg ON gn.genre_id = gg.genre_id 
                 WHERE gg.game_id = g.game_id), '{}'
            ) AS genres,
            COALESCE(
                (SELECT array_agg(platform_name) 
                 FROM platforms pl JOIN gameplatforms gp ON pl.platform_id = gp.platform_id 
                 WHERE gp.game_id = g.game_id), '{}'
            ) AS platforms
        FROM games g
        LEFT JOIN developers d ON g.developer_id = d.developer_id
        LEFT JOIN publishers p ON g.publisher_id = p.publisher_id
        WHERE 1=1
    """
    
    params = []
    
    if search:
        query += """ AND (
            g.game_name ILIKE %s
            OR EXISTS (
                SELECT 1 FROM gamegenres gg 
                JOIN genres gn ON gg.genre_id = gn.genre_id 
                WHERE gg.game_id = g.game_id AND gn.genre_name ILIKE %s
            )
            OR EXISTS (
                SELECT 1 FROM gameplatforms gp 
                JOIN platforms pl ON gp.platform_id = pl.platform_id 
                WHERE gp.game_id = g.game_id AND pl.platform_name ILIKE %s
            )
            OR d.developer_name ILIKE %s
        )"""
        s_param = f"%{search}%"
        params.extend([s_param, s_param, s_param, s_param])
    
    if status:
        query += " AND g.play_status = %s"
        params.append(status)
        
    if bookmarked is not None:
        query += " AND g.is_bookmarked = %s"
        params.append(bookmarked)
        
    if favorited is not None:
        query += " AND g.is_favorited = %s"
        params.append(favorited)
        
    if genre:
        query += """ AND EXISTS (
            SELECT 1 FROM gamegenres gg 
            JOIN genres gn ON gg.genre_id = gn.genre_id 
            WHERE gg.game_id = g.game_id AND gn.genre_name ILIKE %s
        )"""
        params.append(f"%{genre}%")
        
    if platform:
        query += """ AND EXISTS (
            SELECT 1 FROM gameplatforms gp 
            JOIN platforms pl ON gp.platform_id = pl.platform_id 
            WHERE gp.game_id = g.game_id AND pl.platform_name ILIKE %s
        )"""
        params.append(f"%{platform}%")
        
    query += " ORDER BY g.game_id DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    try:
        db.execute(query, params)
        games = db.fetchall()
        
        # Count total
        count_query = "SELECT COUNT(*) as total FROM games g LEFT JOIN developers d ON g.developer_id = d.developer_id WHERE 1=1"
        count_params = []
        if search:
            count_query += """ AND (
                g.game_name ILIKE %s
                OR EXISTS (
                    SELECT 1 FROM gamegenres gg 
                    JOIN genres gn ON gg.genre_id = gn.genre_id 
                    WHERE gg.game_id = g.game_id AND gn.genre_name ILIKE %s
                )
                OR EXISTS (
                    SELECT 1 FROM gameplatforms gp 
                    JOIN platforms pl ON gp.platform_id = pl.platform_id 
                    WHERE gp.game_id = g.game_id AND pl.platform_name ILIKE %s
                )
                OR d.developer_name ILIKE %s
            )"""
            s_param = f"%{search}%"
            count_params.extend([s_param, s_param, s_param, s_param])
        if status:
            count_query += " AND g.play_status = %s"
            count_params.append(status)
        if bookmarked is not None:
            count_query += " AND g.is_bookmarked = %s"
            count_params.append(bookmarked)
        if favorited is not None:
            count_query += " AND g.is_favorited = %s"
            count_params.append(favorited)
        if genre:
            count_query += " AND EXISTS (SELECT 1 FROM gamegenres gg JOIN genres gn ON gg.genre_id = gn.genre_id WHERE gg.game_id = g.game_id AND gn.genre_name ILIKE %s)"
            count_params.append(f"%{genre}%")
        if platform:
            count_query += " AND EXISTS (SELECT 1 FROM gameplatforms gp JOIN platforms pl ON gp.platform_id = pl.platform_id WHERE gp.game_id = g.game_id AND pl.platform_name ILIKE %s)"
            count_params.append(f"%{platform}%")
            
        db.execute(count_query, count_params)
        total = db.fetchone()['total']
        
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "games": games
        }
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{game_id}")
def get_game(game_id: int, db = Depends(get_db)):
    try:
        db.execute("SELECT * FROM games WHERE game_id = %s", [game_id])
        game = db.fetchone()
        
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
            
        # Get developer
        if game['developer_id']:
            db.execute("SELECT developer_name, country, founded_year FROM developers WHERE developer_id = %s", [game['developer_id']])
            game['developer'] = db.fetchone()
        else:
            game['developer'] = None
            
        # Get publisher
        if game['publisher_id']:
            db.execute("SELECT publisher_name, country FROM publishers WHERE publisher_id = %s", [game['publisher_id']])
            game['publisher'] = db.fetchone()
        else:
            game['publisher'] = None
            
        # Get genres
        db.execute("""
            SELECT gn.genre_name FROM genres gn 
            JOIN gamegenres gg ON gn.genre_id = gg.genre_id 
            WHERE gg.game_id = %s
        """, [game_id])
        game['genres'] = [row['genre_name'] for row in db.fetchall()]
        
        # Get platforms
        db.execute("""
            SELECT pl.platform_name FROM platforms pl 
            JOIN gameplatforms gp ON pl.platform_id = gp.platform_id 
            WHERE gp.game_id = %s
        """, [game_id])
        game['platforms'] = [row['platform_name'] for row in db.fetchall()]
        
        # Get modes
        db.execute("""
            SELECT m.mode_name FROM gamemodes m 
            JOIN gamemodesrelation gmr ON m.mode_id = gmr.mode_id 
            WHERE gmr.game_id = %s
        """, [game_id])
        game['modes'] = [row['mode_name'] for row in db.fetchall()]
        
        # Get story types
        db.execute("""
            SELECT st.story_type FROM storytypes st 
            JOIN gamestory gs ON st.story_id = gs.story_id 
            WHERE gs.game_id = %s
        """, [game_id])
        game['story_types'] = [row['story_type'] for row in db.fetchall()]
        
        # Get system requirements
        db.execute("""
            SELECT operating_system, minimum_cpu, minimum_gpu, minimum_ram, minimum_storage,
                   recommended_cpu, recommended_gpu, recommended_ram, recommended_storage
            FROM systemrequirements WHERE game_id = %s
        """, [game_id])
        sys_req = db.fetchone()
        game['system_requirements'] = sys_req
        
        # Populate aliases and flattened fields for frontend convenience
        game['id'] = game.get('game_id')
        game['name'] = game.get('game_name')
        game['engine'] = game.get('game_engine')
        if game.get('developer'):
            game['developer']['name'] = game['developer'].get('developer_name')
            game['developer']['id'] = game['developer'].get('developer_id')
        if game.get('publisher'):
            game['publisher']['name'] = game['publisher'].get('publisher_name')
            game['publisher']['id'] = game['publisher'].get('publisher_id')
        if sys_req:
            for k, v in sys_req.items():
                if k not in game:
                    game[k] = v
        
        return game
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
def create_game(
    game_name: str = Form(...),
    description: Optional[str] = Form(None),
    detailed_description: Optional[str] = Form(None),
    developer_id: Optional[int] = Form(None),
    publisher_id: Optional[int] = Form(None),
    release_date: Optional[str] = Form(None),
    rating: Optional[float] = Form(None),
    price: Optional[float] = Form(None),
    is_free_to_play: bool = Form(False),
    play_status: str = Form('not_started'),
    is_bookmarked: bool = Form(False),
    is_favorited: bool = Form(False),
    game_engine: Optional[str] = Form(None),
    genre_ids: str = Form("[]"),
    platform_ids: str = Form("[]"),
    mode_ids: str = Form("[]"),
    story_type_ids: str = Form("[]"),
    sys_req: str = Form("{}"),
    cover_image: Optional[UploadFile] = File(None),
    admin: str = Depends(get_current_admin),
    db = Depends(get_db)
):
    try:
        conn = db.connection
        with conn.transaction():
            # Handle image upload
            image_path = None
            if cover_image:
                frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend")
                img_dir = os.path.join(frontend_path, "static", "images")
                os.makedirs(img_dir, exist_ok=True)
                file_ext = os.path.splitext(cover_image.filename)[1]
                file_name = f"{game_name.replace(' ', '_').lower()}_{int(os.path.getmtime(img_dir) if os.path.exists(img_dir) else 0)}{file_ext}"
                full_path = os.path.join(img_dir, file_name)
                with open(full_path, "wb") as buffer:
                    shutil.copyfileobj(cover_image.file, buffer)
                image_path = f"/static/images/{file_name}"
            
            # Ensure sequence is synchronized
            db.execute("""
                SELECT setval(
                    pg_get_serial_sequence('games', 'game_id'), 
                    COALESCE((SELECT MAX(game_id) FROM games), 0) + 1, 
                    false
                )
            """)

            # Insert game
            query = """
                INSERT INTO games (
                    game_name, description, detailed_description, developer_id, publisher_id, release_date, 
                    rating, price, is_free_to_play, play_status, is_bookmarked, 
                    is_favorited, game_engine, cover_image
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                ) RETURNING game_id
            """
            
            # handle empty string for release_date
            rd = release_date if release_date else None
            
            db.execute(query, [
                game_name, description, detailed_description, developer_id, publisher_id, rd,
                rating, price, is_free_to_play, play_status, is_bookmarked,
                is_favorited, game_engine, image_path
            ])
            
            game_id = db.fetchone()['game_id']
            
            # Insert junction tables
            g_ids = json.loads(genre_ids)
            for gid in g_ids:
                db.execute("INSERT INTO gamegenres (game_id, genre_id) VALUES (%s, %s)", [game_id, gid])
                
            p_ids = json.loads(platform_ids)
            for pid in p_ids:
                db.execute("INSERT INTO gameplatforms (game_id, platform_id) VALUES (%s, %s)", [game_id, pid])
                
            m_ids = json.loads(mode_ids)
            for mid in m_ids:
                db.execute("INSERT INTO gamemodesrelation (game_id, mode_id) VALUES (%s, %s)", [game_id, mid])
                
            st_ids = json.loads(story_type_ids)
            for stid in st_ids:
                db.execute("INSERT INTO gamestory (game_id, story_id) VALUES (%s, %s)", [game_id, stid])
                
            # Insert system requirements
            sr = json.loads(sys_req)
            if sr:
                db.execute("""
                    INSERT INTO systemrequirements (
                        game_id, operating_system, minimum_cpu, minimum_gpu, minimum_ram, minimum_storage,
                        recommended_cpu, recommended_gpu, recommended_ram, recommended_storage
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    game_id, sr.get('operating_system'), sr.get('minimum_cpu'), sr.get('minimum_gpu'),
                    sr.get('minimum_ram'), sr.get('minimum_storage'), sr.get('recommended_cpu'),
                    sr.get('recommended_gpu'), sr.get('recommended_ram'), sr.get('recommended_storage')
                ])
                
        return {"message": "Game created successfully", "game_id": game_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{game_id}")
def update_game(
    game_id: int,
    game_name: str = Form(...),
    description: Optional[str] = Form(None),
    detailed_description: Optional[str] = Form(None),
    developer_id: Optional[int] = Form(None),
    publisher_id: Optional[int] = Form(None),
    release_date: Optional[str] = Form(None),
    rating: Optional[float] = Form(None),
    price: Optional[float] = Form(None),
    is_free_to_play: bool = Form(False),
    play_status: str = Form('not_started'),
    is_bookmarked: bool = Form(False),
    is_favorited: bool = Form(False),
    game_engine: Optional[str] = Form(None),
    genre_ids: str = Form("[]"),
    platform_ids: str = Form("[]"),
    mode_ids: str = Form("[]"),
    story_type_ids: str = Form("[]"),
    sys_req: str = Form("{}"),
    cover_image: Optional[UploadFile] = File(None),
    admin: str = Depends(get_current_admin),
    db = Depends(get_db)
):
    try:
        conn = db.connection
        with conn.transaction():
            db.execute("SELECT cover_image FROM games WHERE game_id = %s", [game_id])
            existing = db.fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Game not found")
                
            image_path = existing['cover_image']
            
            if cover_image:
                frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend")
                img_dir = os.path.join(frontend_path, "static", "images")
                os.makedirs(img_dir, exist_ok=True)
                file_ext = os.path.splitext(cover_image.filename)[1]
                file_name = f"{game_name.replace(' ', '_').lower()}_upd_{game_id}{file_ext}"
                full_path = os.path.join(img_dir, file_name)
                with open(full_path, "wb") as buffer:
                    shutil.copyfileobj(cover_image.file, buffer)
                image_path = f"/static/images/{file_name}"
                
            rd = release_date if release_date else None
            
            db.execute("""
                UPDATE games SET
                    game_name=%s, description=%s, detailed_description=%s, developer_id=%s, publisher_id=%s, release_date=%s,
                    rating=%s, price=%s, is_free_to_play=%s, play_status=%s, is_bookmarked=%s,
                    is_favorited=%s, game_engine=%s, cover_image=%s
                WHERE game_id = %s
            """, [
                game_name, description, detailed_description, developer_id, publisher_id, rd,
                rating, price, is_free_to_play, play_status, is_bookmarked,
                is_favorited, game_engine, image_path, game_id
            ])
            
            # Delete junctions
            db.execute("DELETE FROM gamegenres WHERE game_id = %s", [game_id])
            db.execute("DELETE FROM gameplatforms WHERE game_id = %s", [game_id])
            db.execute("DELETE FROM gamemodesrelation WHERE game_id = %s", [game_id])
            db.execute("DELETE FROM gamestory WHERE game_id = %s", [game_id])
            
            # Re-insert junctions
            g_ids = json.loads(genre_ids)
            for gid in g_ids:
                db.execute("INSERT INTO gamegenres (game_id, genre_id) VALUES (%s, %s)", [game_id, gid])
                
            p_ids = json.loads(platform_ids)
            for pid in p_ids:
                db.execute("INSERT INTO gameplatforms (game_id, platform_id) VALUES (%s, %s)", [game_id, pid])
                
            m_ids = json.loads(mode_ids)
            for mid in m_ids:
                db.execute("INSERT INTO gamemodesrelation (game_id, mode_id) VALUES (%s, %s)", [game_id, mid])
                
            st_ids = json.loads(story_type_ids)
            for stid in st_ids:
                db.execute("INSERT INTO gamestory (game_id, story_id) VALUES (%s, %s)", [game_id, stid])
                
            # Upsert system requirements safely without pkey collision
            sr = json.loads(sys_req)
            if sr:
                db.execute("SELECT requirement_id FROM systemrequirements WHERE game_id = %s", [game_id])
                existing_sr = db.fetchone()
                if existing_sr:
                    db.execute("""
                        UPDATE systemrequirements SET
                            operating_system=%s, minimum_cpu=%s, minimum_gpu=%s, minimum_ram=%s, minimum_storage=%s,
                            recommended_cpu=%s, recommended_gpu=%s, recommended_ram=%s, recommended_storage=%s
                        WHERE game_id = %s
                    """, [
                        sr.get('operating_system'), sr.get('minimum_cpu'), sr.get('minimum_gpu'),
                        sr.get('minimum_ram'), sr.get('minimum_storage'), sr.get('recommended_cpu'),
                        sr.get('recommended_gpu'), sr.get('recommended_ram'), sr.get('recommended_storage'),
                        game_id
                    ])
                else:
                    db.execute("""
                        INSERT INTO systemrequirements (
                            game_id, operating_system, minimum_cpu, minimum_gpu, minimum_ram, minimum_storage,
                            recommended_cpu, recommended_gpu, recommended_ram, recommended_storage
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, [
                        game_id, sr.get('operating_system'), sr.get('minimum_cpu'), sr.get('minimum_gpu'),
                        sr.get('minimum_ram'), sr.get('minimum_storage'), sr.get('recommended_cpu'),
                        sr.get('recommended_gpu'), sr.get('recommended_ram'), sr.get('recommended_storage')
                    ])
                
        return {"message": "Game updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class GameStatusUpdate(BaseModel):
    play_status: Optional[str] = None
    is_bookmarked: Optional[bool] = None
    is_favorited: Optional[bool] = None

@router.patch("/{game_id}/status")
def update_game_status(
    game_id: int, 
    status_update: GameStatusUpdate,
    admin: str = Depends(get_current_admin),
    db = Depends(get_db)
):
    try:
        conn = db.connection
        with conn.transaction():
            db.execute("SELECT play_status, is_bookmarked, is_favorited FROM games WHERE game_id = %s", [game_id])
            existing = db.fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Game not found")
                
            new_status = status_update.play_status if status_update.play_status is not None else existing['play_status']
            new_bookmarked = status_update.is_bookmarked if status_update.is_bookmarked is not None else existing['is_bookmarked']
            new_favorited = status_update.is_favorited if status_update.is_favorited is not None else existing['is_favorited']
            
            db.execute("""
                UPDATE games SET play_status=%s, is_bookmarked=%s, is_favorited=%s
                WHERE game_id=%s
            """, [new_status, new_bookmarked, new_favorited, game_id])
            
        return {"message": "Status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{game_id}")
def delete_game(
    game_id: int,
    admin: str = Depends(get_current_admin),
    db = Depends(get_db)
):
    try:
        conn = db.connection
        with conn.transaction():
            db.execute("SELECT cover_image FROM games WHERE game_id = %s", [game_id])
            existing = db.fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Game not found")
                
            db.execute("DELETE FROM gamegenres WHERE game_id = %s", [game_id])
            db.execute("DELETE FROM gameplatforms WHERE game_id = %s", [game_id])
            db.execute("DELETE FROM gamemodesrelation WHERE game_id = %s", [game_id])
            db.execute("DELETE FROM gamestory WHERE game_id = %s", [game_id])
            db.execute("DELETE FROM systemrequirements WHERE game_id = %s", [game_id])
            db.execute("DELETE FROM games WHERE game_id = %s", [game_id])
            
        # Delete image if exists
        # In a real app we might want to clean this up, but it's optional for now
        
        return {"message": "Game deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
