# 🎮 Gameverse — Personal Game Collection Universe

A cinematic, immersive personal game library built as a full-stack web application. Track, organize, and explore your entire game collection through a dimensional, space-themed interface featuring 3D visualizations, orbital radar, and poster carousels.

![Python](https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r150+-black?logo=three.js&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)

---

## ✨ Features

- **3D Hero Visualization** — Rotating wireframe icosahedron with orbital particle systems, bloom flares, and magnetic cursor interactions (Three.js)
- **Dimensional Radar Core** — Interactive 4D orbital radar that maps your game collection across five concentric dimensional rings with genre/platform clustering
- **Poster Carousels** — Smooth horizontal carousels for browsing your library, favorites, and currently-playing games
- **Game Detail Pages** — Rich detail view with hero wallpapers, system requirements, genre tags, and gameplay info
- **Admin Dashboard** — JWT-authenticated admin panel to add, edit, and delete games directly from the UI
- **Smart Search** — Real-time fuzzy search with tag-based filtering across genres, platforms, and play status
- **Bookmark & Favorites** — Mark games as bookmarked, favorited, playing, or completed
- **Fully Responsive** — Optimized for desktop, tablet, and mobile with touch-friendly swipe carousels
- **Supabase + Local PostgreSQL** — Dual database support with seamless switching via environment variables

---

## 🏗️ Project Structure

```
gameverse/
├── public/                  # Frontend (served as static files)
│   ├── index.html           # Home page — hero, radar, carousels, about
│   ├── game.html            # Game detail page
│   ├── css/
│   │   ├── style.css        # Global styles, variables, glass panels
│   │   ├── home.css         # Hero, collection core, about section
│   │   ├── cards.css        # Poster cards & game grid cards
│   │   ├── game-detail.css  # Game detail page styles
│   │   ├── admin.css        # Admin panel styles
│   │   └── responsive.css   # Mobile & tablet breakpoints
│   ├── js/
│   │   ├── collection-core.js  # Three.js hero scene + orbital radar
│   │   ├── home.js          # Homepage initialization & data loading
│   │   ├── cards.js         # Poster card & game card rendering
│   │   ├── game-detail.js   # Game detail page logic
│   │   ├── api.js           # API client helper (fetch wrapper)
│   │   ├── auth.js          # JWT auth & admin session handling
│   │   ├── admin.js         # Admin CRUD panel logic
│   │   └── search.js        # Search & filter functionality
│   └── static/              # Game posters, wallpapers, icons
│
├── backend/                 # FastAPI Python backend
│   ├── main.py              # App entry point, lifespan, middleware
│   ├── database.py          # PostgreSQL connection pool (psycopg3)
│   ├── auth.py              # JWT authentication routes
│   ├── routes/
│   │   ├── games.py         # CRUD for games (GET/POST/PUT/DELETE)
│   │   ├── genres.py        # Genre listing
│   │   ├── platforms.py     # Platform listing
│   │   ├── developers.py    # Developer listing
│   │   ├── publishers.py    # Publisher listing
│   │   ├── modes.py         # Game mode listing
│   │   └── stats.py         # Dashboard stats (counts, totals)
│   ├── .env.example         # Environment variable template
│   └── requirements.txt     # Python dependencies
│
├── api/                     # Vercel serverless adapter
│   ├── index.py             # Root route handler
│   └── [...path].py         # Catch-all route for FastAPI
│
├── vercel.json              # Vercel deployment config
├── requirements.txt         # Root dependencies (for Vercel)
├── start_gameverse.bat      # One-click local server launcher (Windows)
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.12+**
- **PostgreSQL 15+** (local) or a **Supabase** project
- **Node.js** is NOT required — the frontend is pure vanilla HTML/CSS/JS

### 1. Clone the repository

```bash
git clone https://github.com/aksh0411/test-2.git
cd test-2
```

### 2. Set up the database

Create a PostgreSQL database named `games_db`:

```sql
CREATE DATABASE games_db;
```

The app will auto-sync sequences on startup. Use your own SQL migrations or seed data to populate games.

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your credentials:

```env
# Option A: Supabase (cloud)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Option B: Local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=games_db
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$...your_bcrypt_hash...
JWT_SECRET=your-random-secret-key-here
```

> **Tip:** Generate a password hash with:
> ```python
> from passlib.hash import bcrypt
> print(bcrypt.hash("your_password"))
> ```

### 4. Install dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

### 5. Start the server

**Option A — Using the batch script (Windows):**
```bash
start_gameverse.bat
```

**Option B — Manual:**
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 6. Open in browser

```
http://127.0.0.1:8000
```

---

## 🌐 Deploy to Vercel

The project is pre-configured for Vercel deployment:

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Set the environment variables in Vercel's dashboard (same as `.env`)
4. Deploy — Vercel will use the `api/` serverless functions and serve `public/` as static assets

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/games` | List all games (supports `?limit=`, `?genre=`, `?platform=`) |
| `GET` | `/api/games/{id}` | Get game details by ID |
| `POST` | `/api/games` | Add a new game (admin auth required) |
| `PUT` | `/api/games/{id}` | Update a game (admin auth required) |
| `DELETE` | `/api/games/{id}` | Delete a game (admin auth required) |
| `GET` | `/api/stats` | Get collection stats (total, playing, completed, bookmarked) |
| `GET` | `/api/genres` | List all genres |
| `GET` | `/api/platforms` | List all platforms |
| `GET` | `/api/developers` | List all developers |
| `GET` | `/api/publishers` | List all publishers |
| `GET` | `/api/modes` | List all game modes |
| `POST` | `/api/login` | Admin login (returns JWT) |
| `GET` | `/health` | Health check |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **3D Graphics** | Three.js (WebGL) |
| **Backend** | Python, FastAPI, Uvicorn |
| **Database** | PostgreSQL (psycopg3 + connection pooling) |
| **Auth** | JWT (python-jose) + bcrypt password hashing |
| **Hosting** | Vercel (serverless) / Local |
| **Cloud DB** | Supabase (PostgreSQL) |

---

## 📱 Responsive Design

- **Desktop** (>992px) — Full 2-column hero grid, sidebar with vertical filter cards, large orbital radar
- **Tablet** (768–992px) — Stacked layout, horizontal filter tabs, compact radar
- **Mobile** (<768px) — Single-column, 4-column stats grid, 2×2 filter grid, touch-swipe carousels
- **Small Mobile** (<480px) — Extra-compact typography, icon-only filter buttons

---

## 📄 License

This is a personal project. Feel free to explore and learn from the code.

---

<p align="center">
  <em>One Life, Many Worlds 🌌</em>
</p>