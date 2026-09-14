import os
import math
import random
from PIL import Image, ImageDraw, ImageFont
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

# Curated thematic color palettes for each game
GAME_THEMES = {
    1: {"tag": "METROIDVANIA", "c1": (24, 18, 38), "c2": (120, 30, 60), "accent": (230, 80, 110), "glow": (255, 140, 160)}, # Blasphemous 2
    2: {"tag": "SOULSLIKE", "c1": (22, 18, 12), "c2": (85, 60, 20), "accent": (235, 185, 75), "glow": (255, 220, 130)},    # Elden Ring
    3: {"tag": "CRPG", "c1": (18, 12, 28), "c2": (70, 25, 95), "accent": (195, 120, 245), "glow": (230, 180, 255)},        # Baldur's Gate 3
    4: {"tag": "OPEN WORLD", "c1": (28, 14, 10), "c2": (110, 35, 15), "accent": (235, 90, 45), "glow": (255, 160, 100)},    # Red Dead Redemption 2
    5: {"tag": "ACTION", "c1": (12, 22, 24), "c2": (25, 80, 70), "accent": (50, 215, 170), "glow": (140, 245, 210)},       # GTA V
    6: {"tag": "CYBERPUNK", "c1": (18, 12, 25), "c2": (90, 20, 75), "accent": (255, 225, 45), "glow": (55, 225, 255)},     # Cyberpunk 2077
    7: {"tag": "ACTION RPG", "c1": (20, 18, 22), "c2": (60, 20, 25), "accent": (210, 50, 55), "glow": (245, 140, 145)},     # Witcher 3
    8: {"tag": "ACTION RPG", "c1": (25, 18, 12), "c2": (95, 55, 20), "accent": (245, 165, 45), "glow": (255, 215, 120)},    # Black Myth: Wukong
    9: {"tag": "METROIDVANIA", "c1": (10, 14, 25), "c2": (25, 45, 80), "accent": (130, 190, 245), "glow": (200, 230, 255)}, # Hollow Knight
    10: {"tag": "ROGUELIKE", "c1": (30, 10, 15), "c2": (115, 25, 30), "accent": (250, 95, 50), "glow": (255, 190, 70)},    # Hades
    11: {"tag": "ROGUELIKE", "c1": (15, 12, 28), "c2": (65, 25, 105), "accent": (215, 85, 180), "glow": (255, 160, 230)},  # Dead Cells
    12: {"tag": "SANDBOX", "c1": (12, 24, 15), "c2": (30, 85, 40), "accent": (95, 215, 110), "glow": (175, 250, 185)},     # Minecraft
    13: {"tag": "SANDBOX", "c1": (15, 22, 28), "c2": (35, 75, 100), "accent": (75, 195, 225), "glow": (165, 240, 255)},    # Terraria
    14: {"tag": "SIMULATION", "c1": (20, 25, 12), "c2": (70, 90, 30), "accent": (210, 195, 60), "glow": (250, 240, 150)},   # Stardew Valley
    15: {"tag": "SPACE SIM", "c1": (12, 10, 30), "c2": (40, 20, 95), "accent": (230, 75, 165), "glow": (90, 210, 255)},    # No Man's Sky
    16: {"tag": "SURVIVAL", "c1": (8, 20, 28), "c2": (15, 70, 95), "accent": (45, 205, 215), "glow": (145, 245, 250)},      # Subnautica
    17: {"tag": "SURVIVAL", "c1": (15, 22, 20), "c2": (40, 75, 65), "accent": (110, 205, 165), "glow": (185, 245, 215)},    # Valheim
    18: {"tag": "ACTION ADVENTURE", "c1": (25, 16, 16), "c2": (90, 30, 30), "accent": (225, 75, 65), "glow": (250, 165, 150)}, # God of War
    19: {"tag": "ACTION ADVENTURE", "c1": (14, 20, 30), "c2": (35, 60, 100), "accent": (110, 180, 245), "glow": (195, 230, 255)}, # God of War Ragnarok
    20: {"tag": "OPEN WORLD", "c1": (28, 14, 16), "c2": (100, 35, 40), "accent": (235, 95, 95), "glow": (255, 195, 195)},   # Ghost of Tsushima
    21: {"tag": "ACTION", "c1": (26, 12, 16), "c2": (105, 25, 35), "accent": (235, 55, 70), "glow": (90, 175, 255)},       # Spider-Man Remastered
    22: {"tag": "ACTION", "c1": (22, 12, 28), "c2": (80, 20, 90), "accent": (225, 60, 140), "glow": (255, 140, 200)},      # Spider-Man 2
    23: {"tag": "ACTION RPG", "c1": (12, 22, 26), "c2": (25, 80, 95), "accent": (65, 215, 210), "glow": (160, 245, 240)},   # Horizon Zero Dawn
    24: {"tag": "ACTION RPG", "c1": (15, 24, 22), "c2": (35, 90, 75), "accent": (75, 225, 175), "glow": (175, 250, 215)},   # Horizon Forbidden West
    25: {"tag": "SOULSLIKE", "c1": (26, 16, 12), "c2": (95, 45, 20), "accent": (235, 125, 50), "glow": (255, 195, 130)},    # Sekiro
    26: {"tag": "SOULSLIKE", "c1": (18, 18, 20), "c2": (60, 55, 60), "accent": (190, 175, 160), "glow": (235, 220, 205)},   # Dark Souls Remastered
    27: {"tag": "SOULSLIKE", "c1": (26, 15, 10), "c2": (95, 40, 15), "accent": (235, 110, 40), "glow": (255, 180, 110)},    # Dark Souls III
    28: {"tag": "SOULSLIKE", "c1": (18, 10, 16), "c2": (70, 18, 35), "accent": (195, 45, 75), "glow": (240, 130, 155)},     # Bloodborne
    29: {"tag": "SOULSLIKE", "c1": (14, 18, 26), "c2": (35, 55, 85), "accent": (120, 170, 235), "glow": (195, 220, 255)},   # Lies of P
    30: {"tag": "HORROR", "c1": (24, 14, 12), "c2": (85, 30, 20), "accent": (220, 75, 45), "glow": (250, 155, 120)},       # RE4 Remake
    31: {"tag": "HORROR", "c1": (16, 18, 22), "c2": (45, 55, 70), "accent": (160, 185, 215), "glow": (220, 235, 250)},     # RE Village
    32: {"tag": "FPS", "c1": (30, 10, 10), "c2": (120, 20, 15), "accent": (250, 65, 35), "glow": (255, 165, 60)},          # DOOM Eternal
    33: {"tag": "FPS", "c1": (28, 12, 10), "c2": (110, 25, 18), "accent": (240, 80, 40), "glow": (255, 170, 80)},          # DOOM
    34: {"tag": "JRPG", "c1": (28, 10, 14), "c2": (115, 20, 30), "accent": (245, 45, 65), "glow": (255, 245, 60)},          # Persona 5 Royal
    35: {"tag": "JRPG", "c1": (12, 20, 26), "c2": (25, 75, 95), "accent": (60, 215, 200), "glow": (165, 250, 235)},        # FF VII Remake
    36: {"tag": "JRPG", "c1": (26, 12, 14), "c2": (100, 25, 30), "accent": (235, 70, 55), "glow": (255, 175, 120)},        # FF XVI
    37: {"tag": "ACTION RPG", "c1": (16, 22, 18), "c2": (45, 80, 50), "accent": (125, 215, 110), "glow": (205, 250, 180)},  # MH World
    38: {"tag": "ACTION RPG", "c1": (24, 16, 14), "c2": (85, 45, 25), "accent": (230, 140, 65), "glow": (255, 200, 135)},   # MH Rise
    39: {"tag": "CO-OP SHOOTER", "c1": (14, 20, 28), "c2": (35, 70, 105), "accent": (250, 215, 45), "glow": (120, 200, 255)},# Helldivers 2
    40: {"tag": "FPS", "c1": (24, 18, 12), "c2": (85, 55, 20), "accent": (235, 155, 45), "glow": (255, 215, 130)},        # Counter-Strike 2
    41: {"tag": "FPS", "c1": (26, 12, 16), "c2": (105, 25, 40), "accent": (245, 65, 85), "glow": (255, 160, 175)},         # Valorant
    42: {"tag": "MOBA", "c1": (14, 20, 30), "c2": (30, 65, 105), "accent": (80, 185, 245), "glow": (210, 175, 80)},         # League of Legends
    43: {"tag": "MOBA", "c1": (26, 14, 12), "c2": (95, 30, 20), "accent": (235, 75, 45), "glow": (255, 165, 110)},         # Dota 2
    44: {"tag": "BATTLE ROYALE", "c1": (16, 14, 32), "c2": (55, 30, 115), "accent": (220, 75, 245), "glow": (65, 225, 255)}, # Fortnite
    45: {"tag": "BATTLE ROYALE", "c1": (22, 18, 14), "c2": (75, 50, 25), "accent": (225, 150, 50), "glow": (255, 205, 125)}, # PUBG
    46: {"tag": "BATTLE ROYALE", "c1": (25, 14, 12), "c2": (95, 35, 20), "accent": (235, 85, 45), "glow": (255, 180, 120)},  # Apex Legends
    47: {"tag": "TACTICAL FPS", "c1": (18, 18, 22), "c2": (50, 55, 70), "accent": (225, 180, 50), "glow": (140, 195, 245)}, # Rainbow Six Siege
    48: {"tag": "PUZZLE", "c1": (10, 20, 26), "c2": (20, 70, 95), "accent": (60, 205, 245), "glow": (245, 150, 45)},       # Portal 2
    49: {"tag": "PLATFORMER", "c1": (18, 14, 30), "c2": (65, 35, 105), "accent": (235, 95, 180), "glow": (130, 225, 255)},  # Celeste
    50: {"tag": "METROIDVANIA", "c1": (10, 22, 26), "c2": (25, 85, 105), "accent": (75, 225, 235), "glow": (245, 230, 120)}, # Ori
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

    # 1. Background multi-layered gradient
    for y in range(H):
        ratio = y / H
        t = math.pow(ratio, 1.2)
        r = int(c1[0] * (1 - t) + c2[0] * t * 0.7)
        g = int(c1[1] * (1 - t) + c2[1] * t * 0.7)
        b = int(c1[2] * (1 - t) + c2[2] * t * 0.7)
        draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

    # 2. Glowing atmospheric radial shapes
    glow_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_overlay)
    
    # Center ambient burst
    cx, cy = W // 2, int(H * 0.45)
    for rad in range(320, 20, -15):
        alpha = int(22 * (1 - rad / 320))
        glow_draw.ellipse(
            [cx - rad, cy - int(rad * 0.8), cx + rad, cy + int(rad * 0.8)],
            fill=(accent[0], accent[1], accent[2], alpha)
        )
    
    # Top right secondary glow
    for rad in range(200, 10, -15):
        alpha = int(18 * (1 - rad / 200))
        glow_draw.ellipse(
            [W - 40 - rad, 80 - rad, W - 40 + rad, 80 + rad],
            fill=(glow[0], glow[1], glow[2], alpha)
        )

    img = Image.alpha_composite(img, glow_overlay)
    draw = ImageDraw.Draw(img)

    # 3. Geometric grid & cybernetic accents
    grid_color = (255, 255, 255, 12)
    for gx in range(40, W, 60):
        draw.line([(gx, 40), (gx, H - 40)], fill=grid_color, width=1)
    for gy in range(40, H, 60):
        draw.line([(40, gy), (W - 40, gy)], fill=grid_color, width=1)

    # Isometric diagonal decorative lines
    diag_color = (accent[0], accent[1], accent[2], 25)
    for d in range(-200, W + 400, 120):
        draw.line([(d, 0), (d + 300, 600)], fill=diag_color, width=1)

    # Center Hero Emblem / Geometric Ring
    emblem_center = (W // 2, int(H * 0.42))
    # Outer ring
    draw.ellipse(
        [emblem_center[0] - 160, emblem_center[1] - 160, emblem_center[0] + 160, emblem_center[1] + 160],
        outline=(accent[0], accent[1], accent[2], 90),
        width=2
    )
    # Middle dashed ring
    draw.ellipse(
        [emblem_center[0] - 130, emblem_center[1] - 130, emblem_center[0] + 130, emblem_center[1] + 130],
        outline=(glow[0], glow[1], glow[2], 60),
        width=1
    )
    # Inner diamond
    id_rad = 90
    diamond = [
        (emblem_center[0], emblem_center[1] - id_rad),
        (emblem_center[0] + id_rad, emblem_center[1]),
        (emblem_center[0] + id_rad, emblem_center[1] + id_rad), # shape
    ]
    diamond = [
        (emblem_center[0], emblem_center[1] - id_rad),
        (emblem_center[0] + id_rad, emblem_center[1]),
        (emblem_center[0], emblem_center[1] + id_rad),
        (emblem_center[0] - id_rad, emblem_center[1])
    ]
    draw.polygon(diamond, outline=(accent[0], accent[1], accent[2], 140), width=2)

    # Decorative crosshairs on emblem
    draw.line([(emblem_center[0] - 180, emblem_center[1]), (emblem_center[0] - 140, emblem_center[1])], fill=accent, width=2)
    draw.line([(emblem_center[0] + 140, emblem_center[1]), (emblem_center[0] + 180, emblem_center[1])], fill=accent, width=2)
    draw.line([(emblem_center[0], emblem_center[1] - 180), (emblem_center[0], emblem_center[1] - 140)], fill=accent, width=2)
    draw.line([(emblem_center[0], emblem_center[1] + 140), (emblem_center[0], emblem_center[1] + 180)], fill=accent, width=2)

    # Large stylized game number watermark in center
    try:
        font_num = ImageFont.truetype("arialbd.ttf", 90)
    except:
        font_num = ImageFont.load_default()
    
    num_str = f"{game_id:02d}"
    bbox = draw.textbbox((0, 0), num_str, font=font_num)
    nw = bbox[2] - bbox[0]
    nh = bbox[3] - bbox[1]
    draw.text(
        (emblem_center[0] - nw // 2, emblem_center[1] - nh // 2 - 5),
        num_str,
        font=font_num,
        fill=(255, 255, 255, 210)
    )

    # 4. Outer Card Border
    draw.rounded_rectangle([20, 20, W - 20, H - 20], radius=18, outline=(187, 174, 223, 50), width=2)
    draw.line([(28, 45), (45, 45)], fill=accent, width=3)
    draw.line([(28, 45), (28, 62)], fill=accent, width=3)
    draw.line([(W - 45, 45), (W - 28, 45)], fill=accent, width=3)
    draw.line([(W - 28, 45), (W - 28, 62)], fill=accent, width=3)

    # Fonts
    try:
        font_badge = ImageFont.truetype("arialbd.ttf", 16)
        font_sub = ImageFont.truetype("arial.ttf", 13)
        font_title = ImageFont.truetype("arialbd.ttf", 36)
        font_rating = ImageFont.truetype("arialbd.ttf", 20)
    except:
        font_badge = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_rating = ImageFont.load_default()

    # Top left: GAMEVERSE CORE
    draw.text((45, 45), "GAMEVERSE", font=font_badge, fill=(220, 210, 240, 230))
    draw.text((45, 66), f"EDITION // NO. {game_id:02d}", font=font_sub, fill=(160, 150, 190, 180))

    # Top right: Rating Badge
    score_str = f"★ {rating:.1f}" if rating else "★ 9.0"
    r_bbox = draw.textbbox((0, 0), score_str, font=font_rating)
    rw = r_bbox[2] - r_bbox[0]
    badge_x = W - 45 - rw - 24
    draw.rounded_rectangle([badge_x, 42, W - 45, 78], radius=8, fill=(18, 12, 28, 200), outline=accent, width=1)
    draw.text((badge_x + 12, 48), score_str, font=font_rating, fill=glow)

    # 5. Bottom Title Section & Information Plaque
    panel_y = int(H * 0.68)
    
    panel_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(panel_overlay)
    p_draw.rounded_rectangle([32, panel_y, W - 32, H - 36], radius=16, fill=(8, 6, 14, 220), outline=(accent[0], accent[1], accent[2], 100), width=1)
    img = Image.alpha_composite(img, panel_overlay)
    draw = ImageDraw.Draw(img)

    # Genre pill tag inside plaque
    tag_bbox = draw.textbbox((0, 0), tag, font=font_badge)
    tw = tag_bbox[2] - tag_bbox[0]
    draw.rounded_rectangle([52, panel_y + 24, 52 + tw + 20, panel_y + 50], radius=6, fill=(accent[0], accent[1], accent[2], 40), outline=accent, width=1)
    draw.text((62, panel_y + 28), tag, font=font_badge, fill=accent)

    # Wrap title text nicely
    clean_title = title.upper()
    words = clean_title.split(' ')
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        t_box = draw.textbbox((0, 0), test_line, font=font_title)
        if (t_box[2] - t_box[0]) < (W - 120):
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))

    # Render Title
    ty = panel_y + 64
    for line in lines[:2]: # Max 2 lines
        draw.text((54, ty + 2), line, font=font_title, fill=(0, 0, 0, 200))
        draw.text((52, ty), line, font=font_title, fill=(255, 255, 255, 255))
        ty += 44

    # Bottom footer accents
    draw.line([(52, H - 65), (W - 52, H - 65)], fill=(187, 174, 223, 40), width=1)
    draw.text((52, H - 56), "ARCHIVE RECORD // VERIFIED 4D NODE", font=font_sub, fill=(150, 140, 180, 160))
    draw.text((W - 145, H - 56), "● CONNECTED", font=font_sub, fill=accent)

    return img

def generate_all():
    print(f"Connecting to database to fetch games...")
    with psycopg.connect(conninfo) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT game_id, game_name, rating FROM games ORDER BY game_id")
            games = cur.fetchall()

            print(f"Generating {len(games)} procedural banner cards...")
            for game_id, game_name, rating in games:
                theme = GAME_THEMES.get(game_id, {
                    "tag": "ACTION",
                    "c1": (18, 14, 28),
                    "c2": (75, 30, 90),
                    "accent": (210, 100, 220),
                    "glow": (245, 170, 255)
                })
                
                poster = create_game_poster(game_id, game_name, float(rating) if rating else 9.0, theme)
                
                filename = f"game_{game_id}.png"
                out_path = os.path.join(OUTPUT_DIR, filename)
                poster.save(out_path, "PNG", optimize=True)
                
                db_img_url = f"/static/images/{filename}"
                cur.execute("UPDATE games SET cover_image = %s WHERE game_id = %s", [db_img_url, game_id])
                print(f"  [+] #{game_id:02d} '{game_name}' -> {filename} (Updated DB)")
            
            conn.commit()
            print(f"\n[OK] Successfully generated and synced all {len(games)} game images!")

if __name__ == "__main__":
    generate_all()
