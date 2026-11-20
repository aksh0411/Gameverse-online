// ===== GAMEVERSE Universal Auth (Supabase Auth + Native FastAPI Layer) =====

const SESSION_TOKEN_KEY = 'admin_token';
const SESSION_EXPIRY_KEY = 'admin_token_expiry';
const USER_TOKEN_KEY = 'gv_access_token';
const USER_EXPIRY_KEY = 'gv_token_expiry';
const USER_ROLE_KEY = 'gv_role';
const USER_NAME_KEY = 'gv_username';
const USER_EMAIL_KEY = 'gv_email';
const USER_AVATAR_KEY = 'gv_avatar_url';
const PENDING_EMAIL_KEY = 'gv_pending_email';
const LOGIN_TIME_KEY = 'gv_login_time';
const REMEMBER_ME_KEY = 'gv_remember_me';

// Session windows: 3 hours default (public PC), 30 days if "Remember me" is checked
const AUTO_LOGOUT_HOURS = 3;
const AUTO_LOGOUT_MS = AUTO_LOGOUT_HOURS * 60 * 60 * 1000;
const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;

window.supabaseClient = null;
window.currentUser = null;

// --- 8 Preset Gamer Avatars (Self-contained vector SVGs) ---
const GAMER_AVATARS = [
    {
        id: 'avatar_cyber',
        name: 'Cyber Neon',
        accent: '#00f5d4',
        svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#0d1117" stroke="#00f5d4" stroke-width="2"/><path d="M10 17C10 13 14 10 20 10C26 10 30 13 30 17V22C30 26 26 29 20 29C14 29 10 26 10 22V17Z" fill="#161b22" stroke="#7209b7" stroke-width="1.5"/><rect x="12" y="17" width="16" height="5" rx="2.5" fill="#00f5d4"/><circle cx="16" cy="19.5" r="1.5" fill="#fff"/><circle cx="24" cy="19.5" r="1.5" fill="#fff"/><path d="M16 26H24" stroke="#f72585" stroke-width="2" stroke-linecap="round"/><path d="M8 20L10 19M32 20L30 19" stroke="#00f5d4" stroke-width="2"/></svg>`
    },
    {
        id: 'avatar_knight',
        name: 'Pixel Knight',
        accent: '#ffd166',
        svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#0b132b" stroke="#ffd166" stroke-width="2"/><path d="M20 9L27 15V22C27 26 20 30 20 30C20 30 13 26 13 22V15L20 9Z" fill="#1c2541" stroke="#ffd166" stroke-width="1.5"/><path d="M20 9V29" stroke="#ffd166" stroke-width="1.5"/><path d="M15 17H25" stroke="#ffd166" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="17" r="1" fill="#fff"/><circle cx="23" cy="17" r="1" fill="#fff"/></svg>`
    },
    {
        id: 'avatar_retro',
        name: 'Retro Arcade',
        accent: '#f72585',
        svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#1a1423" stroke="#f72585" stroke-width="2"/><rect x="10" y="14" width="20" height="13" rx="4" fill="#2d1e3e" stroke="#f72585" stroke-width="1.5"/><path d="M14 18V22M12 20H16" stroke="#00f5d4" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="19" r="1.5" fill="#ffbe0b"/><circle cx="27" cy="21" r="1.5" fill="#f72585"/><rect x="18" y="24" width="4" height="1" fill="#fff"/></svg>`
    },
    {
        id: 'avatar_wizard',
        name: 'Arcane Wizard',
        accent: '#9d4edd',
        svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#130e24" stroke="#9d4edd" stroke-width="2"/><path d="M20 9L27 24H13L20 9Z" fill="#241442" stroke="#c77dff" stroke-width="1.5"/><ellipse cx="20" cy="24" rx="10" ry="3" fill="#3c096c" stroke="#c77dff" stroke-width="1.5"/><polygon points="20,13 21,15.5 24,15.5 21.5,17 22.5,19.5 20,18 17.5,19.5 18.5,17 16,15.5 19,15.5" fill="#ffbe0b"/><circle cx="20" cy="29" r="1.5" fill="#00f5d4"/></svg>`
    },
    {
        id: 'avatar_mech',
        name: 'Neon Mech',
        accent: '#06d6a0',
        svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#0d1b1e" stroke="#06d6a0" stroke-width="2"/><rect x="12" y="13" width="16" height="15" rx="3" fill="#1a3a3a" stroke="#06d6a0" stroke-width="1.5"/><rect x="14" y="16" width="12" height="4" rx="1" fill="#06d6a0"/><circle cx="20" cy="18" r="1.5" fill="#fff"/><path d="M15 24H25" stroke="#ffbe0b" stroke-width="1.5" stroke-dasharray="2 1"/><line x1="20" y1="10" x2="20" y2="13" stroke="#06d6a0" stroke-width="2"/><circle cx="20" cy="9" r="1.5" fill="#ffbe0b"/></svg>`
    },
    {
        id: 'avatar_ninja',
        name: 'Shadow Ninja',
        accent: '#e63946',
        svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#121214" stroke="#e63946" stroke-width="2"/><circle cx="20" cy="20" r="11" fill="#202024"/><path d="M12 17C14 16 26 16 28 17V20C26 21 14 21 12 20V17Z" fill="#e63946"/><ellipse cx="16" cy="18.5" rx="1.8" ry="1" fill="#fff"/><ellipse cx="24" cy="18.5" rx="1.8" ry="1" fill="#fff"/><circle cx="16" cy="18.5" r="0.7" fill="#000"/><circle cx="24" cy="18.5" r="0.7" fill="#000"/><path d="M28 17L33 15M28 19L32 20" stroke="#e63946" stroke-width="1.5"/></svg>`
    },
    {
        id: 'avatar_dragon',
        name: 'Dragon Crest',
        accent: '#ff4d6d',
        svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#1f0e13" stroke="#ff4d6d" stroke-width="2"/><path d="M13 14L18 10L20 14L22 10L27 14L24 20L20 27L16 20L13 14Z" fill="#370617" stroke="#ff758f" stroke-width="1.5"/><circle cx="17" cy="17" r="1.5" fill="#ffbe0b"/><circle cx="23" cy="17" r="1.5" fill="#ffbe0b"/><path d="M18 22L20 24L22 22" stroke="#ff4d6d" stroke-width="1.5" stroke-linecap="round"/><polygon points="20,15 21,18 20,20 19,18" fill="#ff4d6d"/></svg>`
    },
    {
        id: 'avatar_marine',
        name: 'Space Marine',
        accent: '#48cae4',
        svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#081b29" stroke="#48cae4" stroke-width="2"/><circle cx="20" cy="20" r="10" fill="#13314d" stroke="#48cae4" stroke-width="1.5"/><ellipse cx="20" cy="19" rx="7" ry="5.5" fill="#00b4d8"/><ellipse cx="18" cy="17.5" rx="4" ry="2.5" fill="#90e0ef" opacity="0.6"/><circle cx="13" cy="26" r="1" fill="#ffd166"/><circle cx="27" cy="26" r="1" fill="#ffd166"/></svg>`
    }
];

function getAvatarData(avatarId) {
    return GAMER_AVATARS.find(a => a.id === avatarId) || GAMER_AVATARS[0];
}
window.GAMER_AVATARS = GAMER_AVATARS;
window.getAvatarData = getAvatarData;

