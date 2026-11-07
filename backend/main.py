import os
import sys
import time as _time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

_logger = logging.getLogger("gameverse.timing")

# Ensure backend directory is in sys.path so imports like 'import database' work
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import database

# Import routes
from auth import router as auth_router
from routes.games import router as games_router
from routes.genres import router as genres_router
from routes.platforms import router as platforms_router
from routes.developers import router as developers_router
from routes.publishers import router as publishers_router
from routes.stats import router as stats_router
from routes.modes import router as modes_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        database.pool = database.create_pool(open_pool=False)
        database.pool.open()
        print(" Connected to PostgreSQL database pool.")

        # Synchronize PostgreSQL sequences with existing data
        sync_tables = [
            ("games", "game_id"),
            ("systemrequirements", "requirement_id"),
            ("developers", "developer_id"),
            ("publishers", "publisher_id"),
            ("genres", "genre_id"),
            ("platforms", "platform_id"),
            ("gamemodes", "mode_id"),
            ("storytypes", "story_id")
        ]
        with database.pool.connection() as conn:
            conn.autocommit = True
            with conn.cursor() as cur:
                for table, col in sync_tables:
                    try:
                        cur.execute(f"""
                            SELECT setval(
                                pg_get_serial_sequence('{table}', '{col}'),
                                COALESCE((SELECT MAX({col}) FROM {table}), 0) + 1,
                                false
                            );
                        """)
                    except Exception as seq_err:
                        pass
        print(" Synced PostgreSQL primary key sequences.")

        # Create B-Tree indexes for fast relational lookups and catalog filtering
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_games_play_status ON games(play_status);",
            "CREATE INDEX IF NOT EXISTS idx_games_is_favorited ON games(is_favorited);",
            "CREATE INDEX IF NOT EXISTS idx_games_is_bookmarked ON games(is_bookmarked);",
            "CREATE INDEX IF NOT EXISTS idx_gamegenres_game_id ON gamegenres(game_id);",
            "CREATE INDEX IF NOT EXISTS idx_gamegenres_genre_id ON gamegenres(genre_id);",
            "CREATE INDEX IF NOT EXISTS idx_gameplatforms_game_id ON gameplatforms(game_id);",
            "CREATE INDEX IF NOT EXISTS idx_gameplatforms_platform_id ON gameplatforms(platform_id);",
            "CREATE INDEX IF NOT EXISTS idx_gamemodes_game_id ON gamemodesrelation(game_id);",
            "CREATE INDEX IF NOT EXISTS idx_gamestory_game_id ON gamestory(game_id);",
            "CREATE INDEX IF NOT EXISTS idx_systemreqs_game_id ON systemrequirements(game_id);"
        ]
        with database.pool.connection() as conn:
            conn.autocommit = True
            with conn.cursor() as cur:
                for idx_sql in indexes:
                    try:
                        cur.execute(idx_sql)
                    except Exception:
                        pass
        print(" Verified PostgreSQL B-Tree indexes.")
    except Exception as e:
        print(f" Database connection failed on startup: {e}")
        print("Please check your DATABASE_URL in backend/.env or Vercel Environment Variables")
    yield
    # Shutdown
    if database.pool:
        database.pool.close()

# Disable the auto docs in production (Vercel) — they advertise the whole API
# surface to strangers. Local development keeps /docs, /redoc and /openapi.json.
_is_prod = bool(os.getenv("VERCEL"))

app = FastAPI(
    title="GAMEVERSE API",
    lifespan=lifespan,
    docs_url=None if _is_prod else "/docs",
    redoc_url=None if _is_prod else "/redoc",
    openapi_url=None if _is_prod else "/openapi.json",
)

@app.get("/health")
@app.get("/api/health")
async def health():
    return {
        "message": "GAMEVERSE API is running",
        "docs": "/docs"
    }
# CORS configuration - Allow all origins including file:// and localhost
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTP response compression (gzip responses > 1 KB)
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.middleware("http")
async def add_timing_headers(request: Request, call_next):
    """Log request duration and pool stats in Server-Timing header (gated in production)."""
    start = _time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (_time.perf_counter() - start) * 1000

    # Gate Server-Timing & pool internals behind development / non-prod to avoid public telemetry leaks
    if not _is_prod:
        path = request.url.path
        if path.startswith("/api/") or path.startswith("/admin/"):
            parts = [f'total;dur={elapsed_ms:.1f};desc="Total"']
            try:
                from database import pool as _pool
                if _pool and not _pool.closed:
                    stats = _pool.get_stats()
                    parts.append(f'pool_size;dur={stats.get("pool_size", 0)};desc="Pool Size"')
                    parts.append(f'pool_available;dur={stats.get("pool_available", 0)};desc="Pool Available"')
                    parts.append(f'requests_waiting;dur={stats.get("requests_waiting", 0)};desc="Requests Waiting"')
                    parts.append(f'requests_num;dur={stats.get("requests_num", 0)};desc="Total Requests"')
            except Exception:
                pass

            response.headers["Server-Timing"] = ", ".join(parts)
            _logger.info(
                "%s %s  %.1f ms  (pool: %s)",
                request.method,
                path,
                elapsed_ms,
                parts[1:] if len(parts) > 1 else "n/a",
            )

    return response

@app.middleware("http")
async def add_cache_headers(request, call_next):
    response = await call_next(request)
    path = request.url.path.lower()
    if _is_prod:
        if path.endswith(('.js', '.css', '.woff2', '.png', '.jpg', '.jpeg', '.webp', '.svg')):
            # Allow caching of static assets in production (1 day + 7 day stale-while-revalidate)
            response.headers["Cache-Control"] = "public, max-age=86400, stale-while-revalidate=604800"
        elif path.endswith('.html') or path == '/':
            # Revalidate HTML so new deployments update immediately without redownloading static assets
            response.headers["Cache-Control"] = "no-cache"
    else:
        # Development: disable cache for rapid local iteration
        if path.endswith(('.html', '.js', '.css')) or path == '/':
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
    return response

# Include routes
app.include_router(auth_router)
app.include_router(games_router)
app.include_router(genres_router)
app.include_router(platforms_router)
app.include_router(developers_router)
app.include_router(publishers_router)
app.include_router(stats_router)
app.include_router(modes_router)

# Mount static files and frontend (supports both public/ and frontend/)
_project_dir = os.path.dirname(_backend_dir)
frontend_path = os.path.join(_project_dir, "public")
if not os.path.exists(frontend_path):
    frontend_path = os.path.join(_project_dir, "frontend")

static_path = os.path.join(frontend_path, "static")

if os.path.exists(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")

if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
