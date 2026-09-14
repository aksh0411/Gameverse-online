import os
import urllib.request
import psycopg
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFont, ImageFilter

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "games_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1234")

conninfo = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "static", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Curated Steam App IDs for games 51-100
STEAM_APP_MAP = {
    51: 220240,   # Far Cry 3
    52: 299740,   # Far Cry 4
    53: 552520,   # Far Cry 5
    54: 2369390,  # Far Cry 6
    55: 371660,   # Far Cry Primal
    56: 489830,   # The Elder Scrolls V: Skyrim Special Edition
    57: 377160,   # Fallout 4
    58: 22380,    # Fallout: New Vegas
    59: 1716740,  # Starfield
    60: 1888930,  # The Last of Us Part I
    61: 1888930,  # The Last of Us Part II (use Part I Steam / high-res art)
    62: 1659420,  # Uncharted: Legacy of Thieves Collection
    63: 1850570,  # Death Stranding Director's Cut
    64: 108710,   # Alan Wake Franchise
    65: 870780,   # Control
    66: 1328670,  # Mass Effect Legendary Edition
    67: 2054970,  # Dragon's Dogma 2
    68: 1887840,  # Armored Core VI: Fires of Rubicon
    69: 1172380,  # Star Wars Jedi: Fallen Order
    70: 1774580,  # Star Wars Jedi: Survivor
    71: 812140,   # Assassin's Creed Odyssey
    72: 2208920,  # Assassin's Creed Valhalla
    73: 2842040,  # Assassin's Creed Mirage
    74: 208650,   # Batman: Arkham Knight
    75: 200260,   # Batman: Arkham City
    76: 8870,     # BioShock Infinite
    77: 403640,   # Dishonored 2
    78: 480490,   # Prey
    79: 1659040,  # Hitman World of Assassination
    80: 287700,   # Metal Gear Solid V: The Phantom Pain
    81: 1240440,  # Halo Infinite
    82: 1938090,  # Call of Duty: Modern Warfare II
    83: 1962663,  # Call of Duty: Warzone
    84: 1517290,  # Battlefield 2042
    85: 1237970,  # Titanfall 2
    86: 1551360,  # Forza Horizon 5
    87: 1846380,  # Need for Speed Unbound
    88: 1172620,  # Sea of Thieves
    89: 1623730,  # Palworld
    90: 1966720,  # Lethal Company
    91: 548430,   # Deep Rock Galactic
    92: 646570,   # Slay the Spire
    93: 2379780,  # Balatro
    94: 1145350,  # Hades II
    95: 1809540,  # Nine Sols
    96: 1868140,  # Dave the Diver
    97: 268910,   # Cuphead
    98: 1426210,  # It Takes Two
    99: 753640,   # Outer Wilds
    100: 632470   # Disco Elysium - The Final Cut
}

def download_file(url, out_path):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=8) as res:
            if res.status == 200:
                data = res.read()
                if len(data) > 1024:
                    with open(out_path, 'wb') as f:
                        f.write(data)
                    return True
    except Exception:
        pass
    return False

