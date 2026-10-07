"""
backfill_details.py — enrich the 100 imported games with detailed_description +
system requirements, and fill NULL fields (engine / genres / platforms / modes /
story) on original games.

Usage:
    python backfill_details.py          # DRY RUN
    python backfill_details.py --yes    # commit

Data files (gitignored):
    batch_details_100.json    — {name, detailed_description, sysreq{os,cpu,gpu,ram,storage}}
    batch_originals_meta.json — {name, {game_engine, genres, platforms, modes, story}}

Rules:
    * detailed_description: overwritten for the 100 new games only
    * systemrequirements: inserted if missing, updated if present (new games only)
    * originals: ONLY fields that are currently NULL/empty get filled —
      existing values are never overwritten
"""

import json
import os
import sys

from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_BACKEND_DIR, ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or not DATABASE_URL.strip():
    print("ERROR: DATABASE_URL is not set (backend/.env).")
    sys.exit(1)

COMMIT = "--yes" in sys.argv


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def get_or_create(cur, table, id_col, name_col, name, extra=None):
    cur.execute(f"SELECT {id_col} FROM {table} WHERE LOWER({name_col}) = %s", (name.lower(),))
    row = cur.fetchone()
    if row:
        return row[id_col]
    cols = [name_col] + list(extra.keys() if extra else [])
    vals = [name] + list(extra.values() if extra else [])
    cur.execute(
        f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(['%s'] * len(cols))}) RETURNING {id_col}",
        vals,
    )
    new_id = cur.fetchone()[id_col]
    print(f"    + created {name_col.replace('_name','').replace('_id','')}: {name}")
    return new_id


