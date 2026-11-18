# 🎮 Gameverse — Personal Game Collection Universe

A cinematic, immersive personal game library built as a full-stack web application. Track, organize, and explore your entire game collection through a dimensional, space-themed interface featuring 3D visualizations, orbital radar, widescreen card grids, and personalized gamer profiles.

![Python](https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres-3ECF8E?logo=supabase&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r150+-black?logo=three.js&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)

---

## ✨ Features

- **3D Hero Visualization** — Rotating wireframe icosahedron with orbital particle systems, bloom flares, and magnetic cursor interactions ([`public/js/collection-core.js`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/collection-core.js)).
- **Dimensional Radar Core** — Interactive 4D orbital radar that maps your game collection across five concentric dimensional rings with genre and platform clustering.
- **Dedicated Library View** — 16:9 widescreen card grid, genre-bundle Collections view, and live category filtering ([`public/library.html`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/library.html)).
- **Shared-Element Morph Transitions** — Cinematic card-to-modal expansion transitions for game detail inspection ([`public/js/shared-transition.js`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/shared-transition.js)).
- **Universal User Authentication** — Supabase Auth integration supporting signup, email OTP verification, sign-in by email or username, and password recovery ([`backend/routes/user_auth.py`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py)).
- **Personalized Gamer Profiles** — 8 preset custom vector gamer avatars (Cyber Neon, Pixel Knight, Retro Arcade, Arcane Wizard, Neon Mech, Shadow Ninja, Dragon Crest, Space Marine) ([`public/js/auth.js:24-73`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/auth.js#L24-L73)).
- **Personal Game Library** — Authenticated users sync personal play status, bookmarks, favorites, and 1–10 star ratings to PostgreSQL ([`backend/routes/user_library.py`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_library.py)).
- **Flexible Session Windows** — 30-day persistence when "Remember Me" is enabled; 3-hour auto-logout window on public or shared computers ([`public/js/auth.js:15-18`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/auth.js#L15-L18)).
- **PostgreSQL Rate Limiting** — Serverless-persistent brute-force protection tracking failed login attempts by IP and account ([`backend/auth.py:160-224`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L160-L224)).
- **Admin Management Panel** — Authenticated management modal to add, edit, and delete games directly from the UI ([`public/js/admin.js`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/admin.js)).
- **Zero-Latency Client Caching** — Instant home-page HUD paint powered by `localStorage` hydration combined with in-memory Python caching for catalog lookup tables.

---

## 🏗️ Project Structure

```
gameverse/
├── public/                       # Frontend (static files)
│   ├── index.html                # Home page (3D hero, radar, warp text, carousels)
│   ├── library.html              # Dedicated library catalog (grid, bundles, list)
│   ├── reset-password.html       # Supabase password reset page
│   ├── css/
│   │   ├── style.css             # Global styles, variables, modal overlay system
│   │   ├── home.css              # Hero section, warp text, HUD
│   │   ├── cards.css             # 16:9 widescreen cards & poster cards
│   │   ├── admin.css             # Admin modal & form controls
│   │   └── responsive.css        # Breakpoints for desktop, tablet, and mobile
│   ├── js/
│   │   ├── api.js                # Unified API client & visitor preference persistence
│   │   ├── auth.js               # Supabase Auth, session lifecycle, modal controller
│   │   ├── admin.js              # Admin game creation, editing, and form options
│   │   ├── home.js               # Homepage initialization & instant stats paint
│   │   ├── library.js            # Library filtering, sorting, and genre bundles
│   │   ├── search.js             # Spotlight search (Ctrl+K) & quick filters
│   │   ├── collection-core.js    # Three.js 3D scene & orbital dimensional radar
│   │   ├── shared-transition.js  # Card morphing transitions to detail view
│   │   ├── warp-text.js          # Kinetic warp text rendering engine
│   │   ├── particle-text.js      # Interactive particle typography canvas
│   │   ├── cosmic-eye.js         # Interactive background cursor visualizer
│   │   └── threads-background.js # Smooth background canvas lines
│   └── static/                   # Game covers, icons, and WebP media
│
├── backend/                      # FastAPI Python backend
│   ├── main.py                   # Entry point, lifespan, CORS, GZip, Server-Timing
│   ├── database.py               # psycopg3 ConnectionPool (min=1, max=3, SSL required)
│   ├── auth.py                   # Legacy admin auth, JWT minting, rate-limiting
│   ├── routes/
│   │   ├── games.py              # Full CRUD for games (GET, POST, PUT, PATCH, DELETE)
│   │   ├── user_auth.py          # User login, username check, password recovery
│   │   ├── user_library.py       # Personal game library & profile updates
│   │   ├── stats.py              # Aggregate collection statistics
│   │   ├── genres.py             # Genre lookup (1-hour in-memory cache)
│   │   ├── platforms.py          # Platform lookup (1-hour in-memory cache)
│   │   ├── developers.py         # Developer lookup (1-hour in-memory cache)
│   │   ├── publishers.py         # Publisher lookup (1-hour in-memory cache)
│   │   └── modes.py              # Game mode lookup (1-hour in-memory cache)
│   ├── .env.example              # Environment configuration template
│   └── requirements.txt          # Python dependencies
│
├── api/                          # Vercel serverless integration
│   └── index.py                  # ASGI serverless adapter with path restoration
│
├── docs/                         # Architecture documentation
│   ├── BACKEND.md                # Full API reference, caching specs, and security review
│   └── architecture/             # Interactive HTML architecture diagrams
│       ├── 01-architecture-overview.html
│       ├── 02-admin-auth-sequence.html
│       ├── 03-user-auth-sequence.html
│       ├── 04-homepage-dataflow.html
│       └── 05-token-lifecycle.html
│
├── vercel.json                   # Vercel deployment rewrites & security headers
├── requirements.txt              # Root dependency manifest for Vercel
├── start_gameverse.bat           # Windows one-click local server launcher
└── README.md
```

---

## 📐 Architecture Diagrams

Interactive, self-contained architecture diagrams are available in [`docs/architecture/`](docs/architecture/):

1. **[End-to-End System Architecture](docs/architecture/01-architecture-overview.html)** — End-to-end topology across browser, static CDN, Vercel ASGI bridge, FastAPI, psycopg3 connection pool, and Supabase cloud.
2. **[Admin Authentication & Privileged Action](docs/architecture/02-admin-auth-sequence.html)** — Sequence trace of bcrypt validation, 4-hour HS256 JWT creation, token verification, and game creation.
3. **[User Signup, OTP, Login & Recovery](docs/architecture/03-user-auth-sequence.html)** — Registration with live username availability, Supabase email OTP, identifier resolution (username or email), and recovery.
4. **[Home-Page Load & Multi-Tier Cache Dataflow](docs/architecture/04-homepage-dataflow.html)** — Cache hit vs. miss pathways across localStorage (0ms), Vercel edge (5ms), Python RAM (<1ms), and PostgreSQL (100ms).
5. **[Token Lifecycle & Lockout Engine](docs/architecture/05-token-lifecycle.html)** — Session states, 3-hour vs 30-day session windows, and database-persisted brute-force lockout rules.

> 📖 For the authoritative, comprehensive API reference, schema definitions, and security review, refer to [**`docs/BACKEND.md`**](docs/BACKEND.md).

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.12+**
- A **Supabase** project (or PostgreSQL 15+ database)
- **Node.js** is NOT required — the frontend is pure vanilla HTML/CSS/JS

### 1. Clone the repository
```bash
git clone https://github.com/aksh0411/test-2.git
cd test-2
```

### 2. Configure environment variables
Copy the sample configuration file:
```bash
cp backend/.env.example backend/.env
```

Configure `backend/.env` with your credentials:
```env
# Supabase PostgreSQL Transaction Mode Pooler (port 6543)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Supabase Auth Configuration
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=eyJhbGci...[ANON-PUBLIC-KEY]
SUPABASE_SECRET_KEY=sb_secret_...[SECRET-KEY]

# Legacy Admin Authentication Credentials
ADMIN_USERNAME=pick-a-name-that-is-not-admin
ADMIN_PASSWORD_HASH=$2b$12$...[GENERATED-BCRYPT-HASH]
JWT_SECRET=[GENERATED-RANDOM-HEX]
```

### 3. Install dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

### 4. Start the application

**Option A — Using the batch launcher (Windows):**
```bash
start_gameverse.bat
```

**Option B — Manual command:**
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 5. Access the application
Navigate to:
```
http://127.0.0.1:8000
```
- **Home Page**: `http://127.0.0.1:8000/index.html`
- **Library Catalog**: `http://127.0.0.1:8000/library.html`
- **Interactive API Docs** (Local development only): `http://127.0.0.1:8000/docs`

---

## 🔌 API Summary

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/games` | None | Paginated games catalog with filtering and search |
| `GET` | `/api/games/{id}` | None | Detailed game view with relations and system requirements |
| `POST` | `/api/games` | Admin | Create a new game with file upload or cover URL |
| `PUT` | `/api/games/{id}` | Admin | Update an existing game and relational associations |
| `PATCH` | `/api/games/{id}/status` | Admin | Quick status, bookmark, or favorite flag update |
| `DELETE` | `/api/games/{id}` | Admin | Delete a game and cascade its junction records |
| `GET` | `/api/stats` | None | Collection totals (total, playing, completed, favorited) |
| `GET` | `/api/genres` | None | List of genres (1-hour in-memory cache) |
| `GET` | `/api/platforms` | None | List of platforms (1-hour in-memory cache) |
| `GET` | `/api/developers` | None | List of developers (1-hour in-memory cache) |
| `POST` | `/api/developers` | Admin | Create a new developer entity |
| `GET` | `/api/publishers` | None | List of publishers (1-hour in-memory cache) |
| `POST` | `/api/publishers` | Admin | Create a new publisher entity |
| `GET` | `/api/modes` | None | List of game modes (1-hour in-memory cache) |
| `POST` | `/api/admin/login` | None | Admin authentication endpoint returning 4-hour HS256 JWT |
| `GET` | `/api/admin/verify` | User | Verify active session role and capabilities |
| `GET` | `/api/auth/config` | None | Public Supabase URL and anon key configuration |
| `GET` | `/api/auth/username-available`| None | Real-time username availability validation |
| `POST` | `/api/auth/login` | None | Authenticate via email OR username with rate limiting |
| `POST` | `/api/auth/forgot` | None | Password recovery proxy to Supabase GoTrue |
| `GET` | `/api/me/profile` | User | Fetch authenticated user's profile and avatar |
| `PATCH` | `/api/me/profile` | User | Update user's avatar selection |
| `GET` | `/api/me/games` | User | Retrieve personal game library with status & ratings |
| `PUT` | `/api/me/games/{id}` | User | Upsert personal status, favorite, bookmark, or rating |
| `DELETE` | `/api/me/games/{id}` | User | Remove game from personal library |
| `GET` | `/health` | None | Service health status check |

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Vanilla HTML5, CSS3, JavaScript (ES6 Modules) | Zero-build frontend runtime with glassmorphism styling |
| **3D & Graphics** | Three.js (WebGL), Canvas 2D | Dimensional Radar Core, 3D Hero, and Warp Text engines |
| **Backend Framework** | FastAPI (Python 3.12+), Uvicorn | Asynchronous REST API with automatic OpenAPI documentation |
| **Database Driver** | `psycopg` (v3) + `psycopg_pool` | High-performance pooled PostgreSQL client with dictionary rows |
| **Cloud Database** | Supabase (PostgreSQL 15+) | Managed cloud database accessed via transaction pooler (port 6543) |
| **User Authentication** | Supabase Auth (GoTrue) | Managed identity, email OTP confirmation, and password recovery |
| **Admin Authentication** | PyJWT (`HS256`) + `bcrypt` | Independent fallback admin access control |
| **Hosting & Deployment**| Vercel Serverless Functions | Serverless ASGI hosting with static edge asset delivery |

---

## 🌐 Deploy to Vercel

The project includes pre-configured Vercel integration:
1. Connect repository on [vercel.com](https://vercel.com).
2. Configure project Environment Variables:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SECRET_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH`
   - `JWT_SECRET`
3. Deploy — Vercel routes `/api/*` through [`api/index.py`](api/index.py) using [`vercel.json`](vercel.json) rewrites, while [`public/`](public/) is served directly from the Vercel Edge CDN.

---

<p align="center">
  <em>One Life, Many Worlds 🌌</em>
</p>
