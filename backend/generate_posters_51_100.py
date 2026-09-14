import os
import math
import random
from PIL import Image, ImageDraw, ImageFont
import psycopg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "games_db")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "1234")
    DATABASE_URL = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "static", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Curated thematic styles for the 50 new games
THEMES = {
    "far cry": {"tag": "ACTION FPS", "c1": (22, 28, 12), "c2": (85, 95, 20), "accent": (235, 175, 45), "glow": (255, 220, 110)},
    "skyrim": {"tag": "EPIC RPG", "c1": (12, 20, 32), "c2": (30, 65, 110), "accent": (145, 210, 255), "glow": (220, 240, 255)},
    "fallout": {"tag": "POST-APOCALYPTIC", "c1": (16, 26, 14), "c2": (40, 85, 30), "accent": (135, 235, 65), "glow": (205, 255, 140)},
    "starfield": {"tag": "SPACE RPG", "c1": (10, 12, 28), "c2": (25, 40, 95), "accent": (80, 195, 245), "glow": (200, 235, 255)},
    "last of us": {"tag": "SURVIVAL DRAMA", "c1": (22, 18, 14), "c2": (70, 50, 30), "accent": (195, 145, 75), "glow": (240, 200, 140)},
    "uncharted": {"tag": "ACTION ADVENTURE", "c1": (24, 18, 12), "c2": (85, 55, 20), "accent": (235, 155, 45), "glow": (255, 215, 130)},
    "death stranding": {"tag": "STRAND GAME", "c1": (14, 16, 22), "c2": (45, 50, 65), "accent": (165, 185, 215), "glow": (215, 235, 250)},
    "alan wake": {"tag": "SURVIVAL HORROR", "c1": (20, 10, 12), "c2": (80, 20, 30), "accent": (235, 65, 75), "glow": (255, 190, 80)},
    "control": {"tag": "SUPERNATURAL", "c1": (24, 12, 16), "c2": (90, 25, 35), "accent": (235, 55, 75), "glow": (255, 140, 160)},
    "mass effect": {"tag": "SPACE OPERA", "c1": (12, 18, 30), "c2": (25, 60, 105), "accent": (65, 165, 245), "glow": (160, 225, 255)},
    "dragon's dogma": {"tag": "ACTION RPG", "c1": (26, 16, 12), "c2": (95, 45, 20), "accent": (235, 125, 50), "glow": (255, 195, 130)},
    "armored core": {"tag": "MECH COMBAT", "c1": (28, 12, 12), "c2": (105, 25, 25), "accent": (245, 55, 55), "glow": (255, 160, 130)},
    "jedi": {"tag": "ACTION ADVENTURE", "c1": (12, 20, 32), "c2": (25, 75, 115), "accent": (65, 195, 255), "glow": (180, 240, 255)},
    "assassin's creed": {"tag": "ACTION ADVENTURE", "c1": (22, 14, 16), "c2": (80, 35, 45), "accent": (215, 85, 95), "glow": (255, 175, 175)},
    "batman": {"tag": "DARK ACTION", "c1": (10, 14, 24), "c2": (20, 45, 85), "accent": (85, 175, 245), "glow": (175, 225, 255)},
    "bioshock": {"tag": "FPS ADVENTURE", "c1": (14, 20, 28), "c2": (40, 75, 105), "accent": (225, 185, 65), "glow": (255, 235, 145)},
    "dishonored": {"tag": "STEALTH ACTION", "c1": (18, 16, 24), "c2": (55, 40, 80), "accent": (195, 110, 235), "glow": (235, 180, 255)},
    "prey": {"tag": "SCI-FI THRILLER", "c1": (24, 16, 10), "c2": (90, 45, 15), "accent": (240, 135, 40), "glow": (255, 195, 100)},
    "hitman": {"tag": "STEALTH SANDBOX", "c1": (20, 10, 12), "c2": (85, 18, 24), "accent": (235, 45, 55), "glow": (255, 150, 150)},
    "metal gear": {"tag": "TACTICAL STEALTH", "c1": (22, 20, 14), "c2": (75, 65, 35), "accent": (215, 175, 65), "glow": (250, 225, 135)},
    "halo": {"tag": "SCI-FI FPS", "c1": (14, 24, 18), "c2": (35, 85, 55), "accent": (75, 225, 135), "glow": (175, 250, 195)},
    "call of duty": {"tag": "TACTICAL FPS", "c1": (20, 18, 14), "c2": (75, 55, 25), "accent": (225, 155, 50), "glow": (255, 210, 125)},
    "battlefield": {"tag": "WARFARE FPS", "c1": (10, 20, 26), "c2": (20, 75, 95), "accent": (65, 215, 225), "glow": (165, 250, 245)},
    "titanfall": {"tag": "MECH FPS", "c1": (24, 16, 12), "c2": (90, 45, 20), "accent": (235, 125, 45), "glow": (255, 185, 110)},
    "forza": {"tag": "RACING SIM", "c1": (26, 14, 12), "c2": (105, 35, 20), "accent": (245, 95, 45), "glow": (255, 185, 95)},
    "need for speed": {"tag": "STREET RACING", "c1": (26, 10, 26), "c2": (105, 20, 105), "accent": (245, 55, 245), "glow": (120, 225, 255)},
    "sea of thieves": {"tag": "PIRATE SANDBOX", "c1": (10, 24, 26), "c2": (20, 85, 95), "accent": (55, 225, 215), "glow": (155, 250, 240)},
    "palworld": {"tag": "SURVIVAL CRAFT", "c1": (14, 24, 20), "c2": (40, 95, 70), "accent": (85, 235, 165), "glow": (185, 255, 215)},
    "lethal company": {"tag": "CO-OP HORROR", "c1": (22, 14, 10), "c2": (85, 40, 15), "accent": (235, 115, 35), "glow": (255, 180, 90)},
    "deep rock": {"tag": "CO-OP FPS", "c1": (24, 18, 10), "c2": (95, 60, 15), "accent": (245, 165, 40), "glow": (255, 215, 110)},
    "slay the spire": {"tag": "DECKBUILDER", "c1": (22, 10, 18), "c2": (85, 25, 65), "accent": (235, 65, 145), "glow": (255, 155, 210)},
    "balatro": {"tag": "ROGUELIKE POKER", "c1": (26, 10, 12), "c2": (105, 20, 30), "accent": (245, 55, 75), "glow": (255, 215, 65)},
    "hades": {"tag": "MYTHIC ROGUELIKE", "c1": (18, 10, 26), "c2": (65, 20, 105), "accent": (195, 65, 245), "glow": (240, 155, 255)},
    "nine sols": {"tag": "TAOPUNK ACTION", "c1": (24, 14, 12), "c2": (95, 35, 25), "accent": (235, 85, 55), "glow": (255, 185, 135)},
    "dave the diver": {"tag": "DEEP SEA ADVENTURE", "c1": (8, 22, 28), "c2": (15, 75, 100), "accent": (55, 215, 225), "glow": (160, 245, 250)},
    "cuphead": {"tag": "RUN & GUN", "c1": (26, 18, 12), "c2": (95, 55, 25), "accent": (235, 145, 55), "glow": (255, 210, 135)},
    "it takes two": {"tag": "CO-OP ADVENTURE", "c1": (22, 14, 30), "c2": (80, 35, 115), "accent": (225, 85, 245), "glow": (120, 220, 255)},
    "outer wilds": {"tag": "SPACE MYSTERY", "c1": (22, 16, 12), "c2": (80, 50, 25), "accent": (235, 145, 55), "glow": (135, 215, 255)},
    "disco elysium": {"tag": "DETECTIVE RPG", "c1": (22, 18, 14), "c2": (75, 45, 30), "accent": (215, 115, 55), "glow": (245, 185, 125)},
}

