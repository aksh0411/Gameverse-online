import os, json, glob, psycopg
from psycopg.rows import dict_row

conn = psycopg.connect('host=localhost port=5432 dbname=games_db user=postgres password=1234')
conn.autocommit = True
cur = conn.cursor(row_factory=dict_row)

batch_files = sorted(glob.glob('backend/batch_*.json'))
print(f'Found {len(batch_files)} batch files.')
total_updated = 0

for bf in batch_files:
    with open(bf, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for item in data:
        gid = item['game_id']
        desc = item['detailed_description']
        cur.execute('UPDATE games SET detailed_description = %s WHERE game_id = %s', (desc, gid))
        total_updated += 1

print(f'Successfully updated {total_updated} games in database!')
cur.execute('SELECT COUNT(*) as count FROM games WHERE detailed_description IS NOT NULL')
res = cur.fetchone()
print(f"Total games with detailed descriptions in DB: {res['count']}")
