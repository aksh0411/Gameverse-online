document.addEventListener('DOMContentLoaded', async () => {
    window.refreshStats = async function() {
        const statsContainer = document.getElementById('statsContainer');
        if (!statsContainer) return;
        const stats = await apiGet('/stats').catch(() => null);
        let total = 0, playing = 0, completed = 0, bookmarked = 0;
        
        if (stats) {
            total = stats.total_games || 0;
            playing = stats.playing || 0;
            completed = stats.completed || 0;
            bookmarked = stats.bookmarked || 0;
        } else if (window.__ALL_GAMES__) {
            const games = window.__ALL_GAMES__;
            total = games.length;
            playing = games.filter(g => (g.play_status || '').toLowerCase() === 'playing').length;
            completed = games.filter(g => (g.play_status || '').toLowerCase() === 'completed').length;
            bookmarked = games.filter(g => g.is_bookmarked).length;
        }

        const pad = (n) => String(n).padStart(2, '0');
        statsContainer.innerHTML = `
            <div class="stat-item"><span class="num">${pad(total)}</span><span class="label">GAMES</span></div>
            <div class="stat-item"><span class="num">${pad(playing)}</span><span class="label">PLAYING</span></div>
            <div class="stat-item"><span class="num">${pad(completed)}</span><span class="label">COMPLETED</span></div>
            <div class="stat-item"><span class="num">${pad(bookmarked)}</span><span class="label">BOOKMARKED</span></div>
        `;
    };

    window.refreshGrids = function() {
        if (!window.__ALL_GAMES__) return;
        const favorited = window.__ALL_GAMES__.filter(g => g.is_favorited);
        renderGameGrid(favorited, 'favoritesGrid');
        const playing = window.__ALL_GAMES__.filter(g => (g.play_status || '').toLowerCase() === 'playing');
        renderGameGrid(playing, 'playingGrid');
    };

    // 1. Immediately initialize Hero 3D background without waiting for network
    if (typeof window.initHeroScene === 'function') {
        window.initHeroScene();
    }

    // 2. Fetch Stats & Games concurrently with Promise.all
    try {
        const [statsResult, gamesResult] = await Promise.all([
            window.refreshStats(),
            apiGet('/games?limit=100').catch(() => ({ games: [] }))
        ]);

        const games = Array.isArray(gamesResult) ? gamesResult : (gamesResult.games || []);
        window.__ALL_GAMES__ = games;

        // Populate "My Collection" Full Library Poster Carousel using DocumentFragment
        const carousel = document.getElementById('collectionCarousel');
        if (carousel) {
            carousel.innerHTML = '';
            const frag = document.createDocumentFragment();
            games.forEach((game, index) => {
                if (typeof renderPosterCard === 'function') {
                    frag.appendChild(renderPosterCard(game, index));
                } else {
                    frag.appendChild(renderGameCard(game, index));
                }
            });
            carousel.appendChild(frag);
        }

        // Populate Favorites and Currently Playing Grids
        window.refreshGrids();

        // Initialize 3D Dimensional Radar Core with Bookmarked Games
        if (typeof initCollectionCore === 'function') {
            initCollectionCore(games);
        }
    } catch (err) {
        console.error("Error loading home data:", err);
    }

    // 3. Carousel Navigation (< and > Buttons)
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    const carousel = document.getElementById('collectionCarousel');
    
    if (carouselPrev && carouselNext && carousel) {
        const scrollAmount = 430; // 2 poster cards width + gap
        carouselPrev.addEventListener('click', () => {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        carouselNext.addEventListener('click', () => {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
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
