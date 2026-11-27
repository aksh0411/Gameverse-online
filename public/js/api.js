const API_BASE = (() => {
    if (window.location.protocol.startsWith('http')) {
        return `${window.location.origin}/api`;
    }
    // Local development fallback (file:// protocol)
    return 'http://localhost:8000/api';
})();

// HTML-escape any string that came from the database before it goes into
// innerHTML (element text, attribute values). Prevents stored XSS.
function escHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}
window.escHtml = escHtml;

async function apiGet(endpoint) {
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, { headers });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
}

function getAuthToken() {
    const isRemembered = localStorage.getItem('gv_remember_me') === 'true';
    const maxDurationMs = isRemembered ? (30 * 24 * 3600 * 1000) : (3 * 3600 * 1000);

    // 1. Primary Token (sessionStorage first, then remembered localStorage, then Supabase SDK key)
    let userToken = sessionStorage.getItem('gv_access_token') || (isRemembered ? localStorage.getItem('gv_access_token') : null);
    if (!userToken) {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
                    const parsed = JSON.parse(localStorage.getItem(k));
                    if (parsed && parsed.access_token) {
                        userToken = parsed.access_token;
                        sessionStorage.setItem('gv_access_token', userToken);
                        break;
                    }
                }
            }
        } catch (e) {}
    }

    if (userToken) {
        const loginTime = parseInt(sessionStorage.getItem('gv_login_time') || (isRemembered ? localStorage.getItem('gv_login_time') : ''), 10);
        const expiry = parseInt(sessionStorage.getItem('gv_token_expiry') || (isRemembered ? localStorage.getItem('gv_token_expiry') : ''), 10);
        if ((loginTime && (Date.now() - loginTime) >= maxDurationMs) || (expiry && Date.now() >= expiry)) {
            if (typeof clearAuthSession === 'function') {
                clearAuthSession();
            } else {
                sessionStorage.removeItem('gv_access_token');
                sessionStorage.removeItem('gv_token_expiry');
                sessionStorage.removeItem('gv_login_time');
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_token_expiry');
                localStorage.removeItem('gv_access_token');
                localStorage.removeItem('gv_token_expiry');
                localStorage.removeItem('gv_login_time');
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_token_expiry');
            }
            return null;
        }
        return userToken;
    }

    // 2. Admin Token fallback
    const token = sessionStorage.getItem('admin_token') || (isRemembered ? localStorage.getItem('admin_token') : null);
    if (!token) return null;
    const expiry = parseInt(sessionStorage.getItem('admin_token_expiry') || (isRemembered ? localStorage.getItem('admin_token_expiry') : ''), 10);
    if (expiry && Date.now() >= expiry) {
        if (typeof clearAuthSession === 'function') {
            clearAuthSession();
        } else {
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_token_expiry');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_token_expiry');
        }
        if (typeof hideAdminControls === 'function') hideAdminControls();
        return null;
    }
    return token;
}

