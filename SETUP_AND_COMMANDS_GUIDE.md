# GameVerse: Setup, Operations & Commands Guide

This guide documents the setup, command-line operations, cloud database management, and deployment workflow for the **GameVerse** application.

---

## 1. Project Architecture Overview

* **Backend**: FastAPI (Python 3.12+), asynchronous lifespan connection pooling via `psycopg 3` and `psycopg_pool`.
* **Database**: Managed PostgreSQL hosted on **Supabase** (currently populated with **100 unique games** with complete developer, publisher, genre, platform, and system requirements data).
* **Frontend**: Vanilla HTML5, CSS3, and JavaScript, served directly by FastAPI static file mounting.
* **API Documentation**: Interactive Swagger UI at `/docs`.

---

## 2. Environment Configuration (`backend/.env`)

The backend configuration lives in `backend/.env`.

```env
# Cloud Database (Supabase)
DATABASE_URL=postgresql://postgres:Gameverse23aksh@db.unxmuodcltqyywggihdh.supabase.co:5432/postgres

# Fallback Local Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=games_db
DB_USER=postgres
DB_PASSWORD=1234

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$WvZYgsG1DEbWjlWZfGG1P.7hA2x5O0AhfuYCmgZEQQ0GPV83I9/NW
JWT_SECRET=gameverse-super-secret-jwt-key-2026
```

### How to Switch Between Cloud (Supabase) and Local (Offline)
* **To use Supabase (Online)**: Keep `DATABASE_URL` uncommented.
* **To use Local PostgreSQL (Offline)**: Add a `#` at the start of `DATABASE_URL`:
  ```env
  # DATABASE_URL=postgresql://...
  ```
  *(FastAPI will automatically fall back to your local `localhost:5432` PostgreSQL database).*

---

## 3. Essential Command-Line Cheat Sheet

All commands below are tailored for **Windows PowerShell** (and Bash equivalents where applicable).

### A. Virtual Environment (`venv`)
Navigate to the `backend` directory first:
```powershell
cd backend
```

* **Activate Virtual Environment (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(If PowerShell gives a script execution policy error, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*

* **Activate Virtual Environment (Command Prompt / CMD)**:
  ```cmd
  venv\Scripts\activate.bat
  ```

* **Activate Virtual Environment (Git Bash / Linux / macOS)**:
  ```bash
  source venv/Scripts/activate     # on Windows Git Bash
  # or
  source venv/bin/activate         # on Linux/macOS
  ```

* **Deactivate Virtual Environment**:
  ```powershell
  deactivate
  ```

---

### B. Running the FastAPI Server

* **Standard Development Mode (with Auto-Reload)**:
  ```powershell
  cd backend
  .\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
  ```

* **If virtual environment is already activated**:
  ```powershell
  uvicorn main:app --reload --port 8000
  ```

* **Access the App**:
  * **Frontend Website**: [http://localhost:8000/](http://localhost:8000/)
  * **Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
  * **Alternative API Docs (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### C. Supabase Database Operations (CLI)

Your PostgreSQL CLI tools are installed at `C:\Program Files\PostgreSQL\18\bin\`.

* **Connect to Supabase directly via `psql`**:
  ```powershell
  $env:PGPASSWORD="Gameverse23aksh"
  & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h db.unxmuodcltqyywggihdh.supabase.co -U postgres -d postgres -p 5432
  ```

* **Quick SQL Query on Supabase from Terminal**:
  ```powershell
  $env:PGPASSWORD="Gameverse23aksh"
  & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h db.unxmuodcltqyywggihdh.supabase.co -U postgres -d postgres -p 5432 -c "SELECT count(*) FROM games;"
  ```

* **Create a Full SQL Backup of Supabase to a File**:
  ```powershell
  $env:PGPASSWORD="Gameverse23aksh"
  & "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -h db.unxmuodcltqyywggihdh.supabase.co -U postgres -d postgres -p 5432 --clean --if-exists --no-owner --no-acl -f "backup_$(Get-Date -Format 'yyyyMMdd_HHmm').sql"
  ```

* **Restore a SQL Backup into Supabase**:
  ```powershell
  $env:PGPASSWORD="Gameverse23aksh"
  & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h db.unxmuodcltqyywggihdh.supabase.co -U postgres -d postgres -p 5432 -f "SQL\all_100_games_backup.sql"
  ```

---

### D. Data Scripts

* **Re-run or Seed New Games**:
  ```powershell
  cd backend
  .\venv\Scripts\python.exe seed_50_games.py
  ```
  *(This script checks if games already exist and safely skips duplicates).*

---

## 4. Deploying Online (Render.com + Supabase)

When you are ready to host the entire app online for free:

### Step 1: Push Code to GitHub
```powershell
# From the project root folder
git add .
git commit -m "Configure cloud database and production settings"
git push origin main
```

### Step 2: Create Web Service on Render
1. Log in to [Render.com](https://render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   * **Name**: `gameverse`
   * **Language**: `Python 3`
   * **Branch**: `main`
   * **Build Command**:
     ```bash
     pip install -r backend/requirements.txt
     ```
   * **Start Command**:
     ```bash
     cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
4. Under **Environment Variables**, add:
   * `DATABASE_URL`: `postgresql://postgres:Gameverse23aksh@db.unxmuodcltqyywggihdh.supabase.co:5432/postgres`
   * `JWT_SECRET`: `gameverse-super-secret-jwt-key-2026`
   * `ADMIN_USERNAME`: `admin`
   * `ADMIN_PASSWORD_HASH`: `$2b$12$WvZYgsG1DEbWjlWZfGG1P.7hA2x5O0AhfuYCmgZEQQ0GPV83I9/NW`

5. Click **Deploy Web Service**. Once built, Render will provide a public HTTPS URL (e.g., `https://gameverse.onrender.com`).

---

## 5. Database Schema & Relations Summary

```
games (100 rows)
  ├── developer_id ───────> developers
  ├── publisher_id ───────> publishers
  ├── gamegenres ─────────> genres (25 categories)
  ├── gameplatforms ──────> platforms (PC, PS5, PS4, Xbox Series X/S, Switch, etc.)
  ├── gamemodesrelation ──> gamemodes (Single Player, Multiplayer, Co-op, PvP, etc.)
  ├── gamestory ──────────> storytypes (Linear, Branching, Sandbox, Procedural)
  └── systemrequirements ─> OS, minimum & recommended CPU, GPU, RAM, Storage
```

---

## 6. Troubleshooting & Handy Tips

### Port 8000 Already in Use
If uvicorn says `[Errno 10048] address already in use`:
```powershell
# Find process using port 8000
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
```

### Special Characters in Database Password
If you ever change your Supabase password and it contains symbols like `@`, `#`, or `%`, you must percent-encode them in the URL:
* `@` ➔ `%40`
* `#` ➔ `%23`
* `%` ➔ `%25`
* Example: `Harsh@2026` ➔ `Harsh%402026`

### Primary Key Sequence Out-of-Sync Error
If manually inserting data ever causes `duplicate key value violates unique constraint "games_pkey"`:
The backend automatically resynchronizes sequence counters on startup in `backend/main.py`. Simply restarting the FastAPI server will re-align all sequence IDs.