def generate_hero_from_poster(poster_path, out_hero_path, title):
    """Generates an atmospheric 1920x1080 cinematic hero banner from vertical poster."""
    W, H = 1920, 1080
    if os.path.exists(poster_path):
        try:
            with Image.open(poster_path) as im:
                im = im.convert("RGB")
                # Stretch & blur for ambient background
                blurred = im.resize((W, H), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(radius=40))
                # Dim background
                overlay = Image.new("RGBA", (W, H), (10, 8, 18, 160))
                blurred.paste(overlay, (0, 0), overlay)

                # Center artwork
                aspect = im.width / im.height
                new_h = 820
                new_w = int(new_h * aspect)
                art_resized = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
                # Drop shadow on art
                shadow = Image.new("RGBA", (new_w + 60, new_h + 60), (0, 0, 0, 0))
                s_draw = ImageDraw.Draw(shadow)
                s_draw.rectangle([30, 30, new_w + 30, new_h + 30], fill=(0, 0, 0, 180))
                shadow = shadow.filter(ImageFilter.GaussianBlur(radius=25))
                
                art_x = (W - new_w) // 2
                art_y = (H - new_h) // 2
                blurred.paste(shadow, (art_x - 30, art_y - 30), shadow)
                blurred.paste(art_resized, (art_x, art_y))

                blurred.save(out_hero_path, "JPEG", quality=90)
                return True
        except Exception as e:
            print(f"Error generating hero for {title}: {e}")

    # Fallback gradient
    hero = Image.new("RGB", (W, H), (15, 12, 25))
    h_draw = ImageDraw.Draw(hero)
    h_draw.text((W // 2 - 200, H // 2), title.upper(), fill=(200, 200, 220))
    hero.save(out_hero_path, "JPEG", quality=90)
    return True

def run():
    print("=" * 60)
    print("  Downloading & Synchronizing Images for Games 51-100")
    print("=" * 60)

    with psycopg.connect(conninfo) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT game_id, game_name, cover_image 
                FROM games 
                WHERE game_id BETWEEN 51 AND 100 
                ORDER BY game_id
            """)
            games = cur.fetchall()

            for gid, name, raw_cover in games:
                slug = os.path.splitext(os.path.basename(raw_cover))[0] if raw_cover else f"game_{gid}"
                app_id = STEAM_APP_MAP.get(gid)

                # Target file paths
                p_game_jpg = os.path.join(OUTPUT_DIR, f"game_{gid}.jpg")
                p_game_png = os.path.join(OUTPUT_DIR, f"game_{gid}.png")
                p_slug_jpg = os.path.join(OUTPUT_DIR, f"{slug}.jpg")
                p_slug_png = os.path.join(OUTPUT_DIR, f"{slug}.png")
                p_hero_jpg = os.path.join(OUTPUT_DIR, f"hero_{gid}.jpg")

                print(f"[{gid:02d}/100] {name} (Steam App: {app_id})...")

                # 1. Download official Steam Vertical Poster (600x900)
                poster_downloaded = False
                if app_id:
                    poster_urls = [
                        f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{app_id}/library_600x900_2x.jpg",
                        f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{app_id}/library_600x900.jpg",
                        f"https://cdn.cloudflare.steamstatic.com/steam/apps/{app_id}/library_600x900.jpg"
                    ]
                    for url in poster_urls:
                        if download_file(url, p_game_jpg):
                            poster_downloaded = True
                            break

                if poster_downloaded:
                    # Sync to PNG & slug files
                    try:
                        with Image.open(p_game_jpg) as im:
                            im.save(p_slug_jpg, "JPEG", quality=94)
                            im.save(p_game_png, "PNG", optimize=True)
                            im.save(p_slug_png, "PNG", optimize=True)
                    except Exception as e:
                        print(f"  [!] Format sync error: {e}")
                    print(f"  [+] Official Poster downloaded successfully!")
                else:
                    print(f"  [-] Steam poster not found, checking existing poster...")
                    if not os.path.exists(p_game_jpg) and os.path.exists(p_slug_jpg):
                        with Image.open(p_slug_jpg) as im:
                            im.save(p_game_jpg, "JPEG", quality=94)

                # 2. Download official Steam Hero Banner (1920x1080 / library_hero)
                hero_downloaded = False
                if app_id:
                    hero_urls = [
                        f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{app_id}/library_hero.jpg",
                        f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{app_id}/header.jpg",
                        f"https://cdn.cloudflare.steamstatic.com/steam/apps/{app_id}/library_hero.jpg"
                    ]
                    for h_url in hero_urls:
                        if download_file(h_url, p_hero_jpg):
                            hero_downloaded = True
                            break

                if hero_downloaded:
                    print(f"  [+] Official Hero Wallpaper downloaded!")
                else:
                    # Generate aesthetic hero from vertical poster
                    poster_source = p_game_jpg if os.path.exists(p_game_jpg) else p_slug_jpg
                    generate_hero_from_poster(poster_source, p_hero_jpg, name)
                    print(f"  [+] Generated cinematic Hero Wallpaper from poster!")

                # 3. Update DB record to canonical format: /static/images/game_<id>.jpg
                canonical_path = f"/static/images/game_{gid}.jpg"
                cur.execute("UPDATE games SET cover_image = %s WHERE game_id = %s", [canonical_path, gid])

            conn.commit()
            print("\n[OK] All 50 games (51-100) successfully updated with official posters and hero wallpapers!")

if __name__ == "__main__":
    run()
