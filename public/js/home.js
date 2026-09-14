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
            games.forEach((game) => {
                if (typeof renderPosterCard === 'function') {
                    frag.appendChild(renderPosterCard(game));
                } else {
                    frag.appendChild(renderGameCard(game));
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
});