def get_theme_for_game(title):
    lower = title.lower()
    for key, th in THEMES.items():
        if key in lower:
            return th
    return {
        "tag": "ACTION ADVENTURE",
        "c1": (18, 14, 28),
        "c2": (75, 30, 90),
        "accent": (210, 100, 220),
        "glow": (245, 170, 255)
    }

def create_game_poster(game_id, title, rating, theme):
    W, H = 600, 900
    img = Image.new("RGBA", (W, H), (10, 8, 16, 255))
    draw = ImageDraw.Draw(img)

    c1 = theme["c1"]
    c2 = theme["c2"]
    accent = theme["accent"]
    glow = theme["glow"]
    tag = theme["tag"]

    # 1. Background gradient
    for y in range(H):
        ratio = y / H
        t = math.pow(ratio, 1.2)
        r = int(c1[0] * (1 - t) + c2[0] * t * 0.75)
        g = int(c1[1] * (1 - t) + c2[1] * t * 0.75)
        b = int(c1[2] * (1 - t) + c2[2] * t * 0.75)
        draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

    # 2. Glowing atmospheric radial bursts
    glow_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_overlay)
    cx, cy = W // 2, int(H * 0.42)
    for rad in range(320, 20, -15):
        alpha = int(24 * (1 - rad / 320))
        glow_draw.ellipse(
            [cx - rad, cy - int(rad * 0.8), cx + rad, cy + int(rad * 0.8)],
            fill=(accent[0], accent[1], accent[2], alpha)
        )
    for rad in range(200, 10, -15):
        alpha = int(20 * (1 - rad / 200))
        glow_draw.ellipse(
            [W - 40 - rad, 80 - rad, W - 40 + rad, 80 + rad],
            fill=(glow[0], glow[1], glow[2], alpha)
        )
    img = Image.alpha_composite(img, glow_overlay)
    draw = ImageDraw.Draw(img)

    # 3. Geometric grid
    grid_color = (255, 255, 255, 14)
    for gx in range(40, W, 60):
        draw.line([(gx, 40), (gx, H - 40)], fill=grid_color, width=1)
    for gy in range(40, H, 60):
        draw.line([(40, gy), (W - 40, gy)], fill=grid_color, width=1)

    # Diagonal techno lines
    diag_color = (accent[0], accent[1], accent[2], 30)
    for d in range(-200, W + 400, 120):
        draw.line([(d, 0), (d + 300, 600)], fill=diag_color, width=1)

    # Center Hero Emblem
    emblem_center = (W // 2, int(H * 0.40))
    draw.ellipse(
        [emblem_center[0] - 150, emblem_center[1] - 150, emblem_center[0] + 150, emblem_center[1] + 150],
        outline=(accent[0], accent[1], accent[2], 120),
        width=2
    )
    draw.ellipse(
        [emblem_center[0] - 120, emblem_center[1] - 120, emblem_center[0] + 120, emblem_center[1] + 120],
        outline=(glow[0], glow[1], glow[2], 80),
        width=1
    )
    id_rad = 80
    diamond = [
        (emblem_center[0], emblem_center[1] - id_rad),
        (emblem_center[0] + id_rad, emblem_center[1]),
        (emblem_center[0], emblem_center[1] + id_rad),
        (emblem_center[0] - id_rad, emblem_center[1])
    ]
    draw.polygon(diamond, outline=(accent[0], accent[1], accent[2], 160), width=2)

    # Crosshairs
    draw.line([(emblem_center[0] - 170, emblem_center[1]), (emblem_center[0] - 130, emblem_center[1])], fill=accent, width=2)
    draw.line([(emblem_center[0] + 130, emblem_center[1]), (emblem_center[0] + 170, emblem_center[1])], fill=accent, width=2)
    draw.line([(emblem_center[0], emblem_center[1] - 170), (emblem_center[0], emblem_center[1] - 130)], fill=accent, width=2)
    draw.line([(emblem_center[0], emblem_center[1] + 130), (emblem_center[0], emblem_center[1] + 170)], fill=accent, width=2)

    # Center number watermark
    try:
        font_num = ImageFont.truetype("arialbd.ttf", 85)
    except:
        font_num = ImageFont.load_default()
    num_str = f"{game_id:02d}"
    bbox = draw.textbbox((0, 0), num_str, font=font_num)
    nw = bbox[2] - bbox[0]
    nh = bbox[3] - bbox[1]
    draw.text(
        (emblem_center[0] - nw // 2, emblem_center[1] - nh // 2 - 4),
        num_str,
        font=font_num,
        fill=(255, 255, 255, 220)
    )

    # 4. Border
    draw.rounded_rectangle([20, 20, W - 20, H - 20], radius=18, outline=(187, 174, 223, 60), width=2)
    draw.line([(28, 45), (45, 45)], fill=accent, width=3)
    draw.line([(28, 45), (28, 62)], fill=accent, width=3)
    draw.line([(W - 45, 45), (W - 28, 45)], fill=accent, width=3)
    draw.line([(W - 28, 45), (W - 28, 62)], fill=accent, width=3)

    try:
        font_badge = ImageFont.truetype("arialbd.ttf", 16)
        font_sub = ImageFont.truetype("arial.ttf", 13)
        font_title = ImageFont.truetype("arialbd.ttf", 34)
        font_rating = ImageFont.truetype("arialbd.ttf", 20)
    except:
        font_badge = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_rating = ImageFont.load_default()

    # Top left: GAMEVERSE CORE
    draw.text((45, 45), "GAMEVERSE", font=font_badge, fill=(225, 215, 245, 230))
    draw.text((45, 66), f"ARCHIVE // NO. {game_id:02d}", font=font_sub, fill=(160, 150, 190, 180))

    # Top right: Rating
    score_str = f"★ {rating:.1f}" if rating else "★ 9.0"
    r_bbox = draw.textbbox((0, 0), score_str, font=font_rating)
    rw = r_bbox[2] - r_bbox[0]
    badge_x = W - 45 - rw - 24
    draw.rounded_rectangle([badge_x, 42, W - 45, 78], radius=8, fill=(18, 12, 28, 210), outline=accent, width=1)
    draw.text((badge_x + 12, 48), score_str, font=font_rating, fill=glow)

    # 5. Bottom Info Plaque
    panel_y = int(H * 0.66)
    panel_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(panel_overlay)
    p_draw.rounded_rectangle([32, panel_y, W - 32, H - 36], radius=16, fill=(8, 6, 14, 230), outline=(accent[0], accent[1], accent[2], 120), width=1)
    img = Image.alpha_composite(img, panel_overlay)
    draw = ImageDraw.Draw(img)

    # Genre Pill
    tag_bbox = draw.textbbox((0, 0), tag, font=font_badge)
    tw = tag_bbox[2] - tag_bbox[0]
    draw.rounded_rectangle([52, panel_y + 22, 52 + tw + 20, panel_y + 48], radius=6, fill=(accent[0], accent[1], accent[2], 50), outline=accent, width=1)
    draw.text((62, panel_y + 26), tag, font=font_badge, fill=accent)

    # Title Wrapping
    clean_title = title.upper()
    words = clean_title.split(' ')
    lines = []
    current_line = []
    for word in words:
        test_line = ' '.join(current_line + [word])
        t_box = draw.textbbox((0, 0), test_line, font=font_title)
        if (t_box[2] - t_box[0]) < (W - 110):
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))

    ty = panel_y + 60
    for line in lines[:2]:
        draw.text((54, ty + 2), line, font=font_title, fill=(0, 0, 0, 220))
        draw.text((52, ty), line, font=font_title, fill=(255, 255, 255, 255))
        ty += 42

    draw.line([(52, H - 65), (W - 52, H - 65)], fill=(187, 174, 223, 40), width=1)
    draw.text((52, H - 56), "ARCHIVE RECORD // VERIFIED 4D NODE", font=font_sub, fill=(150, 140, 180, 160))
    draw.text((W - 145, H - 56), "● CONNECTED", font=font_sub, fill=accent)

    return img

