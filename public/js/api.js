const API_BASE = (() => {
    if (window.location.protocol.startsWith('http')) {
        // If served by FastAPI (port 8000 or production cloud domain like render/railway)
        if (window.location.port === '8000' || (!['localhost', '127.0.0.1'].includes(window.location.hostname))) {
            return `${window.location.origin}/api`;
        }
    }
    // Local development fallback (e.g. Live Server on port 5500 or file://)
    return 'http://localhost:8000/api';
})();

async function apiGet(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
}

async function handleAuthError(res) {
    if (res.status === 401) {
        localStorage.removeItem('admin_token');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.classList.remove('hidden');
        throw new Error('Your admin session has expired or is not logged in. Please log in as Admin.');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API Error: ${res.status}`);
}

async function apiPost(endpoint, data, isFormData = false) {
    const token = localStorage.getItem('admin_token');
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
    const token = localStorage.getItem('admin_token');
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
    const token = localStorage.getItem('admin_token');
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
    const token = localStorage.getItem('admin_token');
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
    const relPath = cleanPath;

    // Production deployment (Railway, Render, etc.) — not localhost
    if (window.location.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        return `/${relPath}`;
    }

    // If served from backend port 8000
    if (window.location.protocol.startsWith('http') && window.location.port === '8000') {
        return `/${relPath}`;
    }

    // If page is loaded under /frontend/ path (e.g. Live Server running on project root)
    if (window.location.pathname.includes('/frontend/')) {
        return `${window.location.origin}/frontend/${relPath}`;
    }

    // Relative to current html file (index.html / game.html)
    return `./${relPath}`;
}

