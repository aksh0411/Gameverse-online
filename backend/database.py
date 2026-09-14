import os
from contextlib import contextmanager
from dotenv import load_dotenv
from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row

# Load from backend/.env or root .env
_backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_backend_dir, ".env"))
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    conninfo = DATABASE_URL
else:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "games_db")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "your_password_here")
    conninfo = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"


# Initialize pool as None, will be set in main.py lifespan or lazily on first request
pool = None

def get_connection_pool():
    global pool
    if pool is None or pool.closed:
        pool = ConnectionPool(
            conninfo=conninfo,
            min_size=1,
            max_size=3,
            check=ConnectionPool.check_connection,
            open=True
        )
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