def generate():
    print(f"Connecting to database to generate cover posters for games 51-100...")
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT game_id, game_name, rating, cover_image 
                FROM games 
                WHERE game_id >= 51 
                ORDER BY game_id
            """)
            games = cur.fetchall()

            print(f"Found {len(games)} games to generate posters for.")
            for game_id, game_name, rating, cover_img in games:
                theme = get_theme_for_game(game_name)
                poster = create_game_poster(game_id, game_name, float(rating) if rating else 9.0, theme)

                # Convert to RGB for saving as JPG
                rgb_poster = poster.convert("RGB")

                # Clean filename from cover_image (e.g. "nine_sols.jpg")
                raw_filename = os.path.basename(cover_img) if cover_img else f"game_{game_id}.jpg"
                base_name = os.path.splitext(raw_filename)[0]

                # 1. Save as the exact name requested (e.g. nine_sols.jpg and nine_sols.png)
                rgb_poster.save(os.path.join(OUTPUT_DIR, f"{base_name}.jpg"), "JPEG", quality=92)
                poster.save(os.path.join(OUTPUT_DIR, f"{base_name}.png"), "PNG", optimize=True)

                # 2. Also save as game_<id>.jpg and game_<id>.png
                rgb_poster.save(os.path.join(OUTPUT_DIR, f"game_{game_id}.jpg"), "JPEG", quality=92)
                poster.save(os.path.join(OUTPUT_DIR, f"game_{game_id}.png"), "PNG", optimize=True)

                # 3. Update cover_image in DB to standard /static/images/<base_name>.jpg
                cur.execute("UPDATE games SET cover_image = %s WHERE game_id = %s", [f"/static/images/{base_name}.jpg", game_id])
                print(f"  [+] #{game_id:02d} '{game_name}' -> {base_name}.jpg & game_{game_id}.jpg")

            conn.commit()
            print(f"\n[OK] Successfully created all {len(games)} game posters in {OUTPUT_DIR}!")

if __name__ == "__main__":
    generate()
