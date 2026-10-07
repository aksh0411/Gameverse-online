"""
generate_posters.py
Downloads, optimizes, and links high-quality, lightweight poster images (600x900 JPEG)
for games 101 to 200 in the GameVerse catalog.
Updates both the local filesystem (public/static/images/game_{id}.jpg)
and the Supabase database (games.cover_image).
"""

import io
import os
import sys
import json
import time
import requests
from PIL import Image
from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(_BACKEND_DIR)
load_dotenv(os.path.join(_BACKEND_DIR, ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL is not set.")
    sys.exit(1)

OUTPUT_DIR = os.path.join(_PROJECT_ROOT, "public", "static", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Curated overrides for accurate, latest-version artwork
OVERRIDES = {
    "Hollow Knight: Silksong": {"type": "steam", "appid": 1030300},
    "Sid Meier's Civilization VII": {"type": "steam", "appid": 1295660},
    "EA SPORTS FC 25": {"type": "steam", "appid": 2669320},
    "The Elder Scrolls Online": {"type": "steam", "appid": 306130},
    "The Elder Scrolls IV: Oblivion Remastered": {"type": "steam", "appid": 22330},
    "Dragon Quest XI S: Echoes of an Elusive Age - Definitive Edition": {"type": "steam", "appid": 1295510},
    "The Witcher 2: Assassins of Kings - Enhanced Edition": {"type": "steam", "appid": 20920},
    "Resident Evil 2 Remake": {"type": "steam", "appid": 883710},
    "Dead Space Remake": {"type": "steam", "appid": 1693980},
    "Silent Hill 2 Remake": {"type": "steam", "appid": 2124490},
    "Fall Guys": {"type": "steam", "appid": 1097150},
    "Rise of the Ronin": {"type": "steam", "appid": 1340990},
    "Yakuza 0": {"type": "steam", "appid": 638970},
    "Satisfactory": {"type": "steam", "appid": 526870},
    "Overwatch 2": {"type": "steam", "appid": 2357570},
    "Grand Theft Auto IV": {"type": "steam", "appid": 12210},
    "Grand Theft Auto: San Andreas": {"type": "steam", "appid": 1546990},
    "Red Dead Redemption": {"type": "steam", "appid": 2668510},
    "Doom: The Dark Ages": {"type": "steam", "appid": 3017860},
    "StarCraft II: Wings of Liberty": {
        "type": "url",
        "url": "https://static.wikia.nocookie.net/starcraft/images/2/27/WingsOfLiberty_SC2_Cover1.jpg/revision/latest",
        "referer": "https://starcraft.fandom.com/"
    },
    "World of Warcraft": {
        "type": "url",
        "url": "https://warcraft.wiki.gg/images/thumb/WoW-boxcover.jpg/1000px-WoW-boxcover.jpg?b0f991",
        "referer": "https://warcraft.wiki.gg/"
    },
    "Genshin Impact": {
        "type": "url",
        "url": "https://static.wikia.nocookie.net/gensin-impact/images/8/80/Genshin_Impact.png/revision/latest",
        "referer": "https://genshin-impact.fandom.com/"
    },
    "Honkai: Star Rail": {
        "type": "url",
        "url": "https://static.wikia.nocookie.net/houkai-star-rail/images/2/29/Honkai_Star_Rail.png/revision/latest",
        "referer": "https://honkai-star-rail.fandom.com/"
    }
}


def process_and_save_image(img_bytes, dest_path, target_size=(600, 900)):
    """Convert, center-crop to 2:3 aspect ratio, resize to 600x900, save optimized JPEG."""
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    target_w, target_h = target_size
    target_aspect = target_w / target_h
    img_aspect = img.width / img.height

    if img_aspect > target_aspect:
        new_width = int(img.height * target_aspect)
        offset = (img.width - new_width) // 2
        img = img.crop((offset, 0, offset + new_width, img.height))
    elif img_aspect < target_aspect:
        new_height = int(img.width / target_aspect)
        offset = (img.height - new_height) // 2
        img = img.crop((0, offset, img.width, offset + new_height))

    img = img.resize(target_size, Image.Resampling.LANCZOS)
    img.save(dest_path, "JPEG", quality=85, optimize=True)


def download_image(source_info):
    """Download poster image bytes based on source info (Steam or direct URL)."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    if source_info["type"] == "steam":
        appid = source_info["appid"]
        urls = [
            f"https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/{appid}/library_600x900_2x.jpg",
            f"https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/{appid}/library_600x900.jpg",
            f"https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/{appid}/header.jpg",
        ]
        for u in urls:
            try:
                res = requests.get(u, headers=headers, timeout=10)
                if res.status_code == 200 and len(res.content) > 1000:
                    return res.content
            except Exception:
                continue
        raise RuntimeError(f"Could not download Steam artwork for AppID {appid}")

    elif source_info["type"] == "url":
        url = source_info["url"]
        if source_info.get("referer"):
            headers["Referer"] = source_info["referer"]
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200 and len(res.content) > 1000:
            return res.content
        raise RuntimeError(f"Failed to download image from {url} (status {res.status_code})")

    raise ValueError(f"Unknown source type: {source_info['type']}")


def resolve_steam_appid(game_name):
    """Look up best Steam AppID via Steam store search."""
    url = f"https://store.steampowered.com/api/storesearch/?term={requests.utils.quote(game_name)}&l=english&cc=US"
    r = requests.get(url, timeout=10).json()
    items = r.get("items", [])
    if items:
        return items[0]["id"], items[0]["name"]
    raise RuntimeError(f"No Steam search result for: {game_name}")


def main():
    print("Connecting to database...")
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    cur = conn.cursor()

    cur.execute("""
        SELECT game_id, game_name 
        FROM games 
        WHERE cover_image IS NULL OR cover_image = ''
        ORDER BY game_id ASC
    """)
    games = cur.fetchall()
    print(f"Found {len(games)} games needing poster images.\n")

    success_count = 0
    errors = []

    for idx, g in enumerate(games, 1):
        gid = g["game_id"]
        name = g["game_name"]
        filename = f"game_{gid}.jpg"
        file_path = os.path.join(OUTPUT_DIR, filename)
        db_cover_path = f"/static/images/{filename}"

        print(f"[{idx:>3}/{len(games)}] ID {gid:>3}: {name:<45}", end="", flush=True)

        try:
            # Determine source
            if name in OVERRIDES:
                source = OVERRIDES[name]
            else:
                appid, steam_name = resolve_steam_appid(name)
                source = {"type": "steam", "appid": appid, "steam_name": steam_name}

            # Download
            raw_bytes = download_image(source)

            # Optimize & save locally
            process_and_save_image(raw_bytes, file_path)
            file_kb = os.path.getsize(file_path) / 1024

            # Update database
            cur.execute("UPDATE games SET cover_image = %s WHERE game_id = %s", (db_cover_path, gid))

            print(f" -> OK ({file_kb:.1f} KB)")
            success_count += 1

        except Exception as e:
            print(f" -> ERROR: {e}")
            errors.append((gid, name, str(e)))

        # Commit periodically
        if idx % 10 == 0:
            conn.commit()

    conn.commit()
    conn.close()

    print("\n==========================================")
    print(f"Finished! Successfully generated and linked: {success_count} / {len(games)}")
    if errors:
        print(f"Errors encountered ({len(errors)}):")
        for gid, name, err in errors:
            print(f"  - [{gid}] {name}: {err}")
    print("==========================================")


if __name__ == "__main__":
    main()
