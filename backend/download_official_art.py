import os
import urllib.request
import psycopg
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "games_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1234")

conninfo = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "static", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Steam App IDs for 46 games
STEAM_APP_MAP = {
    1: 2114740, # Blasphemous 2
    2: 1245620, # Elden Ring
    3: 1086940, # Baldur's Gate 3
    4: 1174180, # Red Dead Redemption 2
    5: 271590,  # Grand Theft Auto V
    6: 1091500, # Cyberpunk 2077
    7: 292030,  # The Witcher 3: Wild Hunt
    8: 2358720, # Black Myth: Wukong
    9: 367520,  # Hollow Knight
    10: 1145360,# Hades
    11: 588650, # Dead Cells
    12: 1672970,# Minecraft
    13: 105600, # Terraria
    14: 413150, # Stardew Valley
    15: 275850, # No Man's Sky
    16: 264710, # Subnautica
    17: 892970, # Valheim
    18: 1593500,# God of War
    19: 2322010,# God of War Ragnarok
    20: 2215430,# Ghost of Tsushima
    21: 1817070,# Marvel's Spider-Man Remastered
    22: 2651280,# Marvel's Spider-Man 2
    23: 1151640,# Horizon Zero Dawn
    24: 2420110,# Horizon Forbidden West
    25: 814380, # Sekiro: Shadows Die Twice
    26: 570940, # Dark Souls Remastered
    27: 374320, # Dark Souls III
    29: 1627720,# Lies of P
    30: 2050650,# Resident Evil 4 Remake
    31: 1196590,# Resident Evil Village
    32: 782330, # DOOM Eternal
    33: 379720, # DOOM
    34: 1687950,# Persona 5 Royal
    35: 1462040,# Final Fantasy VII Remake
    36: 2515020,# Final Fantasy XVI
    37: 582010, # Monster Hunter: World
    38: 1446780,# Monster Hunter Rise
    39: 553850, # Helldivers 2
    40: 730,    # Counter-Strike 2
    42: 1276790,# League of Legends
    43: 570,    # Dota 2
    45: 578080, # PUBG: Battlegrounds
    46: 1172470,# Apex Legends
    47: 359550, # Rainbow Six Siege
    48: 620,    # Portal 2
    49: 504230, # Celeste
    50: 1057090 # Ori and the Will of the Wisps
}

# Direct 1080p official box art / artwork for PlayStation / Riot / Epic titles
DIRECT_URLS = {
    28: "https://images.igdb.com/igdb/image/upload/t_1080p/co1r7f.jpg", # Bloodborne
    41: "https://images.igdb.com/igdb/image/upload/t_1080p/co2mvt.jpg", # Valorant
    44: "https://images.igdb.com/igdb/image/upload/t_1080p/co2044.jpg", # Fortnite
}

def get_image_for_game(game_id):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    
    # 1. Check direct URL first if specified
    if game_id in DIRECT_URLS:
        try:
            req = urllib.request.Request(DIRECT_URLS[game_id], headers=headers)
            with urllib.request.urlopen(req, timeout=10) as res:
                if res.status == 200:
                    return res.read(), ".jpg"
        except Exception as e:
            print(f"Direct fetch failed for game {game_id}: {e}")

    # 2. Check Steam CDN
    app_id = STEAM_APP_MAP.get(game_id)
    if app_id:
        url_candidates = [
            f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{app_id}/library_600x900_2x.jpg",
            f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{app_id}/library_600x900.jpg",
            f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{app_id}/library_hero.jpg",
            f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{app_id}/header.jpg",
        ]
        for url in url_candidates:
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=8) as res:
                    if res.status == 200:
                        data = res.read()
                        if len(data) > 5000:
                            return data, ".jpg"
            except Exception:
                continue

    return None, None

def download_all_official_arts():
    print("[*] Connecting to database...")
    with psycopg.connect(conninfo) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT game_id, game_name FROM games ORDER BY game_id")
            games = cur.fetchall()

            print(f"[*] Downloading official artwork & posters for {len(games)} games...")
            success_count = 0

            for game_id, game_name in games:
                data, ext = get_image_for_game(game_id)

                if data:
                    filename = f"game_{game_id}{ext}"
                    filepath = os.path.join(OUTPUT_DIR, filename)
                    with open(filepath, "wb") as f:
                        f.write(data)
                    
                    db_path = f"/static/images/{filename}"
                    cur.execute("UPDATE games SET cover_image = %s WHERE game_id = %s", [db_path, game_id])
                    print(f"  [+] #{game_id:02d} '{game_name}' -> {filename} ({len(data)//1024} KB)")
                    success_count += 1
                else:
                    print(f"  [-] #{game_id:02d} '{game_name}' -> Failed")

            conn.commit()
            print(f"\n[OK] Successfully updated {success_count}/{len(games)} games with official HD artwork!")

if __name__ == "__main__":
    download_all_official_arts()
