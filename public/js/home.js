document.addEventListener('DOMContentLoaded', async () => {
    // Stats strip was replaced by the WarpText statement — keep a no-op shim
    // because bookmark/status handlers in shared code call window.refreshStats().
    window.refreshStats = async function() {};

    // 1. Defer Hero 3D init by one frame so headline + button paint first (FCP)
    if (typeof window.initHeroScene === 'function') {
        requestAnimationFrame(() => {
            window.initHeroScene();
        });
    }

    // 2. Fetch lightweight stats — show cached value instantly, update in background
    try {
        // Show cached count immediately so the warp text doesn't wait for network
        const cached = localStorage.getItem('gv_stats_cache');
        let total = 200; // fallback default
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                total = parsed.total_games || total;
            } catch (_) {}
        }
        if (window.__heroWarpText) {
            window.__heroWarpText.setText(`Explore ${total}+ Games`);
        }

        // Fetch fresh stats in background and update
        const stats = await apiGet('/stats').catch(() => null);
        if (stats && stats.total_games) {
            localStorage.setItem('gv_stats_cache', JSON.stringify(stats));
            if (stats.total_games !== total && window.__heroWarpText) {
                window.__heroWarpText.setText(`Explore ${stats.total_games}+ Games`);
            }
        }
    } catch (err) {
        console.error("Error loading home stats:", err);
    }

    // 4. Avatar Navigation (Open About Me Modal)
    const avatarBtn = document.getElementById('avatarBtn');
    if (avatarBtn) {
        avatarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const aboutModal = document.getElementById('aboutModal');
            if (aboutModal) {
                aboutModal.classList.remove('hidden');
                const inner = aboutModal.querySelector('.about-modal-inner');
                if (inner) inner.scrollTop = 0;
            }
        });
    }

    // Profile icon inside the game detail modal navbar — opens the About window (same as header avatar)
    const modalNavProfile = document.getElementById('modalNavProfile');
    if (modalNavProfile) {
        modalNavProfile.addEventListener('click', () => {
            const aboutModal = document.getElementById('aboutModal');
            if (aboutModal) {
                aboutModal.classList.remove('hidden');
                const inner = aboutModal.querySelector('.about-modal-inner');
                if (inner) inner.scrollTop = 0;
            }
        });
    }

    // 5. Explore Collection — cinematic expanding-panel transition into library.html
    // (mirrors the shared-element transition phases: expand 0-500ms, hold 500-800ms, fade 800ms+)
    const exploreBtn = document.getElementById('exploreCollectionBtn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (document.getElementById('pageTransitionOverlay')) return;

            const accent = '#00f5d4';
            const overlay = document.createElement('div');
            overlay.id = 'pageTransitionOverlay';
            overlay.className = 'transition-overlay';
            overlay.style.background = `radial-gradient(circle at 50% 50%, ${accent}25 0%, rgba(2, 11, 16, 0.9) 60%, rgba(2, 11, 16, 0.98) 100%)`;

            const radialGlow = document.createElement('div');
            radialGlow.className = 'transition-radial-glow';
            radialGlow.style.background = `radial-gradient(circle, ${accent}35 0%, transparent 70%)`;
            overlay.appendChild(radialGlow);

            const panel = document.createElement('div');
            panel.className = 'transition-expanding-panel glass-panel';
            panel.style.background = `linear-gradient(135deg, ${accent}20, rgba(7, 5, 10, 0.95))`;
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

            // Phase 1: expand the panel to full screen
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    panel.classList.add('expanded');
                });
            });

            // Phase 2: reveal title + particle burst
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

            // Phase 3: hand off to the library page mid-fade so the arrival feels seamless
            setTimeout(() => {
                overlay.style.opacity = '0';
                window.location.href = 'library.html';
            }, 1000);
        });
    }
});
