"""Bulk Image Synchronizer for GAMEVERSE.

Scans frontend/static/images/ and automatically updates the `cover_image`
column in PostgreSQL for matching games.
Supports: .jpg, .jpeg, .png, .webp, .avif
"""

import os
import re
import psycopg
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "games_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1234")

conninfo = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"

def normalize_name(text: str) -> str:
    """Normalize game name / filename for fuzzy matching."""
    text = text.lower()
    text = re.sub(r'[\':_.\-–—]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def sync_images():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    images_dir = os.path.join(base_dir, "frontend", "static", "images")
    
    if not os.path.exists(images_dir):
        print(f"[X] Directory not found: {images_dir}")
        return

    # Valid image extensions
    valid_exts = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}
    available_files = [
        f for f in os.listdir(images_dir)
        if os.path.splitext(f)[1].lower() in valid_exts
    ]
    
    print(f"[*] Found {len(available_files)} image files in {images_dir}")

    try:
        with psycopg.connect(conninfo) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT game_id, game_name, cover_image FROM games ORDER BY game_id")
                games = cur.fetchall()
                
                matched = 0
                for game_id, game_name, current_img in games:
                    norm_game = normalize_name(game_name)
                    
                    best_match = None
                    # 1. Match by game_id in filename (e.g. 1.jpg, game_1.png)
                    for f in available_files:
                        name_without_ext = os.path.splitext(f)[0]
                        if name_without_ext == str(game_id) or name_without_ext == f"game_{game_id}":
                            best_match = f
                            break
                    
                    # 2. Match by normalized name (e.g. elden_ring.jpg -> Elden Ring)
                    if not best_match:
                        for f in available_files:
                            norm_file = normalize_name(os.path.splitext(f)[0])
                            if norm_file == norm_game or norm_game in norm_file or norm_file in norm_game:
                                best_match = f
                                break
                    
                    if best_match:
                        img_path = f"/static/images/{best_match}"
                        cur.execute("UPDATE games SET cover_image = %s WHERE game_id = %s", [img_path, game_id])
                        print(f"  [+] Game #{game_id:02d} '{game_name}' -> {best_match}")
                        matched += 1
                    else:
                        status = f"Current: {current_img}" if current_img else "No image found"
                        print(f"  [-] Game #{game_id:02d} '{game_name}' -> {status}")
                
                conn.commit()
                print(f"\n[OK] Successfully linked {matched}/{len(games)} game images in database.")
    except Exception as e:
        print(f"[X] Database error: {e}")

if __name__ == "__main__":
    sync_images()
