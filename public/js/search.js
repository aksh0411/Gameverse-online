// ===== GAMEVERSE Spotlight Search & Quick Filters Controller =====

document.addEventListener('DOMContentLoaded', () => {
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const searchResults = document.getElementById('searchResults');
    const quickFilterBtn = document.getElementById('quickFilterBtn');
    const quickFilterMenu = document.getElementById('quickFilterMenu');

    // 1. Open Spotlight Search
    function openSearch() {
        if (!searchOverlay || !searchInput) return;
        searchOverlay.classList.remove('hidden');
        searchInput.value = '';
        searchInput.focus();
        if (searchResults) {
            searchResults.innerHTML = '<div style="padding:16px; color:rgba(212,204,239,0.4); text-align:center; font-size:0.9rem;">Type to search titles, genres, or platforms...</div>';
            searchResults.classList.remove('hidden');
        }
    }

    // 2. Close Spotlight Search
    function closeSearch() {
        if (!searchOverlay) return;
        searchOverlay.classList.add('hidden');
    }

    if (searchToggle) searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        openSearch();
    });

    if (searchClose) searchClose.addEventListener('click', closeSearch);

    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) closeSearch();
        });
    }

    // 3. Global Keyboard Shortcuts (/ and Ctrl+K to open, Escape to close)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSearch();
            if (quickFilterMenu) quickFilterMenu.classList.add('hidden');
        }
        if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            openSearch();
        }
    });

    // 4. Quick Filter Dropdown Toggle
    if (quickFilterBtn && quickFilterMenu) {
        quickFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            quickFilterMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', () => {
            quickFilterMenu.classList.add('hidden');
        });
    }

    // 5. Debounced Live Search API Query
    let debounceTimer;
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = searchInput.value.trim();

            if (query.length === 0) {
                searchResults.innerHTML = '<div style="padding:16px; color:rgba(212,204,239,0.4); text-align:center; font-size:0.9rem;">Type to search titles, genres, or platforms...</div>';
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    let games = [];
                    try {
                        const res = await apiGet(`/games?search=${encodeURIComponent(query)}`);
                        games = Array.isArray(res) ? res : (res.games || []);
                    } catch (apiErr) {
                        if (window.__ALL_GAMES__ && Array.isArray(window.__ALL_GAMES__)) {
                            const q = query.toLowerCase();
                            games = window.__ALL_GAMES__.filter(g => {
                                const name = (g.name || g.game_name || '').toLowerCase();
                                const genres = (g.genres || []).map(x => (typeof x === 'object' ? x.genre_name : x).toLowerCase()).join(' ');
                                const platforms = (g.platforms || []).map(x => (typeof x === 'object' ? x.platform_name : x).toLowerCase()).join(' ');
                                return name.includes(q) || genres.includes(q) || platforms.includes(q);
                            });
                        }
                    }
                    searchResults.innerHTML = '';

                    if (games.length === 0) {
                        searchResults.innerHTML = '<div style="padding:20px; color:rgba(212,204,239,0.5); text-align:center; font-size:0.9rem;">No matching worlds found.</div>';
                    } else {
                        games.slice(0, 7).forEach(game => {
                            const item = document.createElement('div');
                            item.className = 'spotlight-result-item';

                            const gameId = game.id || game.game_id;
                            const gameName = game.name || game.game_name || 'Untitled';
                            const rawImg = game.cover_image;
                            const imgUrl = typeof getImageUrl === 'function' ? getImageUrl(rawImg) : rawImg;
                            const playStatus = (game.play_status || 'not_started').replace('_', ' ').toUpperCase();
                            const genres = (game.genres || []).map(g => typeof g === 'object' ? g.genre_name : g).slice(0, 2).join(', ') || 'Game';

                            const poster = imgUrl 
                                ? `<img class="spotlight-item-poster" src="${imgUrl}" alt="${gameName}" onerror="if(!this.dataset.retry){this.dataset.retry='1';this.src='/static/images/'+(this.src.split('/').pop());}else if(this.dataset.retry==='1'){this.dataset.retry='2';this.src='/frontend/static/images/'+(this.src.split('/').pop());}else{this.outerHTML='<div class=spotlight-item-poster style=display:flex;align-items:center;justify-content:center;color:#666>🎮</div>';}">`
                                : `<div class="spotlight-item-poster" style="display:flex;align-items:center;justify-content:center;color:#888;">🎮</div>`;

                            item.innerHTML = `
                                ${poster}
                                <div class="spotlight-item-info">
                                    <span class="spotlight-item-title">${gameName}</span>
                                    <span class="spotlight-item-meta">${genres} · <span style="color:#c66a93">${playStatus}</span></span>
                                </div>
                                <span style="color:rgba(212,204,239,0.4); font-size:0.8rem;">↵</span>
                            `;

                            item.addEventListener('click', () => {
                                closeSearch();
                                if (typeof window.openGameDetail === 'function') {
                                    window.openGameDetail(null, game);
                                } else {
                                    window.location.href = `game.html?id=${gameId}`;
                                }
                            });

                            searchResults.appendChild(item);
                        });
                    }
                    searchResults.classList.remove('hidden');
                } catch (err) {
                    console.error("Search failed", err);
                }
            }, 250);
        });
    }
});
