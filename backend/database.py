import os
from contextlib import contextmanager
from dotenv import load_dotenv
from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row

# Load from backend/.env or root .env
_backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_backend_dir, ".env"))
load_dotenv()

# Supabase PostgreSQL Pooler Connection String (Transaction Mode port 6543 for serverless/Vercel)
SUPABASE_URL = "postgresql://postgres.unxmuodcltqyywggihdh:avinash2004aksh@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or not DATABASE_URL.strip():
    DATABASE_URL = SUPABASE_URL

conninfo = DATABASE_URL

# Initialize pool as None, will be set in main.py lifespan or lazily on first request
pool = None

def create_pool(open_pool: bool = True):
    return ConnectionPool(
        conninfo=conninfo,
        min_size=1,
        max_size=3,
        max_idle=30.0,
        max_lifetime=180.0,
        check=ConnectionPool.check_connection,
        open=open_pool
    )

def get_connection_pool():
    global pool
    if pool is None or pool.closed:
        pool = create_pool(open_pool=True)
    return pool

def get_db():
    """Yield a cursor with autocommit enabled.

    With autocommit the connection is never left inside a failed transaction
    block, and each SQL statement commits immediately.  Routes that need
    atomicity across multiple statements use an explicit
    ``with conn.transaction():`` block — which is the correct pattern in
    psycopg 3.
    """
    p = get_connection_pool()
    with p.connection() as conn:
        conn.autocommit = True
        with conn.cursor(row_factory=dict_row) as cur:
            yield cur
