"""
import_famous_100.py — bulk-insert games from batch_famous_100.json into the
GameVerse database (modeled on the original seed_50_games.py).

Usage:
    python import_famous_100.py          # DRY RUN — prints what would happen
    python import_famous_100.py --yes    # actually inserts

Safety:
    * skips any game whose lower(game_name) already exists (dedup guard)
    * get-or-creates developers / publishers / genres / platforms / modes /
      story types by name (never duplicates reference rows)
    * each game insert runs in its own transaction
    * all sequences re-synced at the end
"""

import json
import os
import sys
from datetime import datetime

from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_BACKEND_DIR, ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or not DATABASE_URL.strip():
    print("ERROR: DATABASE_URL is not set (backend/.env).")
    sys.exit(1)

BATCH_FILE = os.path.join(_BACKEND_DIR, "batch_famous_100.json")
COMMIT = "--yes" in sys.argv


def get_or_create(cur, table, id_col, name_col, name, extra=None):
    """Fetch a reference row id by lowercase name, inserting it if missing."""
    cur.execute(f"SELECT {id_col} FROM {table} WHERE LOWER({name_col}) = %s", (name.lower(),))
    row = cur.fetchone()
    if row:
        return row[id_col]
    cols = [name_col] + list(extra.keys() if extra else [])
    vals = [name] + list(extra.values() if extra else [])
    placeholders = ", ".join(["%s"] * len(cols))
    cur.execute(
        f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({placeholders}) RETURNING {id_col}",
        vals,
    )
    new_id = cur.fetchone()[id_col]
    print(f"    + created {table[:-1] if table.endswith('s') else table}: {name}")
    return new_id


def sync_sequence(cur, table, col):
    cur.execute(
        f"SELECT setval(pg_get_serial_sequence('{table}', '{col}'), "
        f"COALESCE((SELECT MAX({col}) FROM {table}), 0) + 1, false)"
    )


def main():
    with open(BATCH_FILE, encoding="utf-8") as f:
        games = json.load(f)
    print(f"Loaded {len(games)} games from batch_famous_100.json")
    print(f"Mode: {'COMMIT (--yes)' if COMMIT else 'DRY RUN (use --yes to insert)'}\n")

    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    inserted, skipped, errors = [], [], []

    for g in games:
        try:
            with conn.transaction():
                cur = conn.cursor()

                # Dedup guard — same guard the original seed script used
                cur.execute("SELECT game_id FROM games WHERE LOWER(game_name) = %s", (g["name"].lower(),))
                existing = cur.fetchone()
                if existing:
                    skipped.append(g["name"])
                    print(f"  SKIP (exists, id {existing['game_id']}): {g['name']}")
                    continue

                dev_id = get_or_create(cur, "developers", "developer_id", "developer_name",
                                       g["developer"][0], {"country": g["developer"][1]})
                pub_id = get_or_create(cur, "publishers", "publisher_id", "publisher_name",
                                       g["publisher"][0], {"country": g["publisher"][1]})

                cur.execute(
                    """INSERT INTO games
                       (game_name, description, developer_id, publisher_id, release_date,
                        rating, price, is_free_to_play, play_status, game_engine)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING game_id""",
                    (g["name"], g["description"], dev_id, pub_id,
                     datetime.strptime(g["release_date"], "%Y-%m-%d").date(),
                     g["rating"], g["price"], g["is_free"], g["play_status"], g["game_engine"]),
                )
                game_id = cur.fetchone()["game_id"]

                junction_map = {
                    "genres": ("gamegenres", "genre_id"),
                    "platforms": ("gameplatforms", "platform_id"),
                    "gamemodes": ("gamemodesrelation", "mode_id"),
                }
                for table, id_col, name_col, key in (
                    ("genres", "genre_id", "genre_name", "genres"),
                    ("platforms", "platform_id", "platform_name", "platforms"),
                    ("gamemodes", "mode_id", "mode_name", "modes"),
                ):
                    junction = junction_map[table][0]
                    for name in g.get(key, []):
                        ref_id = get_or_create(cur, table, id_col, name_col, name)
                        cur.execute(
                            f"INSERT INTO {junction} (game_id, {id_col}) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                            (game_id, ref_id),
                        )

                if g.get("story"):
                    story_id = get_or_create(cur, "storytypes", "story_id", "story_type", g["story"])
                    cur.execute(
                        "INSERT INTO gamestory (game_id, story_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                        (game_id, story_id),
                    )

                inserted.append((game_id, g["name"]))
                print(f"  INSERT game_id {game_id}: {g['name']}")

        except Exception as e:
            conn.rollback()
            errors.append((g["name"], str(e)))
            print(f"  ERROR on {g['name']}: {e}")

    if COMMIT:
        sync_sequence(conn.cursor(), "games", "game_id")
        sync_sequence(conn.cursor(), "developers", "developer_id")
        sync_sequence(conn.cursor(), "publishers", "publisher_id")
        conn.commit()
    else:
        conn.rollback()

    cur = conn.cursor(row_factory=dict_row)
    cur.execute("SELECT COUNT(*) AS n FROM games")
    total = cur.fetchone()["n"]
    conn.close()

    print(f"\n=== SUMMARY ===")
    print(f"Inserted: {len(inserted)} | Skipped (dupes): {len(skipped)} | Errors: {len(errors)}")
    print(f"Database total games now: {total} {'(committed)' if COMMIT else '(NOT committed — dry run)'}")
    if errors:
        print("Errors:")
        for name, msg in errors:
            print(f"  - {name}: {msg}")
    if not COMMIT:
        print("\nThis was a DRY RUN. Run with --yes to actually insert.")


if __name__ == "__main__":
    main()
