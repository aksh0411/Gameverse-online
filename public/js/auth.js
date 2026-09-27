// ===== GAMEVERSE Auth — Tab-Scoped sessionStorage + 4-Hour Ceiling =====

const SESSION_TOKEN_KEY = 'admin_token';
const SESSION_EXPIRY_KEY = 'admin_token_expiry';
const SESSION_LIFETIME_MS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

// --- Core auth state check ---
function isAdmin() {
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) return false;
    const expiry = parseInt(sessionStorage.getItem(SESSION_EXPIRY_KEY), 10);
    if (!expiry || Date.now() > expiry) {
        // Token expired — purge silently
        clearAdminSession();
        return false;
    }
    return true;
}

function clearAdminSession() {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    // Also purge any legacy localStorage tokens from older sessions
    localStorage.removeItem(SESSION_TOKEN_KEY);
}

// --- Login modal ---
function openLoginModal(message) {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
        const loginError = document.getElementById('loginError');
        if (loginError) {
            if (message) {
                loginError.textContent = message;
                loginError.classList.remove('hidden');
                loginError.style.color = '#00f5d4';
            } else {
                loginError.classList.add('hidden');
            }
        }
        const userInp = loginModal.querySelector('input[name="username"]');
        if (userInp) userInp.focus();
    } else {
        alert(message || 'Admin login required to perform this action.');
    }
}
window.openLoginModal = openLoginModal;

function requireAdmin(actionDescription = 'modify collection data') {
    if (!isAdmin()) {
        openLoginModal();
        return false;
    }
    return true;
}
window.requireAdmin = requireAdmin;

// --- Admin UI visibility ---
function showAdminControls() {
    document.querySelectorAll('.admin-login-btn, #adminLoginBtn').forEach(b => b.classList.add('hidden'));
    document.querySelectorAll('.admin-logout-btn, #adminLogoutBtn').forEach(b => b.classList.remove('hidden'));
    const addGameFab = document.getElementById('addGameFab');
    const adminMenu = document.getElementById('adminMenu');

    if (addGameFab) addGameFab.classList.remove('hidden');
    if (adminMenu) adminMenu.classList.remove('hidden');

    // Reveal admin-only menus (modal & standalone 3-dot menus)
    document.querySelectorAll('.more-menu-wrapper').forEach(el => el.classList.remove('hidden'));
}

function hideAdminControls() {
    document.querySelectorAll('.admin-login-btn, #adminLoginBtn').forEach(b => b.classList.remove('hidden'));
    document.querySelectorAll('.admin-logout-btn, #adminLogoutBtn').forEach(b => b.classList.add('hidden'));
    const addGameFab = document.getElementById('addGameFab');
    const adminMenu = document.getElementById('adminMenu');

    if (addGameFab) addGameFab.classList.add('hidden');
    if (adminMenu) adminMenu.classList.add('hidden');

    // Hide admin-only menus (modal & standalone 3-dot menus)
    document.querySelectorAll('.more-menu-wrapper').forEach(el => el.classList.add('hidden'));
}

// --- Async backend verification on page load (secure-by-default) ---
async function verifyAdminSession() {
    if (!isAdmin()) {
        hideAdminControls();
        return;
    }
    // Token exists and has not expired client-side — verify with backend
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    try {
        const res = await fetch(`${API_BASE}/admin/verify`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            showAdminControls();
        } else {
            // Token rejected by server (expired, tampered, or invalid)
            clearAdminSession();
            hideAdminControls();
        }
    } catch (err) {
        // Network error — keep visitor mode but don't purge (could be offline refresh)
        hideAdminControls();
    }
}

// --- DOMContentLoaded: wire up everything ---
document.addEventListener('DOMContentLoaded', () => {
    // Secure-by-default: start in visitor mode, then verify async
    hideAdminControls();
    verifyAdminSession();

    // Login Modal & About Modal Handlers
    const loginModal = document.getElementById('loginModal');
    const loginClose = document.getElementById('loginClose');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    const aboutModal = document.getElementById('aboutModal');
    const aboutModalClose = document.getElementById('aboutModalClose');
    const aboutSectionClose = document.getElementById('aboutSectionClose');

    // Admin Login triggers (open login modal, hide about modal if open)
    document.querySelectorAll('.admin-login-btn, #adminLoginBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (aboutModal) aboutModal.classList.add('hidden');
            if (loginModal) loginModal.classList.remove('hidden');
        });
    });

    // Admin Logout triggers
    document.querySelectorAll('.admin-logout-btn, #adminLogoutBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const logout = confirm('Are you sure you want to log out of Admin?');
            if (logout) {
                clearAdminSession();
                hideAdminControls();
                window.location.reload();
            }
        });
    });

    // Close About Modal
    if (aboutModalClose && aboutModal) {
        aboutModalClose.addEventListener('click', () => {
            aboutModal.classList.add('hidden');
        });
    }

    // Close Section card (scroll to top)
    if (aboutSectionClose) {
        aboutSectionClose.addEventListener('click', () => {
            const hero = document.getElementById('hero') || document.body;
            hero.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (aboutModal) {
        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                aboutModal.classList.add('hidden');
            }
        });
    }

    // Close Login Modal
    if (loginModal) {
        if (loginClose) {
            loginClose.addEventListener('click', () => {
                loginModal.classList.add('hidden');
            });
        }
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.add('hidden');
            }
        });
    }

    // Global Escape Key to close open modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (aboutModal && !aboutModal.classList.contains('hidden')) {
                aboutModal.classList.add('hidden');
            }
            if (loginModal && !loginModal.classList.contains('hidden')) {
                loginModal.classList.add('hidden');
            }
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            
            try {
                const data = new URLSearchParams(formData);
                const res = await fetch(`${API_BASE}/admin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: data
                });
                
                if (!res.ok) {
                    throw new Error('Invalid credentials');
                }
                
                const result = await res.json();
                // Store in sessionStorage (tab-scoped) with 4-hour expiry
                const expiry = Date.now() + SESSION_LIFETIME_MS;
                sessionStorage.setItem(SESSION_TOKEN_KEY, result.access_token);
                sessionStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
                // Clean up any legacy localStorage tokens
                localStorage.removeItem(SESSION_TOKEN_KEY);
                
                loginModal.classList.add('hidden');
                showAdminControls();
                loginForm.reset();
                loginError.classList.add('hidden');
                
                window.location.reload();
            } catch (err) {
                loginError.textContent = err.message;
                loginError.classList.remove('hidden');
            }
        });
    }

    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            clearAdminSession();
            hideAdminControls();
            window.location.reload();
        });
    }
});