async function handleAuthError(res) {
    if (res.status === 401) {
        if (typeof clearAuthSession === 'function') {
            clearAuthSession();
        } else {
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_token_expiry');
            sessionStorage.removeItem('gv_access_token');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_token_expiry');
            localStorage.removeItem('gv_access_token');
        }
        if (typeof hideAdminControls === 'function') hideAdminControls();
        if (typeof updateNavbarUserState === 'function') updateNavbarUserState(null);
        if (typeof openLoginModal === 'function') {
            openLoginModal('Your session has expired. Please sign in again.', 'signin');
        } else {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.classList.remove('hidden');
        }
        throw new Error('Your session has expired or is not logged in. Please sign in again.');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API Error: ${res.status}`);
}

async function apiPost(endpoint, data, isFormData = false) {
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';
    
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data)
    });
    if (!res.ok) {
        await handleAuthError(res);
    }
    return res.json();
}

async function apiPut(endpoint, data, isFormData = false) {
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';
    
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers,
        body: isFormData ? data : JSON.stringify(data)
    });
    if (!res.ok) {
        await handleAuthError(res);
    }
    return res.json();
}

async function apiPatch(endpoint, data) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? {'Authorization': `Bearer ${token}`} : {})
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        await handleAuthError(res);
    }
    return res.json();
}

async function apiDelete(endpoint) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: token ? {'Authorization': `Bearer ${token}`} : {}
    });
    if (!res.ok) {
        await handleAuthError(res);
    }
    return res.json();
}

// Universal Image URL resolver for Live Server, FastAPI, and file protocols
// Prefers .webp when available (generated by batch optimization); .jpg is the fallback.
const _supportsWebP = (() => {
    try {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (e) { return false; }
})();

function getImageUrl(imgUrl) {
    if (!imgUrl || typeof imgUrl !== 'string') return '';
    const trimmed = imgUrl.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
        return trimmed;
    }
    
    // Normalize path by stripping leading slashes
    let cleanPath = trimmed.replace(/^\/+/, ''); // e.g. "static/images/game_1.png" or "far_cry_3.jpg"
    if (cleanPath.startsWith('frontend/')) {
        cleanPath = cleanPath.replace(/^frontend\//, '');
    }
    // Automatically route naked filenames into static/images/
    if (!cleanPath.startsWith('static/') && !cleanPath.startsWith('assets/')) {
        cleanPath = `static/images/${cleanPath}`;
    }

    // Prefer .webp for local .jpg images when the browser supports it
    if (_supportsWebP && /\.jpe?g$/i.test(cleanPath)) {
        cleanPath = cleanPath.replace(/\.jpe?g$/i, '.webp');
    }

    const relPath = cleanPath;

    // For any HTTP/HTTPS environment (Vercel, production, local server)
    if (window.location.protocol.startsWith('http')) {
        return `/${relPath}`;
    }

    // Relative to current html file (file:// protocol)
    return `./${relPath}`;
}

// =========================================================================
// USER & VISITOR PREFERENCE HELPERS
// Saves favorites, bookmarks, and status with immediate user-scoped local persistence
// backed by remote PostgreSQL user_games sync.
// =========================================================================
function getUserPrefKey() {
    const username = sessionStorage.getItem('gv_username') || localStorage.getItem('gv_username');
    return username ? `gv_user_prefs_${username.toLowerCase()}` : 'gv_visitor_preferences';
}

function getVisitorPreferences() {
    try {
        const key = getUserPrefKey();
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : { favorites: {}, bookmarks: {}, statuses: {} };
    } catch (e) {
        return { favorites: {}, bookmarks: {}, statuses: {} };
    }
}

function saveVisitorPreference(type, gameId, value) {
    try {
        const key = getUserPrefKey();
        const prefs = getVisitorPreferences();
        if (!prefs[type]) prefs[type] = {};
        const gidStr = String(gameId);
        if (value === null || value === undefined || value === false) {
            delete prefs[type][gidStr];
        } else {
            prefs[type][gidStr] = value;
        }
        localStorage.setItem(key, JSON.stringify(prefs));
    } catch (e) {
        console.warn('Could not save preference locally:', e);
    }

    // Persist to user's database library if logged in
    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
        const gid = parseInt(gameId, 10);
        if (!isNaN(gid)) {
            if (type === 'favorites') {
                apiPut(`/me/games/${gid}`, { is_favorite: Boolean(value) }).catch(err => {
                    console.warn('Personal library favorite sync:', err);
                });
            } else if (type === 'bookmarks') {
                apiPut(`/me/games/${gid}`, { is_bookmarked: Boolean(value) }).catch(err => {
                    console.warn('Personal library bookmark sync:', err);
                });
            } else if (type === 'statuses') {
                apiPut(`/me/games/${gid}`, { status: value || 'not_started' }).catch(err => {
                    console.warn('Personal library status sync:', err);
                });
            }
        }
    }
}

async function applyVisitorPreferences(games) {
    if (!Array.isArray(games) || games.length === 0) return;

    // Step 1: Immediately apply user's cached preferences (zero-latency, never vanishes)
    const localPrefs = getVisitorPreferences();
    games.forEach(g => {
        const gid = String(g.id || g.game_id);
        g.is_favorited = Boolean(localPrefs.favorites && localPrefs.favorites[gid]);
        g.favorited = g.is_favorited;
        g.is_bookmarked = Boolean(localPrefs.bookmarks && localPrefs.bookmarks[gid]);
        g.bookmarked = g.is_bookmarked;
        g.play_status = (localPrefs.statuses && localPrefs.statuses[gid]) || 'not_started';
    });

    // Step 2: If authenticated, fetch authoritative remote database library
    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
        try {
            const res = await apiGet('/me/games');
            const myGames = (res && Array.isArray(res.games)) ? res.games : [];
            const myMap = new Map();
            const freshPrefs = { favorites: {}, bookmarks: {}, statuses: {} };

            myGames.forEach(mg => {
                const mgid = String(mg.game_id || mg.id);
                myMap.set(mgid, mg);
                if (mg.is_favorite) freshPrefs.favorites[mgid] = true;
                if (mg.is_bookmarked) freshPrefs.bookmarks[mgid] = true;
                if (mg.status && mg.status !== 'not_started') freshPrefs.statuses[mgid] = mg.status;
            });

            // Update games array with authoritative DB values
            games.forEach(g => {
                const gid = String(g.id || g.game_id);
                if (myMap.has(gid)) {
                    const saved = myMap.get(gid);
                    g.is_favorited = Boolean(saved.is_favorite);
                    g.favorited = g.is_favorited;
                    g.is_bookmarked = Boolean(saved.is_bookmarked);
                    g.bookmarked = g.is_bookmarked;
                    if (saved.status) g.play_status = saved.status;
                } else {
                    // Not in DB — if local prefs had it from recent click before sync, preserve or merge
                    if (localPrefs.favorites && localPrefs.favorites[gid]) {
                        g.is_favorited = true;
                        g.favorited = true;
                        freshPrefs.favorites[gid] = true;
                    }
                    if (localPrefs.bookmarks && localPrefs.bookmarks[gid]) {
                        g.is_bookmarked = true;
                        g.bookmarked = true;
                        freshPrefs.bookmarks[gid] = true;
                    }
                }
            });

            // Update local cache with latest merged state
            try {
                localStorage.setItem(getUserPrefKey(), JSON.stringify(freshPrefs));
            } catch (e) {}

        } catch (e) {
            console.warn('Could not load user library from server (using cached preferences):', e);
        }
    }
}

window.getUserPrefKey = getUserPrefKey;
window.getVisitorPreferences = getVisitorPreferences;
window.saveVisitorPreference = saveVisitorPreference;
window.applyVisitorPreferences = applyVisitorPreferences;