def backfill_new_games(conn, details):
    """detailed_description + systemrequirements for the 100 imported games."""
    ok = missing = errors = 0
    for entry in details:
        name = entry["name"]
        try:
            # Savepoint per game — one failure never aborts the rest
            with conn.transaction():
                cur = conn.cursor()
                cur.execute("SELECT game_id, detailed_description FROM games WHERE LOWER(game_name) = %s", (name.lower(),))
                row = cur.fetchone()
                if not row:
                    missing += 1
                    print(f"  MISSING in DB: {name}")
                    continue

                gid = row["game_id"]
                had = bool(row["detailed_description"])
                if COMMIT:
                    cur.execute("UPDATE games SET detailed_description = %s WHERE game_id = %s",
                                (entry["detailed_description"], gid))

                s = entry["sysreq"]
                # Recommended synthesized like the original seed script did
                rec = {
                    "recommended_cpu": s["cpu"],
                    "recommended_gpu": s["gpu"],
                    "recommended_ram": s["ram"],
                    "recommended_storage": s["storage"],
                }

                if COMMIT:
                    cur.execute("SELECT requirement_id FROM systemrequirements WHERE game_id = %s", (gid,))
                    sr = cur.fetchone()
                    if sr:
                        cur.execute(
                            """UPDATE systemrequirements SET operating_system=%s, minimum_cpu=%s, minimum_gpu=%s,
                               minimum_ram=%s, minimum_storage=%s, recommended_cpu=%s, recommended_gpu=%s,
                               recommended_ram=%s, recommended_storage=%s WHERE game_id=%s""",
                            (s["os"], s["cpu"], s["gpu"], s["ram"], s["storage"],
                             rec["recommended_cpu"], rec["recommended_gpu"], rec["recommended_ram"],
                             rec["recommended_storage"], gid),
                        )
                    else:
                        cur.execute(
                            """INSERT INTO systemrequirements (game_id, operating_system, minimum_cpu, minimum_gpu,
                               minimum_ram, minimum_storage, recommended_cpu, recommended_gpu, recommended_ram,
                               recommended_storage) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                            (gid, s["os"], s["cpu"], s["gpu"], s["ram"], s["storage"],
                             rec["recommended_cpu"], rec["recommended_gpu"], rec["recommended_ram"],
                             rec["recommended_storage"]),
                        )
                status = "ENRICHED" if COMMIT else "would enrich"
                print(f"  {status} [{gid}] {name}")
                ok += 1
        except Exception as e:
            errors += 1
            print(f"  ERROR on {name}: {e}")
    print(f"  -> new-games backfill: {ok} ok, {missing} missing, {errors} errors\n")
    return errors


def fill_original_nulls(conn, meta):
    """Fill ONLY null fields for original games (by name)."""
    filled = errors = 0
    for name, m in meta.items():
        try:
            with conn.transaction():
                cur = conn.cursor()
            cur.execute("SELECT game_id FROM games WHERE LOWER(game_name) = %s", (name.lower(),))
            row = cur.fetchone()
            if not row:
                print(f"  MISSING in DB: {name}")
                continue
            gid = row["game_id"]
            changes = []

            if m.get("game_engine"):
                cur.execute("SELECT game_engine FROM games WHERE game_id = %s", (gid,))
                if cur.fetchone()["game_engine"] in (None, ""):
                    if COMMIT:
                        cur.execute("UPDATE games SET game_engine = %s WHERE game_id = %s", (m["game_engine"], gid))
                    changes.append("engine")

            if m.get("genres"):
                cur.execute("SELECT COUNT(*) AS n FROM gamegenres WHERE game_id = %s", (gid,))
                if cur.fetchone()["n"] == 0:
                    for gname in m["genres"]:
                        ref = get_or_create(cur, "genres", "genre_id", "genre_name", gname)
                        if COMMIT:
                            cur.execute("INSERT INTO gamegenres (game_id, genre_id) VALUES (%s,%s) ON CONFLICT DO NOTHING", (gid, ref))
                    changes.append("genres")

            if m.get("platforms"):
                cur.execute("SELECT COUNT(*) AS n FROM gameplatforms WHERE game_id = %s", (gid,))
                if cur.fetchone()["n"] == 0:
                    for pname in m["platforms"]:
                        ref = get_or_create(cur, "platforms", "platform_id", "platform_name", pname)
                        if COMMIT:
                            cur.execute("INSERT INTO gameplatforms (game_id, platform_id) VALUES (%s,%s) ON CONFLICT DO NOTHING", (gid, ref))
                    changes.append("platforms")

            if m.get("modes"):
                cur.execute("SELECT COUNT(*) AS n FROM gamemodesrelation WHERE game_id = %s", (gid,))
                if cur.fetchone()["n"] == 0:
                    for mname in m["modes"]:
                        ref = get_or_create(cur, "gamemodes", "mode_id", "mode_name", mname)
                        if COMMIT:
                            cur.execute("INSERT INTO gamemodesrelation (game_id, mode_id) VALUES (%s,%s) ON CONFLICT DO NOTHING", (gid, ref))
                    changes.append("modes")

            if m.get("story"):
                cur.execute("SELECT COUNT(*) AS n FROM gamestory WHERE game_id = %s", (gid,))
                if cur.fetchone()["n"] == 0:
                    ref = get_or_create(cur, "storytypes", "story_id", "story_type", m["story"])
                    if COMMIT:
                        cur.execute("INSERT INTO gamestory (game_id, story_id) VALUES (%s,%s) ON CONFLICT DO NOTHING", (gid, ref))
                    changes.append("story")

            if changes:
                filled += 1
                print(f"  FILLED [{gid}] {name}: {', '.join(changes)}")
        except Exception as e:
            errors += 1
            print(f"  ERROR on {name}: {e}")
    print(f"  -> originals null-fill: {filled} games updated, {errors} errors\n")
    return errors


def main():
    details = load(os.path.join(_BACKEND_DIR, "batch_details_100.json"))
    meta = load(os.path.join(_BACKEND_DIR, "batch_originals_meta.json"))
    print(f"Mode: {'COMMIT (--yes)' if COMMIT else 'DRY RUN (use --yes to commit)'}\n")

    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)

    print("── Backfilling detailed descriptions + system requirements (100 new games)")
    errors = backfill_new_games(conn, details)
    print("── Filling NULL fields on original games")
    errors += fill_original_nulls(conn, meta)

    if COMMIT:
        conn.commit()
    else:
        conn.rollback()

    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS n FROM games WHERE detailed_description IS NOT NULL")
    have_about = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM systemrequirements")
    have_sysreq = cur.fetchone()["n"]
    conn.close()

    print(f"=== SUMMARY === games with detailed_description: {have_about}/200 | systemrequirements rows: {have_sysreq}/200")
    if not COMMIT:
        print("DRY RUN — nothing committed. Run with --yes to apply.")
    if errors:
        print(f"WARNING: {errors} errors occurred.")


if __name__ == "__main__":
    main()