// --- Sleek Dark-Mode Neon Toast System ---
function showToast(message, type = 'success', duration = 3400) {
    let container = document.getElementById('gameverseToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'gameverseToastContainer';
        container.className = 'gv-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `gv-toast toast-${type}`;

    let icon = '🎮';
    if (type === 'favorite') icon = '⭐';
    else if (type === 'bookmark') icon = '🔖';
    else if (type === 'success') icon = '✨';
    else if (type === 'warning') icon = '⚠️';
    else if (type === 'info') icon = '🕹️';

    toast.innerHTML = `
        <div class="gv-toast-icon">${icon}</div>
        <div class="gv-toast-body">${escHtml(message)}</div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    let timer = null;
    const dismiss = () => {
        if (timer) clearTimeout(timer);
        toast.classList.remove('show');
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentElement) toast.parentElement.removeChild(toast);
        }, 360);
    };

    toast.addEventListener('click', dismiss);
    timer = setTimeout(dismiss, duration);
}
window.showToast = showToast;

function checkPendingToasts() {
    const welcomeUser = sessionStorage.getItem('gv_welcome_toast');
    if (welcomeUser) {
        sessionStorage.removeItem('gv_welcome_toast');
        setTimeout(() => {
            showToast(`Welcome back, ${welcomeUser}! 🎮`, 'success', 4000);
        }, 400);
    }
    const expiredToast = sessionStorage.getItem('gv_expired_toast');
    if (expiredToast) {
        sessionStorage.removeItem('gv_expired_toast');
        setTimeout(() => {
            showToast('Session expired for security. Please sign in again.', 'warning', 4500);
        }, 400);
    }
}

function getActiveSessionDuration() {
    const isRemembered = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    return isRemembered ? REMEMBER_MS : AUTO_LOGOUT_MS;
}

// --- Role & Auth State Checks ---
function isAdmin() {
    if (sessionStorage.getItem(USER_ROLE_KEY) === 'admin') {
        const token = sessionStorage.getItem(USER_TOKEN_KEY);
        const expiry = parseInt(sessionStorage.getItem(USER_EXPIRY_KEY), 10);
        if (token && (!expiry || Date.now() < expiry)) {
            return true;
        }
    }
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) return false;
    const expiry = parseInt(sessionStorage.getItem(SESSION_EXPIRY_KEY), 10);
    if (!expiry || Date.now() > expiry) {
        clearAuthSession();
        return false;
    }
    return true;
}
window.isAdmin = isAdmin;

function isLoggedIn() {
    const token = (typeof getAuthToken === 'function')
        ? getAuthToken()
        : (sessionStorage.getItem(USER_TOKEN_KEY) || localStorage.getItem(USER_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY));
    if (!token) return false;

    // Check session duration (30 days if Remember Me, else 3 hours)
    const duration = getActiveSessionDuration();
    const loginTime = parseInt(sessionStorage.getItem(LOGIN_TIME_KEY) || localStorage.getItem(LOGIN_TIME_KEY), 10);
    if (loginTime && (Date.now() - loginTime) >= duration) {
        clearAuthSession();
        return false;
    }

    const expiry = parseInt(sessionStorage.getItem(USER_EXPIRY_KEY) || localStorage.getItem(USER_EXPIRY_KEY) || sessionStorage.getItem(SESSION_EXPIRY_KEY), 10);
    if (expiry && Date.now() >= expiry) {
        clearAuthSession();
        return false;
    }
    return true;
}
window.isLoggedIn = isLoggedIn;

function clearAuthSession() {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    sessionStorage.removeItem(USER_TOKEN_KEY);
    sessionStorage.removeItem(USER_EXPIRY_KEY);
    sessionStorage.removeItem(USER_ROLE_KEY);
    sessionStorage.removeItem(USER_NAME_KEY);
    sessionStorage.removeItem(USER_EMAIL_KEY);
    sessionStorage.removeItem(USER_AVATAR_KEY);
    sessionStorage.removeItem(PENDING_EMAIL_KEY);
    sessionStorage.removeItem(LOGIN_TIME_KEY);

    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_EXPIRY_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_AVATAR_KEY);
    localStorage.removeItem(PENDING_EMAIL_KEY);
    localStorage.removeItem(LOGIN_TIME_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);

    // Clean any Supabase auth keys stored in localStorage safely
    try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('sb-') || k.includes('auth-token'))) {
                localStorage.removeItem(k);
            }
        }
    } catch(e) {}

    if (window._autoSignOutTimer) {
        clearTimeout(window._autoSignOutTimer);
        window._autoSignOutTimer = null;
    }
    window.currentUser = null;
}

function setupAutoSignOut() {
    if (window._autoSignOutTimer) {
        clearTimeout(window._autoSignOutTimer);
        window._autoSignOutTimer = null;
    }
    const token = (typeof getAuthToken === 'function')
        ? getAuthToken()
        : (sessionStorage.getItem(USER_TOKEN_KEY) || localStorage.getItem(USER_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY));
    if (!token) return;

    let loginTime = parseInt(sessionStorage.getItem(LOGIN_TIME_KEY) || localStorage.getItem(LOGIN_TIME_KEY), 10);
    if (!loginTime) {
        loginTime = Date.now();
        sessionStorage.setItem(LOGIN_TIME_KEY, loginTime.toString());
        localStorage.setItem(LOGIN_TIME_KEY, loginTime.toString());
    }

    const duration = getActiveSessionDuration();
    const expiry = loginTime + duration;
    sessionStorage.setItem(USER_EXPIRY_KEY, expiry.toString());
    localStorage.setItem(USER_EXPIRY_KEY, expiry.toString());

    const remainingMs = expiry - Date.now();
    if (remainingMs <= 0) {
        console.warn('Session expired. Signing out automatically.');
        sessionStorage.setItem('gv_expired_toast', 'true');
        logoutUser();
        return;
    }

    // Set JavaScript timeout if remaining time is under max 32-bit int (~24.8 days)
    if (remainingMs < 2147483647) {
        window._autoSignOutTimer = setTimeout(() => {
            console.warn('Auto sign-out timer reached.');
            sessionStorage.setItem('gv_expired_toast', 'true');
            logoutUser();
        }, remainingMs);
    }
}
window.setupAutoSignOut = setupAutoSignOut;
window.clearAuthSession = clearAuthSession;

// --- Body Scroll Lock Control for Modals ---
function lockBodyScroll() {
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    const detailView = document.getElementById('gameDetailModalView');
    if (detailView) {
        detailView.classList.add('scroll-locked');
    }
}
window.lockBodyScroll = lockBodyScroll;

function unlockBodyScroll() {
    const openModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
    if (openModals.length === 0) {
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        const detailView = document.getElementById('gameDetailModalView');
        if (detailView) {
            detailView.classList.remove('scroll-locked');
        }
    }
}
window.unlockBodyScroll = unlockBodyScroll;

// --- Modal Control ---
function openLoginModal(message, defaultTab = 'signin') {
    lockBodyScroll();
    ensureAdminAssets();
    renderAvatarGrids();
    const loginModal = document.getElementById('loginModal');
    if (!loginModal) return;

    loginModal.classList.remove('hidden');
    resetModalViews();

    if (defaultTab === 'signup') {
        switchAuthTab('signup');
    } else if (defaultTab === 'otp') {
        const pending = sessionStorage.getItem(PENDING_EMAIL_KEY) || '';
        showOtpView(pending);
    } else {
        switchAuthTab('signin');
    }

    const loginError = document.getElementById('loginError');
    const loginInfo = document.getElementById('loginInfo');
    if (loginError) loginError.classList.add('hidden');
    if (loginInfo) {
        if (message) {
            loginInfo.textContent = message;
            loginInfo.classList.remove('hidden');
        } else {
            loginInfo.classList.add('hidden');
        }
    }

    const initialInput = defaultTab === 'signup' 
        ? document.getElementById('signUpUsername') 
        : document.getElementById('loginIdentifier');
    if (initialInput) initialInput.focus();
}
window.openLoginModal = openLoginModal;

function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.classList.add('hidden');
    resetModalViews();
    unlockBodyScroll();
}
window.closeLoginModal = closeLoginModal;

function requireAdmin(actionDescription = 'modify collection data') {
    if (!isAdmin()) {
        openLoginModal(`Admin access required to ${actionDescription}.`, 'signin');
        return false;
    }
    return true;
}
window.requireAdmin = requireAdmin;

function requireAuth(actionDescription = 'save to your library') {
    if (!isLoggedIn()) {
        openLoginModal(`Sign in to ${actionDescription}.`, 'signin');
        return false;
    }
    return true;
}
window.requireAuth = requireAuth;

// --- Assets Loader ---
function ensureAdminAssets() {
    if (!document.getElementById('adminCss')) {
        const link = document.createElement('link');
        link.id = 'adminCss';
        link.rel = 'stylesheet';
        link.href = 'css/admin.css?v=9.0';
        document.head.appendChild(link);
    }
    if (!document.getElementById('adminScript')) {
        const script = document.createElement('script');
        script.id = 'adminScript';
        script.src = 'js/admin.js?v=9.2';
        document.body.appendChild(script);
    }
}

// --- Admin Controls Visibility ---
function showAdminControls() {
    ensureAdminAssets();
    document.querySelectorAll('.admin-login-btn, #adminLoginBtn').forEach(b => b.classList.add('hidden'));
    document.querySelectorAll('.admin-logout-btn, #adminLogoutBtn').forEach(b => b.classList.remove('hidden'));

    const addGameFab = document.getElementById('addGameFab');
    const adminMenu = document.getElementById('adminMenu');
    if (addGameFab) addGameFab.classList.remove('hidden');
    if (adminMenu) adminMenu.classList.remove('hidden');

    document.querySelectorAll('.more-menu-wrapper').forEach(el => el.classList.remove('hidden'));
}

function hideAdminControls() {
    const addGameFab = document.getElementById('addGameFab');
    const adminMenu = document.getElementById('adminMenu');
    if (addGameFab) addGameFab.classList.add('hidden');
    if (adminMenu) adminMenu.classList.add('hidden');
    document.querySelectorAll('.more-menu-wrapper').forEach(el => el.classList.add('hidden'));
}

// --- Tab & View Switching ---
function switchAuthTab(tab) {
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');
    const viewSignIn = document.getElementById('authViewSignIn');
    const viewSignUp = document.getElementById('authViewSignUp');
    const authTabs = document.getElementById('authTabs');

    if (authTabs) authTabs.classList.remove('hidden');
    document.querySelectorAll('.auth-view').forEach(v => v.classList.add('hidden'));
    clearModalMessages();

    if (tab === 'signup') {
        if (tabSignUp) tabSignUp.classList.add('active');
        if (tabSignIn) tabSignIn.classList.remove('active');
        if (viewSignUp) viewSignUp.classList.remove('hidden');
        const uInp = document.getElementById('signUpUsername');
        if (uInp) uInp.focus();
    } else {
        if (tabSignIn) tabSignIn.classList.add('active');
        if (tabSignUp) tabSignUp.classList.remove('active');
        if (viewSignIn) viewSignIn.classList.remove('hidden');
        const idInp = document.getElementById('loginIdentifier');
        if (idInp) idInp.focus();
    }
}

function showOtpView(email) {
    if (email) sessionStorage.setItem(PENDING_EMAIL_KEY, email);
    const authTabs = document.getElementById('authTabs');
    if (authTabs) authTabs.classList.add('hidden');
    document.querySelectorAll('.auth-view').forEach(v => v.classList.add('hidden'));
    clearModalMessages();

    const otpView = document.getElementById('authViewOtp');
    const otpEmailSpan = document.getElementById('otpTargetEmail');
    const currentEmail = email || sessionStorage.getItem(PENDING_EMAIL_KEY) || 'your email';
    if (otpEmailSpan) otpEmailSpan.textContent = currentEmail;
    if (otpView) otpView.classList.remove('hidden');
    const otpInp = document.getElementById('otpCode');
    if (otpInp) {
        otpInp.value = '';
        otpInp.focus();
    }
}

function showForgotView() {
    const authTabs = document.getElementById('authTabs');
    if (authTabs) authTabs.classList.add('hidden');
    document.querySelectorAll('.auth-view').forEach(v => v.classList.add('hidden'));
    clearModalMessages();

    const forgotView = document.getElementById('authViewForgot');
    if (forgotView) forgotView.classList.remove('hidden');
    const forgotInp = document.getElementById('forgotIdentifier');
    if (forgotInp) {
        forgotInp.value = document.getElementById('loginIdentifier')?.value || '';
        forgotInp.focus();
    }
}

function resetModalViews() {
    const authTabs = document.getElementById('authTabs');
    if (authTabs) authTabs.classList.remove('hidden');
    switchAuthTab('signin');
    clearModalMessages();
}

function clearModalMessages() {
    const err = document.getElementById('loginError');
    const info = document.getElementById('loginInfo');
    if (err) { err.textContent = ''; err.classList.add('hidden'); }
    if (info) { info.textContent = ''; info.classList.add('hidden'); }
}

function setModalError(msg) {
    const err = document.getElementById('loginError');
    if (err) {
        err.textContent = msg;
        err.classList.remove('hidden');
    }
}

function setModalInfo(msg) {
    const info = document.getElementById('loginInfo');
    if (info) {
        info.textContent = msg;
        info.classList.remove('hidden');
    }
}

// --- Live Username Availability Check (Debounced) ---
let _usernameDebounceTimer = null;
function setupUsernameValidation() {
    const input = document.getElementById('signUpUsername');
    const statusEl = document.getElementById('usernameStatus');
    if (!input || !statusEl) return;

    input.addEventListener('input', () => {
        clearTimeout(_usernameDebounceTimer);
        const val = input.value.trim();
        statusEl.className = 'username-feedback';
        
        if (!val) {
            statusEl.textContent = '';
            return;
        }

        if (!/^[A-Za-z]{4,20}$/.test(val)) {
            statusEl.className = 'username-feedback invalid';
            statusEl.textContent = '4–20 letters only (no numbers or symbols)';
            return;
        }

        statusEl.textContent = 'Checking availability…';
        _usernameDebounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`${API_BASE}/auth/username-available?u=${encodeURIComponent(val)}`);
                const data = await res.json();
                if (data.available) {
                    statusEl.className = 'username-feedback valid';
                    statusEl.textContent = '✓ Username is available';
                } else {
                    statusEl.className = 'username-feedback invalid';
                    statusEl.textContent = `✗ ${data.reason || 'Username is taken'}`;
                }
            } catch (e) {
                statusEl.textContent = '';
            }
        }, 320);
    });
}

// --- Universal Navbar & Profile Dropdown Rendering (index.html + library.html) ---

// --- User Profile Modal & Logout Controllers ---
function renderProfileAvatarCircle(avatarId, username = 'U') {
    const avatarCircle = document.getElementById('profileAvatarCircle');
    if (!avatarCircle) return;
    const av = getAvatarData(avatarId);
    if (av && av.svg) {
        avatarCircle.innerHTML = av.svg;
        avatarCircle.style.background = 'transparent';
        avatarCircle.style.boxShadow = `0 8px 24px ${av.accent}40`;
    } else {
        avatarCircle.textContent = (username || 'U').charAt(0).toUpperCase();
        avatarCircle.style.background = 'linear-gradient(135deg, #00b4d8, #00f5d4)';
        avatarCircle.style.boxShadow = '0 8px 24px rgba(0,245,212,0.35)';
    }
}

function renderAvatarGrids() {
    // 1. Profile modal grid
    const profileGrid = document.getElementById('profileAvatarGrid');
    const currentAvatarId = sessionStorage.getItem(USER_AVATAR_KEY) || localStorage.getItem(USER_AVATAR_KEY) || 'avatar_cyber';
    
    if (profileGrid) {
        profileGrid.innerHTML = '';
        GAMER_AVATARS.forEach(av => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `avatar-option-btn ${av.id === currentAvatarId ? 'selected' : ''}`;
            btn.title = av.name;
            btn.innerHTML = `
                <div class="avatar-option-icon">${av.svg}</div>
                <div class="avatar-option-name">${escHtml(av.name)}</div>
            `;
            btn.addEventListener('click', () => {
                selectGamerAvatar(av.id);
            });
            profileGrid.appendChild(btn);
        });
        const currentLabel = document.getElementById('profileAvatarCurrentLabel');
        if (currentLabel) {
            currentLabel.textContent = getAvatarData(currentAvatarId).name;
        }
    }

    // 2. SignUp modal grid
    const signUpGrid = document.getElementById('signUpAvatarGrid');
    if (signUpGrid) {
        signUpGrid.innerHTML = '';
        const selectedInput = document.getElementById('signUpSelectedAvatar');
        const selectedId = selectedInput?.value || 'avatar_cyber';
        
        GAMER_AVATARS.forEach(av => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `avatar-option-btn ${av.id === selectedId ? 'selected' : ''}`;
            btn.title = av.name;
            btn.innerHTML = `
                <div class="avatar-option-icon">${av.svg}</div>
                <div class="avatar-option-name">${escHtml(av.name)}</div>
            `;
            btn.addEventListener('click', () => {
                if (selectedInput) selectedInput.value = av.id;
                signUpGrid.querySelectorAll('.avatar-option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
            signUpGrid.appendChild(btn);
        });
    }
}
window.renderAvatarGrids = renderAvatarGrids;

async function selectGamerAvatar(avatarId) {
    sessionStorage.setItem(USER_AVATAR_KEY, avatarId);
    localStorage.setItem(USER_AVATAR_KEY, avatarId);
    if (window.currentUser) {
        window.currentUser.avatar_url = avatarId;
    }

    const avData = getAvatarData(avatarId);
    const currentLabel = document.getElementById('profileAvatarCurrentLabel');
    if (currentLabel) currentLabel.textContent = avData.name;

    const profileGrid = document.getElementById('profileAvatarGrid');
    if (profileGrid) {
        profileGrid.querySelectorAll('.avatar-option-btn').forEach((b, idx) => {
            b.classList.toggle('selected', GAMER_AVATARS[idx]?.id === avatarId);
        });
    }

    // Update avatar display in profile modal circle & navbar
    renderProfileAvatarCircle(avatarId, window.currentUser?.username || 'U');
    updateNavbarUserState(window.currentUser);

    // Persist to database if logged in
    if (isLoggedIn() && typeof apiPatch === 'function') {
        try {
            await apiPatch('/me/profile', { avatar_url: avatarId });
            showToast(`Avatar updated to ${avData.name}! 🎮`, 'info');
        } catch(e) {
            console.warn('Failed to sync avatar to database:', e);
        }
    }
}
window.selectGamerAvatar = selectGamerAvatar;

function openUserProfileModal() {
    lockBodyScroll();
    const modal = document.getElementById('userProfileModal');
    if (!modal) return;
    const user = window.currentUser || {
        username: sessionStorage.getItem(USER_NAME_KEY) || 'User',
        email: sessionStorage.getItem(USER_EMAIL_KEY) || '',
        role: sessionStorage.getItem(USER_ROLE_KEY) || 'user',
        avatar_url: sessionStorage.getItem(USER_AVATAR_KEY) || localStorage.getItem(USER_AVATAR_KEY) || 'avatar_cyber'
    };
    const usernameEl = document.getElementById('profileModalUsername');
    const emailEl = document.getElementById('profileModalEmail');
    const roleEl = document.getElementById('profileModalRole');

    if (usernameEl) usernameEl.textContent = `@${user.username}`;
    if (emailEl) emailEl.textContent = user.email || 'Not provided';
    if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Administrator' : 'Explorer';

    renderProfileAvatarCircle(user.avatar_url, user.username);
    renderAvatarGrids();

    // Reset avatar picker to hidden state by default on modal open
    const avatarSection = document.getElementById('profileAvatarSection');
    if (avatarSection) avatarSection.classList.add('hidden');
    const avatarHint = document.getElementById('avatarChangeHint');
    if (avatarHint) avatarHint.textContent = 'Click avatar to change ▾';

    modal.classList.remove('hidden');
}

function closeUserProfileModal() {
    const modal = document.getElementById('userProfileModal');
    if (modal) modal.classList.add('hidden');
    unlockBodyScroll();
}

let _isLoggingOut = false;
async function logoutUser() {
    if (_isLoggingOut) return;
    _isLoggingOut = true;

    try {
        if (window.supabaseClient && window.supabaseClient.auth) {
            await Promise.race([
                window.supabaseClient.auth.signOut({ scope: 'local' }).catch(() => {}),
                new Promise(resolve => setTimeout(resolve, 300))
            ]);
        }
    } catch(e) {}

    clearAuthSession();
    try {
        localStorage.removeItem('gv_visitor_preferences');
    } catch(e) {}
    hideAdminControls();
    updateNavbarUserState(null);
    closeUserProfileModal();
    if (typeof unlockBodyScroll === 'function') unlockBodyScroll();
    if (window.closeGameDetail && typeof window.closeGameDetail === 'function') {
        try { window.closeGameDetail(); } catch(e) {}
    }
    window.location.replace('index.html');
}

function updateNavbarUserState(user) {
    window.currentUser = user;
    const allAvatarBtns = document.querySelectorAll('#avatarBtn, #loginBtn, .header-avatar-btn, #modalNavProfile, .modal-nav-profile');
    
    // Position dropdown under primary anchor
    const primaryBtn = document.getElementById('avatarBtn') || document.getElementById('loginBtn') || document.querySelector('.header-avatar-btn');
    
    let dropdown = document.getElementById('userMenuDropdown');
    if (!dropdown && primaryBtn && primaryBtn.parentElement) {
        dropdown = document.createElement('div');
        dropdown.id = 'userMenuDropdown';
        dropdown.className = 'user-menu-dropdown hidden';
        primaryBtn.parentElement.style.position = 'relative';
        primaryBtn.parentElement.appendChild(dropdown);
    }

    if (user) {
        const initial = (user.username || 'U').charAt(0).toUpperCase();
        const avData = getAvatarData(user.avatar_url || sessionStorage.getItem(USER_AVATAR_KEY) || localStorage.getItem(USER_AVATAR_KEY) || 'avatar_cyber');

        allAvatarBtns.forEach(btn => {
            const fallback = btn.querySelector('.avatar-fallback');
            const target = fallback || btn;

            if (avData && avData.svg) {
                target.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">${avData.svg}</div>`;
                target.style.background = 'transparent';
                target.style.boxShadow = `0 0 10px ${avData.accent}55`;
            } else {
                target.textContent = initial;
                target.style.background = user.role === 'admin' 
                    ? 'linear-gradient(135deg, #7209b7, #f72585)' 
                    : 'linear-gradient(135deg, #00b4d8, #00f5d4)';
                target.style.color = '#fff';
                target.style.boxShadow = '';
            }
            btn.title = `@${user.username} (${user.email || user.role})`;
        });

        if (dropdown) {
            dropdown.innerHTML = `
                <div class="user-menu-header" style="display:flex; align-items:center; gap:10px;">
                    <div style="width:36px; height:36px; border-radius:50%; flex-shrink:0;">
                        ${avData ? avData.svg : `<div style="width:100%; height:100%; border-radius:50%; background:linear-gradient(135deg, #00b4d8, #00f5d4); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700;">${initial}</div>`}
                    </div>
                    <div style="flex:1; overflow:hidden;">
                        <div class="user-menu-header-name">@${escHtml(user.username)}</div>
                        ${user.email ? `<div style="font-size:0.75rem; color:#aaa; margin-top:2px; word-break:break-all;">${escHtml(user.email)}</div>` : ''}
                        <div class="user-menu-header-role" style="margin-top:4px;">${user.role === 'admin' ? '🛡️ Administrator' : '🎮 Explorer'}</div>
                    </div>
                </div>
                <a href="library.html?filter=favorites" class="user-menu-item">
                    <span>❤️</span> My Favorites
                </a>
                <a href="library.html?filter=playing" class="user-menu-item">
                    <span>🕹️</span> Currently Playing
                </a>
                <a href="library.html?filter=backlog" class="user-menu-item">
                    <span>📚</span> Backlog
                </a>
                ${user.role === 'admin' ? `
                    <button type="button" class="user-menu-item" id="userMenuAdminBtn">
                        <span>⚙️</span> Add New Game
                    </button>
                ` : ''}
                <div style="height:1px; background:rgba(255,255,255,0.08); margin:4px 0;"></div>
                <button type="button" class="user-menu-item" id="userMenuSignOutBtn" style="color:#ff5c7c;">
                    <span>🚪</span> Sign Out
                </button>
            `;

            const adminBtn = dropdown.querySelector('#userMenuAdminBtn');
            if (adminBtn) {
                adminBtn.addEventListener('click', () => {
                    dropdown.classList.add('hidden');
                    const addGameModal = document.getElementById('addGameModal');
                    if (addGameModal) addGameModal.classList.remove('hidden');
                });
            }

            const signOutBtn = dropdown.querySelector('#userMenuSignOutBtn');
            if (signOutBtn) {
                signOutBtn.addEventListener('click', () => {
                    dropdown.classList.add('hidden');
                    logoutUser();
                });
            }
        }

        if (user.role === 'admin') {
            showAdminControls();
        } else {
            hideAdminControls();
        }
    } else {
        // Logged out
        const userSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
        allAvatarBtns.forEach(btn => {
            const fallback = btn.querySelector('.avatar-fallback');
            if (fallback) {
                fallback.innerHTML = userSvg;
                fallback.style.background = '';
                fallback.style.color = '';
                fallback.style.boxShadow = '';
            } else {
                btn.innerHTML = userSvg;
                btn.style.background = '';
                btn.style.color = '';
                btn.style.boxShadow = '';
            }
            btn.title = 'Sign In / Register';
        });

        if (dropdown) {
            dropdown.innerHTML = `
                <button type="button" class="user-menu-item" id="userMenuSignInBtn">
                    <span>🔑</span> Sign In
                </button>
                <button type="button" class="user-menu-item" id="userMenuSignUpBtn">
                    <span>✨</span> Create Account
                </button>
            `;
            const signInBtn = dropdown.querySelector('#userMenuSignInBtn');
            if (signInBtn) {
                signInBtn.addEventListener('click', () => {
                    dropdown.classList.add('hidden');
                    openLoginModal(null, 'signin');
                });
            }
            const signUpBtn = dropdown.querySelector('#userMenuSignUpBtn');
            if (signUpBtn) {
                signUpBtn.addEventListener('click', () => {
                    dropdown.classList.add('hidden');
                    openLoginModal(null, 'signup');
                });
            }
        }
        hideAdminControls();
    }
}

