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

DIRECT_HERO_URLS = {
    28: "https://images.igdb.com/igdb/image/upload/t_1080p/sc6ec4.jpg", # Bloodborne wide screenshot
    41: "https://images.igdb.com/igdb/image/upload/t_1080p/sc81i7.jpg", # Valorant wide screenshot
    44: "https://images.igdb.com/igdb/image/upload/t_1080p/co2044.jpg", # Fortnite
}

def download_hero_wallpapers():
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    print("[*] Downloading wide cinematic hero wallpapers for all games...")
    
    for game_id in range(1, 51):
        filename = f"hero_{game_id}.jpg"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        # Check Direct first
        if game_id in DIRECT_HERO_URLS:
            try:
                req = urllib.request.Request(DIRECT_HERO_URLS[game_id], headers=headers)
                with urllib.request.urlopen(req, timeout=10) as res:
                    if res.status == 200:
                        with open(filepath, "wb") as f:
                            f.write(res.read())
                        print(f"  [+] #{game_id:02d} -> hero_{game_id}.jpg (Direct)")
                        continue
            except Exception as e:
                print(f"Direct failed for #{game_id}: {e}")

        # Check Steam library_hero.jpg
        app_id = STEAM_APP_MAP.get(game_id)
        if app_id:
            hero_urls = [
                f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{app_id}/library_hero.jpg",
                f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{app_id}/page_bg_generated_v6b.jpg",
                f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{app_id}/header.jpg",
            ]
            saved = False
            for u in hero_urls:
                try:
                    req = urllib.request.Request(u, headers=headers)
                    with urllib.request.urlopen(req, timeout=8) as res:
                        if res.status == 200:
                            data = res.read()
                            if len(data) > 10000:
                                with open(filepath, "wb") as f:
                                    f.write(data)
                                print(f"  [+] #{game_id:02d} -> hero_{game_id}.jpg ({len(data)//1024} KB)")
                                saved = True
                                break
                except Exception:
                    continue
            if saved:
                continue

        # If no wide hero found, copy game_{id}.jpg if exists
        cover_path = os.path.join(OUTPUT_DIR, f"game_{game_id}.jpg")
        if os.path.exists(cover_path):
            with open(cover_path, "rb") as sf, open(filepath, "wb") as df:
                df.write(sf.read())
            print(f"  [~] #{game_id:02d} -> copied cover to hero_{game_id}.jpg")

if __name__ == "__main__":
    download_hero_wallpapers()
