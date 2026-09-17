// ===== GAMEVERSE Card System & Poster Components =====

const statusLabels = {
    not_started: 'Not Started',
    playing: 'Playing',
    play_later: 'Play Later',
    completed: 'Completed',
    wont_play: "Won't Play"
};

const statusColors = {
    not_started: '#7d6ca8',
    playing: '#c66a93',
    play_later: '#9c52cf',
    completed: '#7a96bc',
    wont_play: '#6b2d4b'
};

// 1. Vertical 2:3 Poster Card for "My Collection" Carousel
function renderPosterCard(game) {
    const card = document.createElement('a');
    const gameId = game.id || game.game_id;
    const gameName = game.name || game.game_name || 'Untitled Game';
    const rawImg = game.cover_image;
    const imgUrl = typeof getImageUrl === 'function' ? getImageUrl(rawImg) : rawImg;

    card.className = 'poster-card';
    card.href = `game.html?id=${gameId}`;
    card.dataset.gameId = gameId;

    const imgElement = imgUrl 
        ? `<img class="poster-img" src="${imgUrl}" alt="${gameName}" loading="lazy" decoding="async" onerror="if(!this.dataset.retry){this.dataset.retry='1';this.src='/static/images/'+(this.src.split('/').pop());}else if(this.dataset.retry==='1'){this.dataset.retry='2';this.src='/frontend/static/images/'+(this.src.split('/').pop());}else{this.outerHTML='<div class=poster-placeholder><span>🎮</span></div>';}">`
        : `<div class="poster-placeholder"><span>🎮</span></div>`;

    card.innerHTML = `
        ${imgElement}
        <div class="poster-gradient-bottom"></div>
        <div class="poster-title-bar">
            <div class="poster-title" title="${gameName}">${gameName}</div>
        </div>
    `;

    // Click navigation with smooth shared-element transition
    card.addEventListener('click', (e) => {
        if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
            if (typeof window.openGameDetail === 'function') {
                e.preventDefault();
                window.openGameDetail(card, game);
                return;
            }
        }
        window.location.href = `game.html?id=${gameId}`;
    });

    // Hover sync with 4D Collection Core
    card.addEventListener('mouseenter', () => {
        window.dispatchEvent(new CustomEvent('gameNodeHover', { detail: { gameId } }));
    });
    card.addEventListener('mouseleave', () => {
        window.dispatchEvent(new CustomEvent('gameNodeHover', { detail: { gameId: null } }));
    });

    return card;
}

