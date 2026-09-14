import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from psycopg_pool import ConnectionPool

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
        database.pool = ConnectionPool(conninfo=database.conninfo, open=False)
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
    except Exception as e:
        print(f" Database connection failed on startup: {e}")
        print("Please check your DB_PASSWORD in backend/.env")
    yield
    # Shutdown
    if database.pool:
        database.pool.close()

app = FastAPI(title="GAMEVERSE API", lifespan=lifespan)

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

@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    path = request.url.path.lower()
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
