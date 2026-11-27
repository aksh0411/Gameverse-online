function openProfileOrLogin(e) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
        if (typeof openUserProfileModal === 'function') openUserProfileModal();
    } else if (typeof openLoginModal === 'function') {
        openLoginModal();
    }
}

function triggerCollectionTransition(e) {
    e.preventDefault();
    if (document.getElementById('pageTransitionOverlay')) return;

    const accent = '#ffb074';
    const overlay = document.createElement('div');
    overlay.id = 'pageTransitionOverlay';
    overlay.className = 'transition-overlay';
    overlay.style.background = `radial-gradient(circle at 50% 50%, ${accent}25 0%, rgba(20, 11, 18, 0.92) 60%, rgba(20, 11, 18, 0.98) 100%)`;

    const radialGlow = document.createElement('div');
    radialGlow.className = 'transition-radial-glow';
    radialGlow.style.background = `radial-gradient(circle, ${accent}35 0%, transparent 70%)`;
    overlay.appendChild(radialGlow);

    const panel = document.createElement('div');
    panel.className = 'transition-expanding-panel glass-panel';
    panel.style.background = `linear-gradient(135deg, ${accent}20, rgba(20, 11, 18, 0.96))`;
    panel.style.borderColor = `${accent}40`;
    panel.style.boxShadow = `0 0 60px ${accent}35, 0 25px 60px rgba(0, 0, 0, 0.85)`;

    const textWrap = document.createElement('div');
    textWrap.className = 'transition-title-wrap';
    textWrap.innerHTML = `
        <span style="font-family: var(--font-heading); font-size: 0.85rem; letter-spacing: 6px; color: ${accent}; text-transform: uppercase; margin-bottom: 8px; text-shadow: 0 0 16px ${accent}; font-weight: 600;">ENTERING</span>
        <h1 style="font-family: var(--font-heading); font-size: clamp(2rem, 5.5vw, 4rem); font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin: 0; text-shadow: 0 0 35px ${accent}80, 0 4px 20px rgba(0,0,0,0.9); line-height: 1.1;">The Collection</h1>
    `;
    panel.appendChild(textWrap);

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'transition-particles-container';
    panel.appendChild(particlesContainer);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            panel.classList.add('expanded');
        });
    });

    setTimeout(() => {
        textWrap.classList.add('visible');
        const numParticles = 12;
        for (let i = 0; i < numParticles; i++) {
            const dot = document.createElement('div');
            dot.className = 'transition-particle-dot';
            dot.style.background = accent;
            dot.style.boxShadow = `0 0 10px ${accent}, 0 0 20px ${accent}`;
            const angle = (i / numParticles) * Math.PI * 2;
            const distance = 160 + (i % 3) * 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            particlesContainer.appendChild(dot);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    dot.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.3)`;
                    dot.style.opacity = '0';
                });
            });
        }
    }, 500);

    setTimeout(() => {
        overlay.style.opacity = '0';
        window.location.href = 'library.html';
    }, 1000);
}

function initHeroPage() {
    window.refreshStats = async function() {};

    if (typeof window.initHeroScene === 'function') {
        requestAnimationFrame(() => window.initHeroScene());
    }

    ['avatarBtn', 'modalNavProfile'].forEach((id) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', openProfileOrLogin);
    });

    const exploreBtn = document.getElementById('exploreCollectionBtn');
    if (exploreBtn) exploreBtn.addEventListener('click', triggerCollectionTransition);
}

document.addEventListener('DOMContentLoaded', initHeroPage);