// 2. Standard 3D Perspective Card (for Favorites & Currently Playing grids)
function renderGameCard(game, index = 0) {
    const card = document.createElement('div');
    card.className = 'game-card';
    const gameId = game.id || game.game_id;
    const gameName = game.name || game.game_name || 'Untitled Game';
    card.dataset.gameId = gameId;
    
    const playStatus = (game.play_status || 'not_started').toLowerCase();
    const color = statusColors[playStatus] || statusColors.not_started;
    const label = statusLabels[playStatus] || statusLabels.not_started;
    const rawImg = game.cover_image;
    const imgUrl = typeof getImageUrl === 'function' ? getImageUrl(rawImg) : rawImg;
    const isBookmarked = (game.is_bookmarked || game.bookmarked) ? 'active' : '';
    
    const baseRotateY = ((index % 3) - 1) * 1.5;
    const baseRotateX = (index % 2) * 1;
    card.style.transform = `perspective(1000px) rotateY(${baseRotateY}deg) rotateX(${baseRotateX}deg)`;

    const imageContent = imgUrl 
        ? `<img src="${imgUrl}" alt="${gameName}" loading="lazy" decoding="async" onerror="if(!this.dataset.retry){this.dataset.retry='1';this.src='/static/images/'+(this.src.split('/').pop());}else if(this.dataset.retry==='1'){this.dataset.retry='2';this.src='/frontend/static/images/'+(this.src.split('/').pop());}else{this.parentElement.innerHTML='<div class=card-image-placeholder>🎮</div>';}">`
        : `<div class="card-image-placeholder">🎮</div>`;

    card.innerHTML = `
        <div class="card-status"><span class="status-dot" style="background:${color}; box-shadow: 0 0 6px ${color}"></span>${label}</div>
        <div class="card-image" style="background: radial-gradient(circle at 50% 50%, ${color}20, transparent 70%)">
            ${imageContent}
        </div>
        <div class="card-info">
            <h3 class="card-title">${gameName}</h3>
            <p class="card-desc">${game.description || 'No description available.'}</p>
        </div>
        <div class="card-actions">
            <a href="game.html?id=${gameId}" class="btn-sm">
                <span>Open</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <button class="bookmark-toggle ${isBookmarked}" data-game-id="${gameId}" title="${isBookmarked ? 'Bookmarked in 4D Core' : 'Bookmark to 4D Core'}" aria-label="Bookmark">
                <svg class="bookmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>
        </div>
    `;

    // 3D Tilt on Mouse Move
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(20px) scale(1.03)`;
        card.style.transition = 'transform 0.1s ease-out';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateY(${baseRotateY}deg) rotateX(${baseRotateX}deg)`;
        card.style.transition = 'transform 0.4s ease-out';
        window.dispatchEvent(new CustomEvent('gameNodeHover', { detail: { gameId: null } }));
    });

    card.addEventListener('mouseenter', () => {
        window.dispatchEvent(new CustomEvent('gameNodeHover', { detail: { gameId } }));
    });

    // Reactive Bookmark Toggle
    const bookmarkBtn = card.querySelector('.bookmark-toggle');
    bookmarkBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Only admin can bookmark/unbookmark
        if (typeof requireAdmin === 'function' && !requireAdmin('bookmark or unbookmark games')) {
            return;
        } else if (typeof isAdmin === 'function' && !isAdmin()) {
            if (typeof openLoginModal === 'function') {
                openLoginModal('Admin login required to bookmark games.');
            } else {
                alert('Admin login required to bookmark games.');
            }
            return;
        }

        const gid = game.id || game.game_id;
        const current = bookmarkBtn.classList.contains('active');
        const nextState = !current;
        
        // Immediate local state update
        game.is_bookmarked = nextState;
        game.bookmarked = nextState;
        bookmarkBtn.classList.toggle('active', nextState);
        bookmarkBtn.title = nextState ? 'Bookmarked in 4D Core' : 'Bookmark to 4D Core';

        // Reactively update 4D Collection Core immediately without page refresh
        if (typeof window.updateCollectionCore === 'function' && window.__ALL_GAMES__) {
            window.updateCollectionCore(window.__ALL_GAMES__);
        }
        if (typeof window.refreshStats === 'function') {
            window.refreshStats();
        }

        // Persist to backend if available
        try {
            if (typeof apiPatch === 'function') {
                await apiPatch(`/games/${gid}/status`, { is_bookmarked: nextState });
            }
        } catch (err) {
            console.error('Error toggling bookmark on backend:', err);
            // Revert local state on error
            game.is_bookmarked = current;
            game.bookmarked = current;
            bookmarkBtn.classList.toggle('active', current);
            bookmarkBtn.title = current ? 'Bookmarked in 4D Core' : 'Bookmark to 4D Core';
            if (typeof window.updateCollectionCore === 'function' && window.__ALL_GAMES__) {
                window.updateCollectionCore(window.__ALL_GAMES__);
            }
            if (typeof window.refreshStats === 'function') {
                window.refreshStats();
            }
        }
    });

    // Make whole card clickable to open game detail page with smooth shared-element transition
    card.addEventListener('click', (e) => {
        // If clicking bookmark button or its children, prevent navigation
        if (e.target.closest('.bookmark-toggle')) {
            return;
        }
        if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
            if (typeof window.openGameDetail === 'function') {
                e.preventDefault();
                window.openGameDetail(card, game);
                return;
            }
        }
        window.location.href = `game.html?id=${gameId}`;
    });

    return card;
}

function renderGameGrid(games, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    if (games.length === 0) {
        container.innerHTML = '<p style="color: rgba(212, 204, 239, 0.5); font-size: 0.95rem;">No games found in this category.</p>';
        return;
    }
    
    const frag = document.createDocumentFragment();
    games.forEach((game, index) => {
        frag.appendChild(renderGameCard(game, index));
    });
    container.appendChild(frag);
}
