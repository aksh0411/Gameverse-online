function isAdmin() {
    return !!localStorage.getItem('admin_token');
}

function openLoginModal(message) {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
        const loginError = document.getElementById('loginError');
        if (loginError) {
            if (message) {
                loginError.textContent = message;
                loginError.classList.remove('hidden');
                loginError.style.color = '#e879f9';
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

function showAdminControls() {
    document.querySelectorAll('.admin-login-btn, #adminLoginBtn').forEach(b => b.classList.add('hidden'));
    document.querySelectorAll('.admin-logout-btn, #adminLogoutBtn').forEach(b => b.classList.remove('hidden'));
    const addGameFab = document.getElementById('addGameFab');
    const adminMenu = document.getElementById('adminMenu');

    if (addGameFab) addGameFab.classList.remove('hidden');
    if (adminMenu) adminMenu.classList.remove('hidden');
}

function hideAdminControls() {
    document.querySelectorAll('.admin-login-btn, #adminLoginBtn').forEach(b => b.classList.remove('hidden'));
    document.querySelectorAll('.admin-logout-btn, #adminLogoutBtn').forEach(b => b.classList.add('hidden'));
    const addGameFab = document.getElementById('addGameFab');
    const adminMenu = document.getElementById('adminMenu');

    if (addGameFab) addGameFab.classList.add('hidden');
    if (adminMenu) adminMenu.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    if (isAdmin()) {
        showAdminControls();
    } else {
        hideAdminControls();
    }

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
                localStorage.removeItem('admin_token');
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
            
            // Expected that the backend accepts form data or json. Let's send json here as per usual setup, 
            // but OAuth2 password bearer expects form data. Assuming simple post.
            try {
                // If backend expects x-www-form-urlencoded
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
                localStorage.setItem('admin_token', result.access_token);
                
                loginModal.classList.add('hidden');
                showAdminControls();
                loginForm.reset();
                loginError.classList.add('hidden');
                
                // Optionally refresh page to load admin tools
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
            localStorage.removeItem('admin_token');
            hideAdminControls();
            window.location.reload();
        });
    }
});