// --- Synchronize User Session with Backend & Update Navbar ---
async function syncUserSession(token, userFallback = null) {
    if (!token) {
        updateNavbarUserState(null);
        return null;
    }
    try {
        const res = await fetch(`${API_BASE}/admin/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            const avatarVal = data.avatar_url || userFallback?.user_metadata?.avatar_url || sessionStorage.getItem(USER_AVATAR_KEY) || localStorage.getItem(USER_AVATAR_KEY) || 'avatar_cyber';
            const user = {
                username: data.username || userFallback?.user_metadata?.username || sessionStorage.getItem(USER_NAME_KEY) || 'User',
                email: userFallback?.email || sessionStorage.getItem(USER_EMAIL_KEY) || '',
                role: data.role || (data.is_admin ? 'admin' : 'user'),
                is_admin: Boolean(data.is_admin),
                avatar_url: avatarVal
            };
            sessionStorage.setItem(USER_ROLE_KEY, user.role);
            sessionStorage.setItem(USER_NAME_KEY, user.username);
            sessionStorage.setItem(USER_AVATAR_KEY, user.avatar_url);
            if (user.email) sessionStorage.setItem(USER_EMAIL_KEY, user.email);
            localStorage.setItem(USER_ROLE_KEY, user.role);
            localStorage.setItem(USER_NAME_KEY, user.username);
            localStorage.setItem(USER_AVATAR_KEY, user.avatar_url);
            if (user.email) localStorage.setItem(USER_EMAIL_KEY, user.email);
            localStorage.setItem(USER_TOKEN_KEY, token);
            updateNavbarUserState(user);

            // Re-apply preferences now that user identity is confirmed
            if (window.__ALL_GAMES__ && typeof applyVisitorPreferences === 'function') {
                applyVisitorPreferences(window.__ALL_GAMES__).then(() => {
                    if (typeof window.refreshStats === 'function') window.refreshStats();
                    if (typeof window.refreshGrids === 'function') window.refreshGrids();
                    if (typeof window.updateCollectionCore === 'function') window.updateCollectionCore(window.__ALL_GAMES__);
                });
            }

            // Clean #access_token=... hash from URL bar
            if (window.location.hash && window.location.hash.includes('access_token')) {
                try {
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                } catch(e) {}
            }
            return user;
        } else if (userFallback) {
            const fallbackUser = {
                username: userFallback.user_metadata?.username || sessionStorage.getItem(USER_NAME_KEY) || (userFallback.email ? userFallback.email.split('@')[0] : 'User'),
                email: userFallback.email || sessionStorage.getItem(USER_EMAIL_KEY) || '',
                role: 'user',
                is_admin: false,
                avatar_url: userFallback.user_metadata?.avatar_url || sessionStorage.getItem(USER_AVATAR_KEY) || localStorage.getItem(USER_AVATAR_KEY) || 'avatar_cyber'
            };
            sessionStorage.setItem(USER_ROLE_KEY, 'user');
            sessionStorage.setItem(USER_NAME_KEY, fallbackUser.username);
            sessionStorage.setItem(USER_AVATAR_KEY, fallbackUser.avatar_url);
            if (fallbackUser.email) sessionStorage.setItem(USER_EMAIL_KEY, fallbackUser.email);
            updateNavbarUserState(fallbackUser);
            return fallbackUser;
        }
    } catch (e) {
        if (userFallback) {
            const fallbackUser = {
                username: userFallback.user_metadata?.username || sessionStorage.getItem(USER_NAME_KEY) || 'User',
                email: userFallback.email || sessionStorage.getItem(USER_EMAIL_KEY) || '',
                role: 'user',
                is_admin: false,
                avatar_url: userFallback.user_metadata?.avatar_url || sessionStorage.getItem(USER_AVATAR_KEY) || localStorage.getItem(USER_AVATAR_KEY) || 'avatar_cyber'
            };
            updateNavbarUserState(fallbackUser);
            return fallbackUser;
        }
    }
    return null;
}

// --- Initialize Supabase Client & Catch Sessions / Hash Errors ---
async function initAuthSystem() {
    // 1. Check URL hash for auth redirect errors (e.g. otp_expired)
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        if (params.get('error') || params.get('error_code')) {
            const errDesc = params.get('error_description') || 'Verification link is invalid or has expired.';
            const cleanErr = decodeURIComponent(errDesc).replace(/\+/g, ' ');
            try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch(err) {}
            setTimeout(() => {
                const pendingEmail = sessionStorage.getItem(PENDING_EMAIL_KEY);
                if (pendingEmail) {
                    showOtpView(pendingEmail);
                } else {
                    openLoginModal();
                }
                setModalError(cleanErr + ' Please enter your 6-digit OTP code below.');
            }, 300);
        }
    }

    try {
        const configRes = await fetch(`${API_BASE}/auth/config`);
        const config = await configRes.json();
        
        if (window.supabase && config.supabase_url && config.supabase_anon_key) {
            window.supabaseClient = window.supabase.createClient(config.supabase_url, config.supabase_anon_key);
            
            // Listen for session changes (email link clicks, signups, signouts, refreshes)
            window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
                if (session && session.access_token) {
                    sessionStorage.setItem(USER_TOKEN_KEY, session.access_token);
                    localStorage.setItem(USER_TOKEN_KEY, session.access_token);
                    if (!sessionStorage.getItem(LOGIN_TIME_KEY)) {
                        const nowStr = Date.now().toString();
                        sessionStorage.setItem(LOGIN_TIME_KEY, nowStr);
                        localStorage.setItem(LOGIN_TIME_KEY, nowStr);
                    }
                    const loginTime = parseInt(sessionStorage.getItem(LOGIN_TIME_KEY) || localStorage.getItem(LOGIN_TIME_KEY), 10);
                    const expiryStr = (loginTime + AUTO_LOGOUT_MS).toString();
                    sessionStorage.setItem(USER_EXPIRY_KEY, expiryStr);
                    localStorage.setItem(USER_EXPIRY_KEY, expiryStr);
                    setupAutoSignOut();
                    closeLoginModal();
                    await syncUserSession(session.access_token, session.user);
                } else if (event === 'SIGNED_OUT') {
                    if (!sessionStorage.getItem(SESSION_TOKEN_KEY) && !localStorage.getItem(SESSION_TOKEN_KEY)) {
                        clearAuthSession();
                        updateNavbarUserState(null);
                    }
                }
            });

            // Catch existing session or email confirmation link hash
            const { data: sessionData } = await window.supabaseClient.auth.getSession();
            if (sessionData && sessionData.session) {
                const s = sessionData.session;
                sessionStorage.setItem(USER_TOKEN_KEY, s.access_token);
                localStorage.setItem(USER_TOKEN_KEY, s.access_token);
                if (!sessionStorage.getItem(LOGIN_TIME_KEY)) {
                    const nowStr = Date.now().toString();
                    sessionStorage.setItem(LOGIN_TIME_KEY, nowStr);
                    localStorage.setItem(LOGIN_TIME_KEY, nowStr);
                }
                const loginTime = parseInt(sessionStorage.getItem(LOGIN_TIME_KEY) || localStorage.getItem(LOGIN_TIME_KEY), 10);
                const expiryStr = (loginTime + AUTO_LOGOUT_MS).toString();
                sessionStorage.setItem(USER_EXPIRY_KEY, expiryStr);
                localStorage.setItem(USER_EXPIRY_KEY, expiryStr);
                setupAutoSignOut();
                closeLoginModal();
                await syncUserSession(s.access_token, s.user);
                return;
            }
        } else {
            console.warn('[GameVerse Auth] Supabase config incomplete from server:', config);
        }
    } catch (e) {
        console.warn('Supabase client config unavailable:', e);
    }

    // Verify current stored session
    const token = sessionStorage.getItem(USER_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (token) {
        if (!isLoggedIn()) {
            clearAuthSession();
            updateNavbarUserState(null);
            return;
        }
        setupAutoSignOut();
        const fallback = {
            username: sessionStorage.getItem(USER_NAME_KEY),
            email: sessionStorage.getItem(USER_EMAIL_KEY),
            role: sessionStorage.getItem(USER_ROLE_KEY) || 'user'
        };
        await syncUserSession(token, fallback.username ? fallback : null);
    } else {
        updateNavbarUserState(null);
    }
}

// --- Wire up DOM Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    initAuthSystem();
    setupUsernameValidation();
    checkPendingToasts();
    renderAvatarGrids();

    // Periodic session expiration check (every 15 seconds)
    setInterval(() => {
        const token = sessionStorage.getItem(USER_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY);
        if (token && !isLoggedIn()) {
            console.warn('Session expired. Signing out.');
            sessionStorage.setItem('gv_expired_toast', 'true');
            logoutUser();
        }
    }, 15000);

    const loginModal = document.getElementById('loginModal');
    const loginClose = document.getElementById('loginClose');
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToSignInFromForgot = document.getElementById('backToSignInFromForgot');
    const backToSignInFromOtp = document.getElementById('backToSignInFromOtp');

    // Tab buttons
    if (tabSignIn) tabSignIn.addEventListener('click', () => switchAuthTab('signin'));
    if (tabSignUp) tabSignUp.addEventListener('click', () => switchAuthTab('signup'));

    // Forgot password navigation
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); showForgotView(); });
    if (backToSignInFromForgot) backToSignInFromForgot.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('signin'); });
    if (backToSignInFromOtp) backToSignInFromOtp.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('signin'); });

    // Universal Avatar button click handler (opens User Profile Modal if logged in)
    document.querySelectorAll('#avatarBtn, #loginBtn, .header-avatar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isLoggedIn()) {
                openUserProfileModal();
            } else {
                openLoginModal();
            }
        });
    });

    // Clicking any GameVerse Logo displays Profile Modal if logged in
    document.querySelectorAll('.brand-logo, #globalBrandLogo, .sidebar-brand, #modalNavLogo').forEach(brand => {
        brand.addEventListener('click', (e) => {
            if (isLoggedIn()) {
                e.preventDefault();
                e.stopPropagation();
                openUserProfileModal();
            }
        });
    });

    // Toggle avatar selector when clicking on profile avatar picture or hint
    const avatarTrigger = document.getElementById('profileAvatarTrigger');
    const avatarHint = document.getElementById('avatarChangeHint');

    function toggleAvatarPicker(e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const section = document.getElementById('profileAvatarSection');
        const hint = document.getElementById('avatarChangeHint');
        if (!section) return;
        const isHidden = section.classList.contains('hidden');
        if (isHidden) {
            section.classList.remove('hidden');
            if (hint) hint.textContent = 'Click avatar to close ▴';
            renderAvatarGrids();
        } else {
            section.classList.add('hidden');
            if (hint) hint.textContent = 'Click avatar to change ▾';
        }
    }

    if (avatarTrigger) avatarTrigger.addEventListener('click', toggleAvatarPicker);
    if (avatarHint) avatarHint.addEventListener('click', toggleAvatarPicker);

    // Prevent click events inside modal bodies from bubbling to overlays or background
    document.querySelectorAll('.modal-overlay .modal').forEach(modalEl => {
        modalEl.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Profile modal close and outside click
    const userProfileClose = document.getElementById('userProfileClose');
    if (userProfileClose) {
        userProfileClose.addEventListener('click', closeUserProfileModal);
    }
    const userProfileModal = document.getElementById('userProfileModal');
    if (userProfileModal) {
        userProfileModal.addEventListener('click', (e) => {
            if (e.target === userProfileModal) {
                e.preventDefault();
                e.stopPropagation();
                closeUserProfileModal();
            }
        });
    }

    // Direct Logout handlers (profile modal logout, admin modal logout)
    document.querySelectorAll('#profileModalLogoutBtn, #adminLogoutBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            logoutUser();
        });
    });

    // Close user dropdown on document click
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('userMenuDropdown');
        if (dropdown && !dropdown.classList.contains('hidden') && !e.target.closest('#userMenuDropdown')) {
            dropdown.classList.add('hidden');
        }
    });

    // Close login modal
    if (loginClose) loginClose.addEventListener('click', closeLoginModal);
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                e.preventDefault();
                e.stopPropagation();
                closeLoginModal();
            }
        });
    }

    // Global Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLoginModal();
            closeUserProfileModal();
            const dropdown = document.getElementById('userMenuDropdown');
            if (dropdown) dropdown.classList.add('hidden');
        }
    });

    // Admin login triggers from About modal or buttons
    document.querySelectorAll('.admin-login-btn, #adminLoginBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const aboutModal = document.getElementById('aboutModal');
            if (aboutModal) aboutModal.classList.add('hidden');
            openLoginModal(null, 'signin');
        });
    });

    // Post-Login Clean Redirection to Library (issue 3: always go to library, close any game card modal, strip hash)
    function redirectAfterLogin() {
        try {
            if (typeof unlockBodyScroll === 'function') {
                unlockBodyScroll();
            }
            if (window.closeGameDetail && typeof window.closeGameDetail === 'function') {
                try { window.closeGameDetail(); } catch(e) {}
            }
            if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', window.location.pathname);
            }
        } catch(e) {}

        const isLibraryPage = window.location.pathname.endsWith('library.html') || window.location.href.includes('library.html');
        if (isLibraryPage) {
            window.location.replace('library.html');
        } else {
            window.location.href = 'library.html';
        }
    }
    window.redirectAfterLogin = redirectAfterLogin;

    // --- FORM 1: Login Form (Email OR Username) ---
    // Tries Supabase user auth first (/api/auth/login).
    // If that fails with 401, falls back to legacy admin auth (/api/admin/login)
    // which uses x-www-form-urlencoded (OAuth2PasswordRequestForm).
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearModalMessages();
            const submitBtn = document.getElementById('loginSubmitBtn');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Signing in…'; }

            const identifier = document.getElementById('loginIdentifier')?.value.trim();
            const password = document.getElementById('loginPassword')?.value;
            const rememberMe = Boolean(document.getElementById('loginRememberMe')?.checked);

            if (rememberMe) {
                localStorage.setItem(REMEMBER_ME_KEY, 'true');
            } else {
                localStorage.removeItem(REMEMBER_ME_KEY);
            }

            try {
                // --- Attempt 1: Supabase User Login ---
                const res = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier, password })
                });

                const data = await res.json();

                if (res.status === 400 && data.email_confirmed === false) {
                    const targetEmail = data.email || identifier;
                    sessionStorage.setItem(PENDING_EMAIL_KEY, targetEmail);
                    showOtpView(targetEmail);
                    setModalInfo('Please enter the 6-digit confirmation code sent to your email.');
                    return;
                }

                if (!res.ok) {
                    // --- Attempt 2: Legacy Admin Login Fallback ---
                    // The admin endpoint expects x-www-form-urlencoded with 'username' & 'password'
                    try {
                        const adminFormData = new URLSearchParams();
                        adminFormData.append('username', identifier);
                        adminFormData.append('password', password);

                        const adminRes = await fetch(`${API_BASE}/admin/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: adminFormData
                        });

                        if (adminRes.ok) {
                            const adminData = await adminRes.json();
                            // Legacy admin login succeeded
                            const adminToken = adminData.access_token;
                            sessionStorage.setItem(SESSION_TOKEN_KEY, adminToken);
                            sessionStorage.setItem(USER_TOKEN_KEY, adminToken);
                            localStorage.setItem(SESSION_TOKEN_KEY, adminToken);
                            localStorage.setItem(USER_TOKEN_KEY, adminToken);
                            const now = Date.now();
                            sessionStorage.setItem(LOGIN_TIME_KEY, now.toString());
                            localStorage.setItem(LOGIN_TIME_KEY, now.toString());
                            const duration = getActiveSessionDuration();
                            sessionStorage.setItem(USER_EXPIRY_KEY, (now + duration).toString());
                            localStorage.setItem(USER_EXPIRY_KEY, (now + duration).toString());
                            sessionStorage.setItem(USER_ROLE_KEY, 'admin');
                            sessionStorage.setItem(USER_NAME_KEY, identifier);
                            localStorage.setItem(USER_ROLE_KEY, 'admin');
                            localStorage.setItem(USER_NAME_KEY, identifier);
                            setupAutoSignOut();

                            const adminUser = { username: identifier, role: 'admin', email: null, avatar_url: null };
                            sessionStorage.setItem('gv_welcome_toast', identifier);
                            closeLoginModal();
                            showAdminControls();
                            updateNavbarUserState(adminUser);
                            redirectAfterLogin();
                            return;
                        }
                    } catch (adminErr) {
                        console.warn('Legacy admin login fallback failed:', adminErr);
                    }

                    // Both login paths failed
                    throw new Error(data.detail || 'Invalid credentials');
                }

                // --- Supabase user login succeeded ---
                if (window.supabaseClient && data.access_token && data.refresh_token) {
                    try {
                        await window.supabaseClient.auth.setSession({
                            access_token: data.access_token,
                            refresh_token: data.refresh_token
                        });
                    } catch (err) {
                        console.warn('Supabase setSession error:', err);
                    }
                }

                sessionStorage.setItem(USER_TOKEN_KEY, data.access_token);
                if (rememberMe) {
                    localStorage.setItem(USER_TOKEN_KEY, data.access_token);
                }
                const now = Date.now();
                sessionStorage.setItem(LOGIN_TIME_KEY, now.toString());
                localStorage.setItem(LOGIN_TIME_KEY, now.toString());
                const duration = getActiveSessionDuration();
                sessionStorage.setItem(USER_EXPIRY_KEY, (now + duration).toString());
                localStorage.setItem(USER_EXPIRY_KEY, (now + duration).toString());
                setupAutoSignOut();
                if (data.user) {
                    sessionStorage.setItem(USER_ROLE_KEY, data.user.role || 'user');
                    sessionStorage.setItem(USER_NAME_KEY, data.user.username || identifier);
                    if (data.user.email) sessionStorage.setItem(USER_EMAIL_KEY, data.user.email);
                    if (data.user.avatar_url) {
                        sessionStorage.setItem(USER_AVATAR_KEY, data.user.avatar_url);
                        localStorage.setItem(USER_AVATAR_KEY, data.user.avatar_url);
                    }
                    localStorage.setItem(USER_ROLE_KEY, data.user.role || 'user');
                    localStorage.setItem(USER_NAME_KEY, data.user.username || identifier);
                    if (data.user.email) localStorage.setItem(USER_EMAIL_KEY, data.user.email);
                }

                sessionStorage.setItem('gv_welcome_toast', data.user?.username || identifier);
                closeLoginModal();
                updateNavbarUserState(data.user);
                redirectAfterLogin();
            } catch (err) {
                setModalError(err.message || 'Invalid credentials');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
            }
        });
    }

    // --- FORM 2: Sign Up Form ---
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearModalMessages();

            const username = document.getElementById('signUpUsername')?.value.trim();
            const email = document.getElementById('signUpEmail')?.value.trim();
            const password = document.getElementById('signUpPassword')?.value;
            const chosenAvatar = document.getElementById('signUpSelectedAvatar')?.value || 'avatar_cyber';
            const submitBtn = document.getElementById('signUpSubmitBtn');

            if (!/^[A-Za-z]{4,20}$/.test(username)) {
                setModalError('Username must be 4–20 characters and contain letters only.');
                return;
            }

            if (!window.supabaseClient) {
                setModalError('Authentication service not connected. Please verify SUPABASE_URL and SUPABASE_ANON_KEY in Vercel settings.');
                return;
            }

            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating account…'; }

            try {
                sessionStorage.setItem(PENDING_EMAIL_KEY, email);
                sessionStorage.setItem(USER_AVATAR_KEY, chosenAvatar);
                localStorage.setItem(USER_AVATAR_KEY, chosenAvatar);

                const { data, error } = await window.supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { 
                            username,
                            avatar_url: chosenAvatar 
                        }
                    }
                });

                if (error) {
                    if (error.message.includes('username_reserved')) {
                        throw new Error('This username is reserved. Please pick another.');
                    }
                    if (error.message.includes('unique') || error.message.includes('duplicate')) {
                        throw new Error('That username or email is already registered.');
                    }
                    if (error.message.includes('Database error') || error.message.includes('database error')) {
                        throw new Error('That username may have just been taken or is invalid. Please try another.');
                    }
                    throw error;
                }

                if (data.session) {
                    sessionStorage.setItem(USER_TOKEN_KEY, data.session.access_token);
                    localStorage.setItem(USER_TOKEN_KEY, data.session.access_token);
                    const now = Date.now();
                    sessionStorage.setItem(LOGIN_TIME_KEY, now.toString());
                    localStorage.setItem(LOGIN_TIME_KEY, now.toString());
                    const duration = getActiveSessionDuration();
                    sessionStorage.setItem(USER_EXPIRY_KEY, (now + duration).toString());
                    localStorage.setItem(USER_EXPIRY_KEY, (now + duration).toString());
                    sessionStorage.setItem(USER_ROLE_KEY, 'user');
                    sessionStorage.setItem(USER_NAME_KEY, username);
                    sessionStorage.setItem(USER_EMAIL_KEY, email);
                    sessionStorage.setItem(USER_AVATAR_KEY, chosenAvatar);
                    localStorage.setItem(USER_AVATAR_KEY, chosenAvatar);
                    sessionStorage.setItem('gv_welcome_toast', username);
                    setupAutoSignOut();
                    closeLoginModal();
                    redirectAfterLogin();
                } else {
                    showOtpView(email);
                    setModalInfo('Account created! Please enter the 6-digit code sent to your email.');
                }
            } catch (err) {
                setModalError(err.message || 'Signup failed. Please try again.');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
            }
        });
    }

    // --- FORM 3: OTP Verification Form ---
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearModalMessages();

            let email = document.getElementById('otpTargetEmail')?.textContent.trim();
            if (!email || email === 'your email') {
                email = sessionStorage.getItem(PENDING_EMAIL_KEY);
            }

            const token = document.getElementById('otpCode')?.value.trim();

            if (!window.supabaseClient) {
                setModalError('Authentication service not connected. Please verify SUPABASE_URL and SUPABASE_ANON_KEY in Vercel settings.');
                return;
            }

            if (!email) {
                setModalError('Email address is missing. Please switch to Sign Up or Sign In.');
                return;
            }

            if (!token || token.length < 6) {
                setModalError('Please enter the 6-digit verification code.');
                return;
            }

            const submitBtn = otpForm.querySelector('button[type="submit"]');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Verifying…'; }

            try {
                let res = await window.supabaseClient.auth.verifyOtp({
                    email,
                    token,
                    type: 'signup'
                });

                if (res.error) {
                    // Fallback to type: 'email' if signup type failed
                    res = await window.supabaseClient.auth.verifyOtp({
                        email,
                        token,
                        type: 'email'
                    });
                }

                if (res.error) throw res.error;

                if (res.data && res.data.session) {
                    const s = res.data.session;
                    sessionStorage.setItem(USER_TOKEN_KEY, s.access_token);
                    const now = Date.now();
                    sessionStorage.setItem(LOGIN_TIME_KEY, now.toString());
                    sessionStorage.setItem(USER_EXPIRY_KEY, (now + AUTO_LOGOUT_MS).toString());
                    sessionStorage.setItem(USER_ROLE_KEY, 'user');
                    if (s.user?.email) sessionStorage.setItem(USER_EMAIL_KEY, s.user.email);
                    if (s.user?.user_metadata?.username) sessionStorage.setItem(USER_NAME_KEY, s.user.user_metadata.username);
                    closeLoginModal();
                    await syncUserSession(s.access_token, s.user);
                    redirectAfterLogin();
                } else {
                    switchAuthTab('signin');
                    setModalInfo('Email verified successfully! You can now sign in.');
                }
            } catch (err) {
                setModalError(err.message || 'Invalid or expired verification code.');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Verify Code'; }
            }
        });
    }

    // Resend OTP button
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            clearModalMessages();
            let email = document.getElementById('otpTargetEmail')?.textContent.trim();
            if (!email || email === 'your email') {
                email = sessionStorage.getItem(PENDING_EMAIL_KEY);
            }
            if (!email || !window.supabaseClient) return;

            try {
                const { error } = await window.supabaseClient.auth.resend({
                    type: 'signup',
                    email
                });
                if (error) throw error;
                setModalInfo('A new verification code has been sent to your email.');
            } catch (err) {
                setModalError(err.message || 'Could not resend code. Please try again later.');
            }
        });
    }

    // --- FORM 4: Forgot Password Form ---
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearModalMessages();

            const identifier = document.getElementById('forgotIdentifier')?.value.trim();
            if (!identifier) return;

            try {
                const res = await fetch(`${API_BASE}/auth/forgot`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier })
                });
                const data = await res.json();
                setModalInfo(data.message || 'If an account exists, a reset link has been sent.');
            } catch (err) {
                setModalInfo('If an account exists, a reset link has been sent.');
            }
        });
    }
});


window.openUserProfileModal = openUserProfileModal;
window.closeUserProfileModal = closeUserProfileModal;
window.logoutUser = logoutUser;
