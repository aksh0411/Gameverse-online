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
    let currentSearchResults = [];
    let selectedResultIndex = -1;

    function updateResultHighlight() {
        if (!searchResults) return;
        const items = searchResults.querySelectorAll('.spotlight-result-item');
        items.forEach((it, idx) => {
            it.classList.toggle('selected', idx === selectedResultIndex);
        });
    }

    function selectSpotlightGame(game) {
        closeSearch();
        const gameId = game.id || game.game_id;
        if (typeof window.openGameDetail === 'function') {
            window.openGameDetail(null, game);
        } else {
            window.location.href = `library.html?game=${gameId}`;
        }
    }

    function openSearch() {
        if (!searchOverlay || !searchInput) return;
        currentSearchResults = [];
        selectedResultIndex = -1;
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

    // Exposed so other controls (library topbar, game detail modal navbar) can open the spotlight
    window.openSpotlightSearch = openSearch;

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
                        currentSearchResults = [];
                        selectedResultIndex = -1;
                        searchResults.innerHTML = '<div style="padding:20px; color:rgba(212,204,239,0.5); text-align:center; font-size:0.9rem;">No matching worlds found.</div>';
                    } else {
                        currentSearchResults = games.slice(0, 7);
                        selectedResultIndex = 0; // Pre-select first result for immediate Enter key opening

                        currentSearchResults.forEach((game, idx) => {
                            const item = document.createElement('div');
                            item.className = 'spotlight-result-item' + (idx === selectedResultIndex ? ' selected' : '');

                            const gameId = game.id || game.game_id;
                            const gameName = game.name || game.game_name || 'Untitled';
                            const rawImg = game.cover_image;
                            const imgUrl = typeof getImageUrl === 'function' ? getImageUrl(rawImg) : rawImg;
                            const playStatus = (game.play_status || 'not_started').replace('_', ' ').toUpperCase();
                            const genres = (game.genres || []).map(g => typeof g === 'object' ? g.genre_name : g).slice(0, 2).join(', ') || 'Game';

                            const fallbackPoster = '<div class="spotlight-item-poster" style="display:flex;align-items:center;justify-content:center;color:#fbbf24;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4M15 11h.01M18 13h.01"/></svg></div>';
                            const poster = imgUrl
                                ? `<img class="spotlight-item-poster" src="${escHtml(imgUrl)}" alt="${escHtml(gameName)}" loading="lazy" decoding="async">`
                                : fallbackPoster;

                            item.innerHTML = `
                                ${poster}
                                <div class="spotlight-item-info">
                                    <span class="spotlight-item-title">${escHtml(gameName)}</span>
                                    <span class="spotlight-item-meta">${escHtml(genres)} · <span style="color:#ffb074">${playStatus}</span></span>
                                </div>
                                <span style="color:rgba(254,215,170,0.45); font-size:0.8rem;" title="Press Enter to open">↵</span>
                            `;

                            const posterImg = item.querySelector('img.spotlight-item-poster');
                            if (posterImg) {
                                posterImg.addEventListener('error', function () {
                                    if (!this.dataset.retry) {
                                        this.dataset.retry = '1';
                                        const s = this.src;
                                        this.src = s.endsWith('.webp') ? s.replace(/\.webp$/, '.jpg') : '/static/images/' + s.split('/').pop();
                                    } else if (this.dataset.retry === '1') {
                                        this.dataset.retry = '2';
                                        const s2 = this.src;
                                        if (s2.endsWith('.webp')) {
                                            this.src = s2.replace(/\.webp$/, '.jpg');
                                        } else {
                                            this.outerHTML = fallbackPoster;
                                        }
                                    } else {
                                        this.outerHTML = fallbackPoster;
                                    }
                                });
                            }

                            item.addEventListener('mouseenter', () => {
                                selectedResultIndex = idx;
                                updateResultHighlight();
                            });

                            item.addEventListener('click', () => {
                                selectSpotlightGame(game);
                            });

                            searchResults.appendChild(item);
                        });

                        // View all in Library row
                        if (games.length > 1) {
                            const allItem = document.createElement('div');
                            allItem.className = 'spotlight-result-item';
                            allItem.style.justifyContent = 'center';
                            allItem.style.borderTop = '1px solid rgba(255,255,255,0.06)';
                            allItem.style.marginTop = '4px';
                            allItem.innerHTML = `<span style="color:#ffb074; font-size:0.85rem; font-weight:600;">View all ${games.length} matching games in Library →</span>`;
                            allItem.addEventListener('click', () => {
                                closeSearch();
                                window.location.href = `library.html?q=${encodeURIComponent(query)}`;
                            });
                            searchResults.appendChild(allItem);
                        }
                    }
                    searchResults.classList.remove('hidden');
                } catch (err) {
                    console.error("Search failed", err);
                }
            }, 250);
        });

        // Keyboard navigation and Enter key selection for Spotlight Search
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' && currentSearchResults.length > 0) {
                e.preventDefault();
                selectedResultIndex = (selectedResultIndex + 1) % currentSearchResults.length;
                updateResultHighlight();
            } else if (e.key === 'ArrowUp' && currentSearchResults.length > 0) {
                e.preventDefault();
                selectedResultIndex = (selectedResultIndex - 1 + currentSearchResults.length) % currentSearchResults.length;
                updateResultHighlight();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentSearchResults.length > 0) {
                    const targetIdx = (selectedResultIndex >= 0 && selectedResultIndex < currentSearchResults.length)
                        ? selectedResultIndex
                        : 0;
                    const chosenGame = currentSearchResults[targetIdx];
                    if (chosenGame) {
                        selectSpotlightGame(chosenGame);
                        return;
                    }
                }
                const q = searchInput.value.trim();
                if (q) {
                    closeSearch();
                    window.location.href = `library.html?q=${encodeURIComponent(q)}`;
                }
            } else if (e.key === 'Escape') {
                closeSearch();
            }
        });
    }

    // ===== Global Persistent Top Navigation Bar Controller =====
    const globalHeader = document.getElementById('globalHeader') || document.querySelector('.floating-header');
    if (globalHeader) {
        const updateNavbarScroll = () => {
            const modalView = document.getElementById('gameDetailModalView');
            const isModalActive = modalView && modalView.classList.contains('active');
            const scrollPos = isModalActive ? modalView.scrollTop : (window.pageYOffset || document.documentElement.scrollTop || 0);
            if (scrollPos > 15) {
                globalHeader.classList.add('scrolled');
            } else {
                globalHeader.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', updateNavbarScroll, { passive: true });

        const modalView = document.getElementById('gameDetailModalView');
        if (modalView) {
            modalView.addEventListener('scroll', updateNavbarScroll, { passive: true });
        }

        // Initial check
        updateNavbarScroll();

        // Brand logo interaction: smooth close if in modal view, smooth scroll to top if on home
        const brandLogo = document.getElementById('globalBrandLogo') || globalHeader.querySelector('.brand-logo');
        if (brandLogo) {
            brandLogo.addEventListener('click', (e) => {
                if (window.isDetailOpen) {
                    e.preventDefault();
                    if (typeof window.closeGameDetail === 'function') {
                        window.closeGameDetail();
                    }
                } else if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
                    const hero = document.getElementById('hero');
                    if (hero) {
                        e.preventDefault();
                        hero.scrollIntoView({ behavior: 'smooth' });
                        try { history.pushState(null, '', window.location.pathname); } catch(err){}
                    }
                }
            });
        }

        // Global Avatar button behavior for pages without about modal (like standalone game page)
        const avatarBtn = document.getElementById('avatarBtn');
        if (avatarBtn && !document.getElementById('aboutModal')) {
            avatarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof window.openLoginModal === 'function') {
                    window.openLoginModal();
                }
            });
        }
    }
});
