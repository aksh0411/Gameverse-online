# GAMEVERSE Backend Architecture, API Reference & Security Review

> **Document Status**: Authoritative Backend Specification  
> **Repository Root**: `tester/`  
> **Source Code Basis**: FastAPI (`backend/`), Supabase Auth & PostgreSQL, Vercel Serverless (`api/`)  
> **Diagrams**: Interactive HTML diagrams available in [`docs/architecture/`](./architecture/)

---

## Table of Contents
1. [System Architecture & Topology](#1-system-architecture--topology)
2. [API Reference Specification](#2-api-reference-specification)
3. [Administrator Authentication & Role-Based Access Control](#3-administrator-authentication--role-based-access-control)
4. [User Authentication & Gamer Profile Ecosystem](#4-user-authentication--gamer-profile-ecosystem)
5. [Caching, Memory & Connection Management](#5-caching-memory--connection-management)
6. [Database Schema, Constraints & Indexing](#6-database-schema-constraints--indexing)
7. [Configuration, Environments & Cold-Start Dynamics](#7-configuration-environments--cold-start-dynamics)
8. [Comprehensive Security Review](#8-comprehensive-security-review)
9. [Feature Implementation Status Matrix](#9-feature-implementation-status-matrix)

---

## 1. System Architecture & Topology

GAMEVERSE operates as a decoupled architecture consisting of a static, vanilla JavaScript/Three.js frontend served directly by Vercel or FastAPI static mounting, and an asynchronous Python FastAPI application interfaced with Supabase Cloud PostgreSQL.

```
+-----------------------------------------------------------------------------------+
| CLIENT BROWSER                                                                    |
|  - HTML5, CSS3 Glassmorphism, Vanilla ES6 Modules (public/)                       |
|  - Three.js 3D Orbital Engine (public/js/collection-core.js)                      |
|  - Client Caches: localStorage (gv_stats_cache, gv_user_prefs_*)                  |
|  - Token Storage: sessionStorage & localStorage (admin_token, gv_access_token)   |
+----------------------------------------+------------------------------------------+
                                         | HTTP / HTTPS Requests
                                         v
+-----------------------------------------------------------------------------------+
| VERCEL SERVERLESS / ASGI ADAPTER                                                  |
|  - Rewrite Rule: /api/(.*) -> /api/index.py?realpath=/api/$1 (vercel.json:14-23)  |
|  - Custom ASGI Middleware: _VercelPathRestoreMiddleware (api/index.py:17-54)      |
+----------------------------------------+------------------------------------------+
                                         | Restored Request Path
                                         v
+-----------------------------------------------------------------------------------+
| FASTAPI BACKEND RUNTIME (backend/main.py)                                         |
|  - CORS Middleware: allow_origin_regex=r".*" with allow_credentials=True (:121)   |
|  - GZip Compression Middleware: minimum_size=1000 bytes (:130)                    |
|  - Server-Timing Telemetry Middleware: duration & pool statistics (:133-165)      |
|  - Cache-Control Middleware: production static cache vs dev no-cache (:167-184)   |
|  - In-Process Memory Cache: 3600s TTL dictionary for lookup tables (routes/*.py)   |
+-------------------+------------------------------------+--------------------------+
                    |                                    |
                    v (TLS Port 6543)                    v (HTTPS REST API)
+--------------------------------------+  +-----------------------------------------+
| SUPABASE POSTGRES POOLER             |  | SUPABASE GOTRUE AUTH SERVICE            |
|  - Transaction Mode (port 6543)      |  |  - POST /auth/v1/token (user_auth.py:149|
|  - psycopg3 ConnectionPool (1 to 3)  |  |  - POST /auth/v1/recover (line 277)     |
|  - Tables: games, profiles,          |  |  - JWKS Public Keys: ES256 / RS256      |
|    user_games, login_attempts        |  |  - User Identity Storage (auth.users)   |
+--------------------------------------+  +-----------------------------------------+
```

### Architectural Diagrams
Self-contained, interactive HTML architecture diagrams are maintained in [`docs/architecture/`](./architecture/):
- **Overview**: [`01-architecture-overview.html`](./architecture/01-architecture-overview.html) — End-to-end component topology.
- **Admin Auth Sequence**: [`02-admin-auth-sequence.html`](./architecture/02-admin-auth-sequence.html) — Password verification, HS256 minting, and game creation.
- **User Auth Sequence**: [`03-user-auth-sequence.html`](./architecture/03-user-auth-sequence.html) — Signup, OTP email, username-to-email resolution, and password recovery.
- **Dataflow**: [`04-homepage-dataflow.html`](./architecture/04-homepage-dataflow.html) — Cache hit/miss paths for home-page loads.
- **Session Lifecycle**: [`05-token-lifecycle.html`](./architecture/05-token-lifecycle.html) — Login lockout, rate-limit thresholds, and dual session windows.

---

## 2. API Reference Specification

All endpoints are prefixed with `/api` when hosted behind the Vercel gateway or local development proxy. Authentication requirements are strictly enforced via FastAPI dependencies:
- **`None`**: Publicly accessible.
- **`User`**: Requires valid Supabase JWT or Legacy Admin Token via `Depends(get_current_user)` ([`backend/auth.py:374`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L374)).
- **`Admin`**: Requires admin privileges via `Depends(get_current_admin)` ([`backend/auth.py:508`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L508)).

| Method | Path | Auth | Request Shape | Response Shape | Handler Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health`, `/api/health` | None | None | `{"message": str, "docs": str}` | [`backend/main.py:114-120`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/main.py#L114-L120) |
| `GET` | `/api/games` | None | Query: `search`, `genre`, `platform`, `status`, `bookmarked`, `favorited`, `page` (default 1), `limit` (1-500, default 100) | `{"total": int, "page": int, "limit": int, "games": list[dict]}` | [`backend/routes/games.py:73-213`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/games.py#L73-L213) |
| `GET` | `/api/games/{game_id}` | None | Path: `game_id: int` | Dict containing full game record, joined developer, publisher, genres, platforms, modes, story types, and system requirements | [`backend/routes/games.py:214-296`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/games.py#L214-L296) |
| `POST` | `/api/games` | Admin | Multipart Form: `game_name` (req), `description`, `developer_id`, `publisher_id`, `release_date`, `rating`, `price`, `is_free_to_play`, `play_status`, `is_bookmarked`, `is_favorited`, `game_engine`, `genre_ids` (JSON str), `platform_ids` (JSON str), `mode_ids` (JSON str), `story_type_ids` (JSON str), `sys_req` (JSON str), `cover_image` (File), `cover_image_url` (str) | `{"message": "Game created successfully", "game_id": int}` | [`backend/routes/games.py:297-393`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/games.py#L297-L393) |
| `PUT` | `/api/games/{game_id}` | Admin | Path: `game_id: int`, Multipart Form: same fields as `POST /api/games` | `{"message": "Game updated successfully"}` | [`backend/routes/games.py:394-503`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/games.py#L394-L503) |
| `PATCH` | `/api/games/{game_id}/status` | Admin | Path: `game_id: int`, JSON: `{"play_status": str?, "is_bookmarked": bool?, "is_favorited": bool?}` | `{"message": "Status updated successfully"}` | [`backend/routes/games.py:510-537`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/games.py#L510-L537) |
| `DELETE` | `/api/games/{game_id}` | Admin | Path: `game_id: int` | `{"message": "Game deleted successfully"}` | [`backend/routes/games.py:538-564`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/games.py#L538-L564) |
| `GET` | `/api/stats` | None | None | `{"total_games": int, "playing": int, "completed": int, "bookmarked": int, "favorited": int}` | [`backend/routes/stats.py:8-49`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/stats.py#L8-L49) |
| `GET` | `/api/genres` | None | None | `list[{"genre_id": int, "genre_name": str, "id": int, "name": str}]` | [`backend/routes/genres.py:13-32`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/genres.py#L13-L32) |
| `GET` | `/api/platforms` | None | None | `list[{"platform_id": int, "platform_name": str, "id": int, "name": str}]` | [`backend/routes/platforms.py:13-32`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/platforms.py#L13-L32) |
| `GET` | `/api/developers` | None | None | `list[{"developer_id": int, "developer_name": str, "country": str?, "founded_year": int?, "id": int, "name": str}]` | [`backend/routes/developers.py:21-41`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/developers.py#L21-L41) |
| `POST` | `/api/developers` | Admin | JSON: `{"developer_name": str, "country": str?, "founded_year": int?}` | `{"developer_id": int, "id": int, "message": str}` | [`backend/routes/developers.py:42-54`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/developers.py#L42-L54) |
| `GET` | `/api/publishers` | None | None | `list[{"publisher_id": int, "publisher_name": str, "country": str?, "id": int, "name": str}]` | [`backend/routes/publishers.py:20-40`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/publishers.py#L20-L40) |
| `POST` | `/api/publishers` | Admin | JSON: `{"publisher_name": str, "country": str?}` | `{"publisher_id": int, "id": int, "message": str}` | [`backend/routes/publishers.py:41-53`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/publishers.py#L41-L53) |
| `GET` | `/api/modes` | None | None | `list[{"mode_id": int, "mode_name": str, "id": int, "name": str}]` | [`backend/routes/modes.py:13-32`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/modes.py#L13-L32) |
| `POST` | `/api/admin/login` | None | Form-URL-Encoded: `username: str`, `password: str` (`OAuth2PasswordRequestForm`) | `{"access_token": str, "token_type": "bearer"}` | [`backend/auth.py:578-619`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L578-L619) |
| `GET` | `/api/admin/verify` | User | Header: `Authorization: Bearer <token>` | `{"authenticated": true, "is_admin": bool, "username": str, "role": str, "avatar_url": str?}` | [`backend/auth.py:622-641`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L622-L641) |
| `GET` | `/api/auth/config` | None | None | `{"supabase_url": str, "supabase_anon_key": str}` | [`backend/routes/user_auth.py:43-50`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L43-L50) |
| `GET` | `/api/auth/username-available` | None | Query: `u: str` | `{"available": bool, "reason": str?}` | [`backend/routes/user_auth.py:52-90`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L52-L90) |
| `POST` | `/api/auth/login` | None | JSON: `{"identifier": str, "password": str}` | `{"access_token": str, "refresh_token": str, "token_type": "bearer", "expires_in": int, "user": dict}` | [`backend/routes/user_auth.py:92-224`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L92-L224) |
| `POST` | `/api/auth/forgot` | None | JSON: `{"identifier": str}` | `{"message": str}` (uniform anti-enumeration response) | [`backend/routes/user_auth.py:225-287`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L225-L287) |
| `GET` | `/api/me/profile` | User | Header: `Authorization: Bearer <token>` | `{"id": str, "username": str, "email": str?, "role": str, "avatar_url": str?, "created_at": str?}` | [`backend/routes/user_library.py:31-57`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_library.py#L31-L57) |
| `PATCH` | `/api/me/profile` | User | JSON: `{"avatar_url": str?}` | `{"status": "ok", "avatar_url": str?}` | [`backend/routes/user_library.py:59-91`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_library.py#L59-L91) |
| `GET` | `/api/me/games` | User | Query: `status?`, `favorite: bool?`, `bookmarked: bool?` | `{"games": list[dict], "count": int}` | [`backend/routes/user_library.py:93-154`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_library.py#L93-L154) |
| `PUT` | `/api/me/games/{game_id}` | User | Path: `game_id: int`, JSON: `{"is_favorite": bool?, "is_bookmarked": bool?, "status": str?, "rating": int?}` | `{"success": true, "entry": dict}` | [`backend/routes/user_library.py:156-225`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_library.py#L156-L225) |
| `DELETE` | `/api/me/games/{game_id}` | User | Path: `game_id: int` | `{"success": true, "game_id": int}` | [`backend/routes/user_library.py:226-246`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_library.py#L226-L246) |

---

## 3. Administrator Authentication & Role-Based Access Control

### 3.1 Credential Verification & Hash Storage
Admin authentication operates via a dedicated fallback flow configured in [`backend/auth.py:578-619`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L578-L619):
- **Username**: Configured via the `ADMIN_USERNAME` environment variable ([`auth.py:70`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L70)).
- **Password Hash**: Stored as a standard bcrypt string in the `ADMIN_PASSWORD_HASH` environment variable ([`auth.py:72`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L72)). Verification is executed using `bcrypt.checkpw(plain.encode('utf-8'), hash.encode('utf-8'))` ([`auth.py:540-549`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L540-L549)).

### 3.2 JWT Contents, Signing & Expiration
- **Algorithm**: Symmetric `HS256` signed with `JWT_SECRET` (`LEGACY_SECRET_KEY`) ([`auth.py:68, 572`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L68)).
- **Payload**:
  ```json
  {
    "sub": "<ADMIN_USERNAME>",
    "exp": "<now_utc + 4 hours>"
  }
  ```
- **Expiration Window**: 4 hours (`timedelta(minutes=4 * 60)`) ([`auth.py:568`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L568)).

### 3.3 Route Protection Pipeline
Mutating endpoints depend on `get_current_admin` ([`auth.py:508-527`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L508-L527)):
1. `get_current_user` extracts the HTTP Bearer token from the `Authorization` header ([`auth.py:384-399`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L384-L399)).
2. Token decoding evaluates:
   - First, asymmetric Supabase JWKS / REST validation ([`auth.py:404`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L404)). If user has `role == "admin"` in `public.profiles`, admin privilege is granted.
   - Second, legacy admin token fallback via `decode_legacy_token` ([`auth.py:472`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L472)). Verifies payload `sub == ADMIN_USERNAME`.
3. If neither evaluates to `is_admin == True`, an HTTP 403 Forbidden exception is raised ([`auth.py:518-524`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L518-L524)).

### 3.4 Frontend Token Persistence
The browser client manages the legacy admin token in `sessionStorage` (with `localStorage` fallback):
- Key: `'admin_token'` ([`public/js/auth.js:3`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/auth.js#L3)).
- Expiry key: `'admin_token_expiry'` ([`public/js/auth.js:4`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/auth.js#L4)).
- Evaluated on every API request in `getAuthToken()` ([`public/js/api.js:62-73`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/api.js#L62-L73)).

---

## 4. User Authentication & Gamer Profile Ecosystem

### 4.1 Signup & Username Rules
- **Username Constraint**: Regex `^[A-Za-z]{4,20}$` (4 to 20 letters only, no numbers or symbols) ([`backend/routes/user_auth.py:31`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L31)).
- **Reserved Names**: `admin`, `administrator`, `gameverse`, `support`, `moderator`, `mod`, `root`, `staff`, `system`, `owner` ([`user_auth.py:26-29`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L26-L29)).
- **Client Flow**: Frontend calls Supabase Auth SDK `supabase.auth.signUp()` with metadata `{ username, avatar_url }` ([`public/js/auth.js:806-814`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/auth.js#L806-L814)).

### 4.2 Login by Email or Username
1. Client POSTs to `/api/auth/login` with `identifier` and `password` ([`user_auth.py:92`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L92)).
2. Rate-limiting check runs against `public.login_attempts` ([`user_auth.py:108`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L108)).
3. If `identifier` lacks an `@` symbol, it is resolved via SQL:
   ```sql
   SELECT u.email FROM auth.users u JOIN public.profiles p ON p.id = u.id WHERE lower(p.username) = lower(%s)
   ```
4. FastAPI proxies the authentication request to Supabase GoTrue (`${SUPABASE_URL}/auth/v1/token?grant_type=password`) forwarding the client IP using the `Sb-Forwarded-For` header ([`user_auth.py:145-157`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L145-L157)).
5. Returns access token, refresh token, and gamer profile data ([`user_auth.py:186-198`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L186-L198)).

### 4.3 Email OTP & Verification
- When email confirmation is enabled, Supabase transmits a 6-digit OTP code to the user.
- Handled client-side via `supabaseClient.auth.verifyOtp({ email, token, type: 'signup' })` ([`public/js/auth.js:871`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/auth.js#L871)).
- If unconfirmed at login, `/api/auth/login` returns an explicit payload indicating `email_confirmed: false` to transition the modal directly into OTP entry mode ([`user_auth.py:211-218`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L211-L218)).

### 4.4 Password Recovery
- Initiated via `POST /api/auth/forgot` ([`user_auth.py:225`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L225)).
- Resolves identifier to email, then calls `${SUPABASE_URL}/auth/v1/recover` specifying `redirect_to: <origin>/reset-password.html` ([`user_auth.py:265-281`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L265-L281)).
- Always responds with a uniform success message to eliminate account enumeration vectors ([`user_auth.py:285-287`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L285-L287)).

### 4.5 User Data Tables & Trigger Status
- **`public.profiles`**: Stores gamer profile data (`id` UUID PK matching `auth.users`, `username`, `role`, `avatar_url`, `created_at`). *(Referenced in code: [`user_library.py:39, 73`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_library.py#L39); DDL lives in Supabase Cloud)*.
- **`public.user_games`**: Stores personal collections (`user_id` UUID, `game_id` int, `is_favorite` bool, `is_bookmarked` bool, `status` text, `rating` int, `updated_at` timestamptz) with unique constraint `(user_id, game_id)` ([`user_library.py:186-210`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_library.py#L186-L210)).
- **`public.login_attempts`**: Tracks failed attempts for rate limiting (`id` bigserial PK, `ip` text, `identifier` text, `attempted_at` timestamptz). Auto-created on startup ([`backend/auth.py:132-154`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L132-L154)).
- **Signup Trigger (`on_auth_user_created`)**: **PARTIAL / UNVERIFIED IN REPO**. Code relies on a Supabase trigger to populate `public.profiles` upon `auth.users` insertion, but no migration file is present in the repository.

---

## 5. Caching, Memory & Connection Management

```
CACHE LAYER               STORAGE MEDIUM            TTL / INVALIDATION                   HANDLER / LOCATION
------------------------------------------------------------------------------------------------------------------
1. Client Storage         Browser localStorage      Stats: Instant read, bg refresh     home.js:16 (gv_stats_cache)
                          & sessionStorage          Prefs: Immediate local write         api.js:201 (gv_user_prefs_*)
                                                    Tokens: 3h default / 30d remember    auth.js:16 (AUTO_LOGOUT_MS)

2. HTTP Response Headers  Browser / Vercel Edge     /stats: max-age=60, s-maxage=300     stats.py:24, 45
                                                    Lookups: max-age=3600, s-maxage=86400 genres.py:20, platforms.py:20
                                                    Static: max-age=86400, SWR=604800    main.py:173
                                                    HTML: no-cache                       main.py:177

3. In-Process Python RAM  FastAPI Process Memory    TTL = 3600 seconds                   genres.py:11, platforms.py:11
                          (Global Variables)        Invalidated on Admin POST:           developers.py:51 (_cache = None)
                                                    _cache = None                        publishers.py:50 (_cache = None)

4. Connection Pool        psycopg_pool              min_size=1, max_size=3               database.py:35-41
                          ConnectionPool            max_idle=30.0s, max_lifetime=180.0s  
                                                    autocommit=True                      database.py:60

5. Supabase Pooler        PgBouncer (Cloud)         Port 6543 (Transaction Mode)         .env.example:4
```

### Stale-Data Risks & Mitigation
1. **Serverless In-Process Cache Fragmentation**: On Vercel, serverless lambdas run in isolated containers. An admin POST invalidating `_cache` in one instance will not invalidate it in concurrent running instances until their 3600s TTL expires or the instance recycles.
2. **Edge Cache Delay on Stats**: `/stats` returns `s-maxage=300` (5 minutes). When an admin adds a game, edge CDN caches may continue serving the prior count for up to 5 minutes unless purged.
3. **Local Preference Desynchronization**: `applyVisitorPreferences()` executes optimistic local UI writes, then asynchronously synchronizes with `/api/me/games`. Network partitions may temporarily leave local preferences ahead of the database.

---

## 6. Database Schema, Constraints & Indexing

*(Inferred from repository SQL queries; no `.sql` migration files are checked into git)*

### 6.1 Core Relational Tables
```
[games] (PK: game_id SERIAL)
  - developer_id (FK -> developers.developer_id)
  - publisher_id (FK -> publishers.publisher_id)
  - game_name, description, detailed_description, release_date
  - rating (numeric), price (numeric), is_free_to_play (bool)
  - play_status (varchar), is_bookmarked (bool), is_favorited (bool)
  - game_engine (varchar), cover_image (varchar / text)
    |
    +--< [gamegenres] >-------- [genres] (PK: genre_id SERIAL)
    +--< [gameplatforms] >----- [platforms] (PK: platform_id SERIAL)
    +--< [gamemodesrelation] >- [gamemodes] (PK: mode_id SERIAL)
    +--< [gamestory] >--------- [storytypes] (PK: story_id SERIAL)
    +--< [systemrequirements] (PK: requirement_id SERIAL)
    +--< [user_games] (Compound Unique: user_id, game_id)
```

### 6.2 B-Tree Indexes Verified on Lifespan Startup
The FastAPI application verifies the following indexes on startup ([`backend/main.py:68-80`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/main.py#L68-L80)):
- `idx_games_play_status` ON `games(play_status)`
- `idx_games_is_favorited` ON `games(is_favorited)`
- `idx_games_is_bookmarked` ON `games(is_bookmarked)`
- `idx_gamegenres_game_id` ON `gamegenres(game_id)`
- `idx_gamegenres_genre_id` ON `gamegenres(genre_id)`
- `idx_gameplatforms_game_id` ON `gameplatforms(game_id)`
- `idx_gameplatforms_platform_id` ON `gameplatforms(platform_id)`
- `idx_gamemodes_game_id` ON `gamemodesrelation(game_id)`
- `idx_gamestory_game_id` ON `gamestory(game_id)`
- `idx_systemreqs_game_id` ON `systemrequirements(game_id)`
- `idx_user_games_game` ON `user_games(game_id)`
- `idx_login_attempts_ip_time` ON `public.login_attempts(ip, attempted_at)` ([`auth.py:150`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L150))
- `idx_login_attempts_ident_time` ON `public.login_attempts(identifier, attempted_at)` ([`auth.py:152`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L152))

---

## 7. Configuration, Environments & Cold-Start Dynamics

### 7.1 Environment Variables
All variables are declared in [`backend/.env.example`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/.env.example):

| Variable Name | Required | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection URI pointing to Supabase Port 6543 Transaction Pooler. Must include credentials and target DB. |
| `SUPABASE_URL` | Yes | Public Supabase API root (`https://[REF].supabase.co`). Auto-derived from `DATABASE_URL` if omitted ([`auth.py:52-56`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L52-L56)). |
| `SUPABASE_ANON_KEY` | Yes | Client-safe public key used by frontend SDK and backend token verification. |
| `SUPABASE_SECRET_KEY` | Optional | Service role / secret key used for `Sb-Forwarded-For` proxying to GoTrue. |
| `ADMIN_USERNAME` | Yes (for admin) | Username for legacy admin authentication. |
| `ADMIN_PASSWORD_HASH`| Yes (for admin) | Bcrypt hash string for legacy admin authentication. |
| `JWT_SECRET` | Yes (for admin) | Secret key for signing legacy 4-hour admin HS256 JWTs. |
| `SUPABASE_JWT_SECRET` | Optional | Fallback secret for validating symmetric Supabase JWTs. |

### 7.2 Local vs. Vercel Production Divergence
- **Routing**: Locally, Uvicorn serves routes directly at `http://127.0.0.1:8000`. On Vercel, requests to `/api/*` undergo serverless rewrites to `/api/index.py?realpath=...` ([`vercel.json:14`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/vercel.json#L14)), which are unwrapped by `_VercelPathRestoreMiddleware` ([`api/index.py:17`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/api/index.py#L17)).
- **Documentation**: Swagger UI (`/docs`), ReDoc (`/redoc`), and OpenAPI specification (`/openapi.json`) are active in local development but completely disabled in production (`_is_prod = bool(os.getenv("VERCEL"))`) ([`backend/main.py:104-112`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/main.py#L104-L112)).
- **Telemetry**: `Server-Timing` headers and pool statistics are emitted only in non-production environments to avoid internal infrastructure leaks ([`main.py:141`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/main.py#L141)).

### 7.3 Serverless Cold-Start Effects
- **Connection Pool Overhead**: On a cold start, `psycopg_pool.ConnectionPool` initializes with `min_size=1`. The first request incurs TLS negotiation overhead with the Supabase pooler (typically 150–350ms).
- **Sequence Synchronization**: Startup hook sequence synchronization (`setval(pg_get_serial_sequence...)`) runs inside the lifespan context ([`backend/main.py:41-65`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/main.py#L41-L65)).

---

## 8. Comprehensive Security Review

| ID | Vulnerability / Check Area | Severity | Finding & Code Reference | Remediation / Suggested Fix |
| :--- | :--- | :---: | :--- | :--- |
| **SEC-01** | **CORS Origin Whitelist** | **HIGH** | [`backend/main.py:124`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/main.py#L124): `allow_origin_regex=r".*"` combined with `allow_credentials=True`. Allows any malicious web origin to execute authenticated cross-site credentialed requests. | Replace wildcard regex with an explicit whitelist of trusted production domains and localhost: `allow_origins=["https://gameverse.vercel.app", "http://127.0.0.1:8000"]`. |
| **SEC-02** | **XSS Token Exposure** | **MEDIUM** | [`public/js/api.js:30, 62`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/api.js#L30): JWTs (`admin_token`, `gv_access_token`) are read from and stored in `localStorage` and `sessionStorage`. Any cross-site script can extract tokens. | Transition authentication tokens to `HttpOnly`, `Secure`, `SameSite=Strict` cookies. |
| **SEC-03** | **Internal Database Error Exposure** | **MEDIUM** | [`backend/routes/games.py:212, 295, 392, 502, 536, 564`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/games.py#L212): Endpoints catch `psycopg.Error` and return `HTTPException(status_code=500, detail=str(e))`. Leaks table names, query syntax, and constraints. | Log the internal error server-side and return a generic client response: `HTTPException(status_code=500, detail="Internal server error")`. |
| **SEC-04** | **Content-Security-Policy (CSP) Header** | **MEDIUM** | [`vercel.json:3-12`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/vercel.json#L3-L12): Includes `X-Frame-Options` and `X-Content-Type-Options`, but completely omits `Content-Security-Policy`. | Add a strict `Content-Security-Policy` header allowing scripts only from `'self'` and trusted CDNs (Three.js, Supabase). |
| **SEC-05** | **Input Length Validation on Form Fields** | **MEDIUM** | [`backend/routes/games.py:298-320`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/games.py#L298-L320): `create_game` and `update_game` use unconstrained `Form(...)` parameters for `game_name`, `description`, etc. Potential denial-of-service via massive payloads. | Adopt Pydantic schemas or add `Form(..., max_length=255)` constraints to string fields. |
| **SEC-06** | **SQL Injection Analysis** | **LOW / PASS** | All database queries across all route files ([`games.py:163`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/games.py#L163), [`stats.py:11`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/stats.py#L11), [`user_auth.py:73, 122`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L73)) utilize parameterized `%s` placeholders. Main startup sequence sync ([`main.py:56`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/main.py#L56)) uses f-strings but interpolates only hardcoded internal constants. | For defense-in-depth on [`main.py:56`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/main.py#L56), wrap table and column identifiers in `psycopg.sql.Identifier`. |
| **SEC-07** | **Password Hashing Implementation** | **PASS** | [`backend/auth.py:540-559`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L540-L559): Uses standard `bcrypt.checkpw()` and `bcrypt.hashpw(..., bcrypt.gensalt())`. Secure standard algorithm. | Ensure salt work factor is >= 12 rounds. |
| **SEC-08** | **Brute-Force & Rate Limiting** | **PASS** | [`backend/auth.py:160-224`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L160-L224): Enforces PostgreSQL-backed limits: max 10 failed attempts per IP, max 5 failed attempts per account within 15 minutes. Survives serverless recycling. | Retain current implementation; move 24h prune to a scheduled task rather than inline DELETE on each request. |
| **SEC-09** | **User Enumeration Protections** | **LOW** | [`backend/routes/user_auth.py:222, 285`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L222): Login returns uniform `"Invalid credentials"`. Forgot password returns uniform message. However, `/api/auth/username-available` ([`user_auth.py:52`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L52)) explicitly discloses username existence. | Rate-limit `/api/auth/username-available` to prevent bulk automated username scraping. |
| **SEC-10** | **Admin Endpoint Access Control Coverage** | **PASS** | All state-mutating game and metadata routes (`POST /api/games`, `PUT /api/games/{id}`, `PATCH /api/games/{id}/status`, `DELETE /api/games/{id}`, `POST /api/developers`, `POST /api/publishers`) require `Depends(get_current_admin)`. | No unprotected administrative write endpoints detected in the codebase. |
| **SEC-11** | **Redundant Cryptographic Dependencies** | **LOW** | [`backend/requirements.txt:6, 10`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/requirements.txt#L6): Lists both `python-jose[cryptography]` and `pyjwt[crypto]`. Only PyJWT is actively imported in [`backend/auth.py:19`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L19). | Remove `python-jose` from `requirements.txt` to minimize supply-chain surface area. |
| **SEC-12** | **File Upload Path Traversal Sanitization** | **LOW** | [`backend/routes/games.py:33-35`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/games.py#L33-L35): File name derived via `game_name.replace(' ', '_').lower()`. While `game_name` is cleaned, arbitrary symbols like `../` could theoretically cause traversal if not caught. | Generate random UUIDs for uploaded cover image filenames: `f"{uuid.uuid4()}{file_ext}"`. |

---

## 9. Feature Implementation Status Matrix

| Component / Flow | Implementation Status | Technical Reality & Evidence |
| :--- | :---: | :--- |
| **PostgreSQL Connection Pooling** | **IMPLEMENTED** | `psycopg_pool.ConnectionPool` (min=1, max=3, SSL required) configured in [`backend/database.py:33-41`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/database.py#L33-L41). |
| **Admin Login & HS256 Token** | **IMPLEMENTED** | `POST /api/admin/login` verifying against `ADMIN_PASSWORD_HASH` and issuing 4h JWT in [`backend/auth.py:578`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L578). |
| **PostgreSQL Rate Limiting** | **IMPLEMENTED** | `public.login_attempts` table created and queried in [`backend/auth.py:132-224`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L132-L224). |
| **User Sign-in (Email or Username)** | **IMPLEMENTED** | `POST /api/auth/login` with username-to-email SQL resolution and GoTrue proxying in [`backend/routes/user_auth.py:92-224`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L92-L224). |
| **User Signup & Live Validation** | **IMPLEMENTED** | Live username availability endpoint in [`user_auth.py:52`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L52); Supabase client signup wired in [`public/js/auth.js:806`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/auth.js#L806). |
| **Email OTP Verification** | **IMPLEMENTED** | Client-side OTP verification with error forwarding in [`public/js/auth.js:871`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/auth.js#L871) and [`user_auth.py:211`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L211). |
| **Password Reset Flow** | **IMPLEMENTED** | Backend `/api/auth/forgot` proxying to GoTrue recover in [`user_auth.py:225`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_auth.py#L225) + dedicated reset page [`public/reset-password.html`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/reset-password.html). |
| **User Game Library Sync** | **IMPLEMENTED** | Full CRUD on `public.user_games` via `/api/me/games` in [`backend/routes/user_library.py:93-246`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_library.py#L93-L246). |
| **8 Preset Gamer Avatars** | **IMPLEMENTED** | SVG vector definitions and picker modal in [`public/js/auth.js:24-73`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/auth.js#L24-L73) persisted to `profiles.avatar_url` via `PATCH /api/me/profile` ([`user_library.py:59`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/routes/user_library.py#L59)). |
| **Remember Me (30d vs 3h)** | **IMPLEMENTED** | Dual session expiration windows enforced in [`public/js/auth.js:15-18`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/auth.js#L15-L18) and [`public/js/api.js:48-58`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/public/js/api.js#L48-L58). |
| **Database Signup Trigger** | **PARTIAL** | Code assumes `public.profiles` row auto-creates on signup, but trigger DDL is not in the repository files (configured directly in Supabase Cloud). |
| **Scheduled Rate-Limit Pruning**| **PLANNED** | Deletion of old attempt records currently runs inline on login attempts ([`auth.py:168`](file:///c:/Users/aksh7/OneDrive/Desktop/tester/backend/auth.py#L168)); standalone cron is unbuilt. |
| **Custom SMTP Email Templates** | **PLANNED** | Application relies on standard default Supabase GoTrue email templates. |
