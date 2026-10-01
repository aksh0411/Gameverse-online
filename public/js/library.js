// =========================================================================
// GAMEVERSE DEDICATED LIBRARY CONTROLLER (library.js)
// State management, live filtering, URL sync, 16:9 widescreen card grid,
// genre-bundle Collections view, compact Dimensional Radar mounting, and
// shared-element detail view integration.
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    let allGames = [];
    let currentFilter = {
        type: 'all',       // 'all', 'favorites', 'collections', 'playing', 'backlog', 'completed', 'masterpieces'
        genre: null,
        platform: null,
        sort: 'recently_played',
        searchQuery: '',
        viewMode: 'grid'   // 'grid', 'list', or 'bundles' while type === 'collections'
    };

    // DOM Elements
    const gamesContainer = document.getElementById('gamesCatalogContainer');
    const catalogTitle = document.getElementById('catalogSectionTitle');
    const catalogCount = document.getElementById('catalogCountIndicator');
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    const searchInput = document.getElementById('topbarSearchInput');
    const sortSelect = document.getElementById('catalogSortSelect');
    const filterBtn = document.getElementById('catalogFilterBtn');
    const filterPopover = document.getElementById('filterPopover');
    const viewGridBtn = document.getElementById('viewGridBtn');
    const viewListBtn = document.getElementById('viewListBtn');

    // Sidebar / shell elements
    const sidebarItems = document.querySelectorAll('.sidebar-nav-item[data-filter]');
    const dashboardSidebar = document.getElementById('dashboardSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const aboutBtn = document.getElementById('aboutBtn');
    const loginBtn = document.getElementById('loginBtn');

    // Badges
    const badgeAll = document.getElementById('badgeCountAll');
    const badgeFav = document.getElementById('badgeCountFav');
    const badgeCollections = document.getElementById('badgeCountCollections');
    const badgePlaying = document.getElementById('badgeCountPlaying');
    const badgeBacklog = document.getElementById('badgeCountBacklog');
    const badgeCompleted = document.getElementById('badgeCountCompleted');
    const badgeBookmarked = document.getElementById('badgeCountBookmarked');

    // ── 1. Fetch & Initialize Collection ──
    async function loadLibrary() {
        try {
            const data = await apiGet('/games?limit=150');
            allGames = Array.isArray(data) ? data : (data.games || []);
            window.__ALL_GAMES__ = allGames;

            updateStatistics(allGames);
            initDimensionalRadar(allGames);
            populateFilterOptions(allGames);
            readUrlState();
            syncRadarWithFilter(currentFilter.type);
            applyFilters();
        } catch (err) {
            console.error('Failed to load library data:', err);
            if (gamesContainer) {
                gamesContainer.innerHTML = `
                    <div class="catalog-empty-state">
                        <p>Error loading library: ${escHtml(err.message)}</p>
                    </div>
                `;
            }
        }
    }

    // ── 2. Update Live Badges ──
    function updateStatistics(games) {
        const total = games.length;
        const favCount = games.filter(g => Boolean(g.is_favorited)).length;
        const playingCount = games.filter(g => (g.play_status || '').toLowerCase() === 'playing').length;
        // Backlog = play later games only
        const backlogCount = games.filter(g => (g.play_status || '').toLowerCase() === 'play_later').length;
        const completedCount = games.filter(g => (g.play_status || '').toLowerCase() === 'completed').length;
        const bookmarkedCount = games.filter(g => Boolean(g.is_bookmarked)).length;
        // Bundle count = games grouped by their primary (first) genre, matching the Collections view
        // (games without genres land in the same "Uncategorized" bundle the view renders)
        const genreSet = new Set();
        games.forEach(g => {
            if (Array.isArray(g.genres) && g.genres.length > 0) {
                const first = g.genres[0];
                genreSet.add(typeof first === 'object' ? (first.genre_name || first.name) : first);
            } else {
                genreSet.add('Uncategorized');
            }
        });

        if (badgeAll) badgeAll.textContent = total;
        if (badgeFav) badgeFav.textContent = favCount;
        if (badgeCollections) badgeCollections.textContent = genreSet.size;
        if (badgePlaying) badgePlaying.textContent = playingCount;
        if (badgeBacklog) badgeBacklog.textContent = backlogCount;
        if (badgeCompleted) badgeCompleted.textContent = completedCount;
        if (badgeBookmarked) badgeBookmarked.textContent = bookmarkedCount;
    }

    // Shims so shared-transition.js modal toggles (favorite/bookmark/status) instantly
    // refresh the library badges and the visible cards without a page reload.
    window.refreshStats = () => updateStatistics(allGames);
    window.refreshGrids = () => applyFilters();

    // ── 3. Dimensional Radar 3D Core Mounting (same orbital scene as home, compact) ──
    function initDimensionalRadar(games) {
        const radarCanvas = document.getElementById('radarCore3d');
        const radarPills = document.getElementById('radarPillsLayer');
        if (!radarCanvas || !radarPills) return;

        if (typeof createRadarCoreScene === 'function') {
            // Radar widget mode: collection-core.js centers/scales the scene down and
            // always orbits ALL games; pills open the shared-element detail view.
            createRadarCoreScene(radarCanvas, radarPills, games);
        } else if (typeof initCollectionCore === 'function') {
            initCollectionCore(games);
        }
    }

    // ── 4. URL State Sync (history.pushState) ──
    function readUrlState() {
        const params = new URLSearchParams(window.location.search);
        const filterParam = params.get('filter') || params.get('status') || 'all';
        const searchParam = params.get('q') || '';
        const genreParam = params.get('genre') || null;
        const sortParam = params.get('sort') || 'recently_played';

        currentFilter.type = filterParam;
        currentFilter.searchQuery = searchParam;
        currentFilter.genre = genreParam;
        currentFilter.sort = sortParam;

        if (searchInput) searchInput.value = searchParam;
        if (sortSelect) sortSelect.value = sortParam;
        markActiveGenreChip(genreParam);

        updateActiveSidebarVisual(filterParam);
    }

    function setUrlState(filterType, isReplace = false) {
        currentFilter.type = filterType;
        const url = new URL(window.location.href);
        if (filterType === 'all') {
            url.searchParams.delete('filter');
            url.searchParams.delete('status');
        } else if (['playing', 'not_started', 'completed'].includes(filterType)) {
            url.searchParams.delete('filter');
            url.searchParams.set('status', filterType);
        } else {
            url.searchParams.delete('status');
            url.searchParams.set('filter', filterType);
        }

        if (isReplace) {
            window.history.replaceState({}, '', url);
        } else {
            window.history.pushState({}, '', url);
        }

        updateActiveSidebarVisual(filterType);
        syncRadarWithFilter(filterType);
        applyFilters();
    }

    function updateActiveSidebarVisual(filterType) {
        sidebarItems.forEach(item => {
            item.classList.toggle('active', item.dataset.filter === filterType);
        });

        const titleMap = {
            'all': 'All games',
            'favorites': 'Favorites',
            'collections': 'Collections',
            'playing': 'Currently Playing',
            'backlog': 'Backlog',
            'completed': 'Completed',
            'bookmarked': 'Bookmarked'
        };
        const title = titleMap[filterType] || 'All games';
        if (catalogTitle) catalogTitle.textContent = title;
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = title;
    }

    // Keep the 3D Collection Core in sync with the active sidebar view
    // (Collections shows genre bundles, so the radar keeps orbiting everything there;
    //  the radar's internal name for the favorites filter is 'favorited')
    function syncRadarWithFilter(filterType) {
        if (typeof window.setRadarFilter === 'function') {
            const radarFilter = filterType === 'collections' ? 'all'
                : filterType === 'favorites' ? 'favorited'
                : filterType;
            window.setRadarFilter(radarFilter);
        }
    }

    // Listen for browser Back/Forward buttons
    window.addEventListener('popstate', () => {
        readUrlState();
        syncRadarWithFilter(currentFilter.type);
        applyFilters();
    });

    // ── 5. Filtering & Sorting Engine ──
    function applyFilters() {
        let results = [...allGames];

        // 1. Sidebar Category Filter
        switch (currentFilter.type) {
            case 'favorites':
                results = results.filter(g => Boolean(g.is_favorited));
                break;
            case 'playing':
                results = results.filter(g => (g.play_status || '').toLowerCase() === 'playing');
                break;
            case 'backlog':
                // Backlog view = play later games only
                results = results.filter(g => (g.play_status || '').toLowerCase() === 'play_later');
                break;
            case 'completed':
                results = results.filter(g => (g.play_status || '').toLowerCase() === 'completed');
                break;
            case 'bookmarked':
                results = results.filter(g => Boolean(g.is_bookmarked));
                break;
            default:
                break;
        }

        // 2. Genre Filter (from Popover / URL)
        if (currentFilter.genre) {
            results = results.filter(g => {
                const genres = Array.isArray(g.genres)
                    ? g.genres.map(x => (typeof x === 'object' ? x.genre_name || x.name : x).toLowerCase())
                    : [];
                return genres.includes(currentFilter.genre.toLowerCase());
            });
        }

        // 3. Platform Filter (reserved — no UI control yet)
        if (currentFilter.platform) {
            results = results.filter(g => {
                const platforms = Array.isArray(g.platforms)
                    ? g.platforms.map(x => (typeof x === 'object' ? x.platform_name || x.name : x).toLowerCase())
                    : [];
                return platforms.includes(currentFilter.platform.toLowerCase());
            });
        }

        // 4. Live Search Query
        if (currentFilter.searchQuery.trim()) {
            const q = currentFilter.searchQuery.toLowerCase().trim();
            results = results.filter(g => {
                const name = (g.name || g.game_name || '').toLowerCase();
                const desc = (g.description || '').toLowerCase();
                return name.includes(q) || desc.includes(q);
            });
        }

        // 5. Sorting
        switch (currentFilter.sort) {
            case 'rating':
                results.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
                break;
            case 'az':
                results.sort((a, b) => (a.name || a.game_name || '').localeCompare(b.name || b.game_name || ''));
                break;
            case 'release_date':
                results.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
                break;
            case 'recently_played':
            default:
                // No last_played column exists — newest added (highest game_id) first
                results.sort((a, b) => (b.id || b.game_id || 0) - (a.id || a.game_id || 0));
                break;
        }

        if (catalogCount) catalogCount.textContent = results.length;
        renderCatalog(results);
    }

    // ── 6. Render (Grid / Genre Bundles / List) ──
    function renderCatalog(games) {
        if (!gamesContainer) return;
        gamesContainer.innerHTML = '';

        if (games.length === 0) {
            gamesContainer.innerHTML = `
                <div class="catalog-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 12h8"></path>
                    </svg>
                    <p style="font-size: 1.1rem; margin-bottom: 4px;">No games found in this view</p>
                    <span style="font-size: 0.85rem; color: rgba(224,248,252,0.4);">Try adjusting your search query or filters</span>
                </div>
            `;
            return;
        }

        if (currentFilter.viewMode === 'list') {
            renderListView(games);
        } else if (currentFilter.type === 'collections') {
            renderGenreBundles(games);
        } else {
            renderGridView(games);
        }
    }

    // Shared status label mapping for cards & list rows.
    // "Backlog" is reserved for play_later games; not_started shows as "Not Started".
    function statusLabel(rawStatus) {
        const map = {
            'playing': 'Playing',
            'not_started': 'Not Started',
            'play_later': 'Backlog',
            'completed': 'Completed',
            'wont_play': 'Paused'
        };
        return map[rawStatus] || 'Not Started';
    }

    // Pill color grouping per raw status (play_later keeps its own amber dot)
    function displayStatus(game) {
        return (game.play_status || 'not_started').toLowerCase();
    }

    function gameGenres(game, max, joiner) {
        if (Array.isArray(game.genres) && game.genres.length > 0) {
            return game.genres.map(g => (typeof g === 'object' ? g.genre_name || g.name : g)).slice(0, max).join(joiner);
        }
        return 'Uncategorized';
    }

    function starScore(game) {
        const numRating = Number(game.rating) || 0;
        return numRating > 5 ? (numRating / 2).toFixed(1) : numRating.toFixed(1);
    }

    // 6A. Wide Card factory (used by grid view and genre bundles)
    function buildWideCard(game) {
        const card = document.createElement('div');
        card.className = 'wide-game-card';
        card.dataset.gameId = game.id || game.game_id;

        const rawCover = game.cover_image || 'static/images/game_1.jpg';
        const coverUrl = typeof getImageUrl === 'function' ? getImageUrl(rawCover) : rawCover;
        const rawStatus = displayStatus(game);
        const subtitle = game.description ? game.description.slice(0, 48) + '...' : 'An extraordinary digital odyssey';
        const isFav = Boolean(game.is_favorited);

        card.innerHTML = `
            <img class="wide-card-bg" src="${escHtml(coverUrl)}" alt="${escHtml(game.name || game.game_name)}" loading="lazy" onerror="this.src='static/images/game_1.jpg';">
            <div class="wide-card-gradient"></div>
            <div class="wide-card-top">
                <span class="wide-status-pill status-${rawStatus}">
                    <span class="pill-dot"></span>
                    ${statusLabel(rawStatus)}
                </span>
                <button class="wide-card-fav-btn ${isFav ? 'active' : ''}" title="Favorite" data-id="${game.id || game.game_id}" aria-label="Toggle Favorite">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>
            <div class="wide-card-bottom">
                <h3 class="wide-card-title">${escHtml(game.name || game.game_name)}</h3>
                <p class="wide-card-subtitle">${escHtml(subtitle)}</p>
                <div class="wide-card-footer">
                    <span class="wide-card-genre">${escHtml(gameGenres(game, 2, ' · '))}</span>
                    <span class="wide-card-rating">
                        <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        ${starScore(game)}
                    </span>
                </div>
            </div>
        `;

        wireFavoriteButton(card.querySelector('.wide-card-fav-btn'), game);
        card.addEventListener('click', () => openDetail(card, game));
        return card;
    }

    // Favorite toggle: optimistic UI → Supabase PATCH → revert + login prompt on failure
    function wireFavoriteButton(favBtn, game) {
        if (!favBtn) return;
        favBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const newFav = !game.is_favorited;
            game.is_favorited = newFav;
            favBtn.classList.toggle('active', newFav);
            updateStatistics(allGames);

            try {
                await apiPatch(`/games/${game.id || game.game_id}/status`, { is_favorited: newFav });
            } catch (err) {
                console.error('Failed to toggle favorite:', err);
                game.is_favorited = !newFav;
                favBtn.classList.toggle('active', !newFav);
                updateStatistics(allGames);
            }
        });
    }

    function openDetail(element, game) {
        if (typeof openGameDetail === 'function') {
            openGameDetail(element, game);
        } else {
            window.location.href = `library.html?game=${game.id || game.game_id}`;
        }
    }

    // 6B. Grid View (16:9 Widescreen Cards)
    function renderGridView(games) {
        const grid = document.createElement('div');
        grid.className = 'wide-cards-grid';
        games.forEach(game => grid.appendChild(buildWideCard(game)));
        gamesContainer.appendChild(grid);
    }

    // 6C. Collections View — genre bundles (each genre = one bundle section)
    function renderGenreBundles(games) {
        const bundles = new Map();
        games.forEach(game => {
            const genre = gameGenres(game, 1, ',');
            if (!bundles.has(genre)) bundles.set(genre, []);
            bundles.get(genre).push(game);
        });

        const wrap = document.createElement('div');
        wrap.className = 'genre-bundles-wrap';

        Array.from(bundles.keys()).sort((a, b) => bundles.get(b).length - bundles.get(a).length).forEach(genre => {
            const bundleGames = bundles.get(genre);
            const bundle = document.createElement('div');
            bundle.className = 'genre-bundle';

            const header = document.createElement('div');
            header.className = 'genre-bundle-header';
            header.innerHTML = `
                <span class="genre-bundle-diamond">◈</span>
                <h3 class="genre-bundle-name">${escHtml(genre)}</h3>
                <span class="genre-bundle-count">${bundleGames.length} game${bundleGames.length === 1 ? '' : 's'}</span>
            `;
            bundle.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'wide-cards-grid bundle-grid';
            bundleGames.forEach(game => grid.appendChild(buildWideCard(game)));
            bundle.appendChild(grid);

            wrap.appendChild(bundle);
        });

        gamesContainer.appendChild(wrap);
    }

    // 6D. List View
    function renderListView(games) {
        const list = document.createElement('div');
        list.className = 'compact-list-view';

        games.forEach(game => {
            const row = document.createElement('div');
            row.className = 'list-row-item';
            row.dataset.gameId = game.id || game.game_id;

            const rawCover = game.cover_image || 'static/images/game_1.jpg';
            const coverUrl = typeof getImageUrl === 'function' ? getImageUrl(rawCover) : rawCover;
            const rawStatus = displayStatus(game);

            row.innerHTML = `
                <img class="list-thumb" src="${escHtml(coverUrl)}" alt="${escHtml(game.name || game.game_name)}" loading="lazy">
                <span class="list-title">${escHtml(game.name || game.game_name)}</span>
                <span class="list-meta">${escHtml(gameGenres(game, 2, ', '))}</span>
                <span class="list-meta wide-status-pill status-${rawStatus}" style="font-size: 0.7rem; padding: 2px 8px;">
                    ${statusLabel(rawStatus)}
                </span>
                <span class="wide-card-rating" style="font-size: 0.82rem;">★ ${starScore(game)}</span>
                <button class="wide-card-fav-btn ${game.is_favorited ? 'active' : ''}" style="width: 28px; height: 28px;" aria-label="Toggle Favorite">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
            `;

            wireFavoriteButton(row.querySelector('.wide-card-fav-btn'), game);
            row.addEventListener('click', () => openDetail(row, game));
            list.appendChild(row);
        });

        gamesContainer.appendChild(list);
    }

    // ── 7. Sidebar Click Handlers ──
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            closeMobileSidebar();
            setUrlState(item.dataset.filter);
        });
    });

    // ── 8. Search Input Handling (+ live suggestions on name / genre / platform) ──
    const suggestionsBox = document.getElementById('topbarSuggestions');
    const topbarSearchBox = document.getElementById('topbarSearchBox');

    function hideSearchSuggestions() {
        if (suggestionsBox) suggestionsBox.classList.add('hidden');
    }

    function renderSearchSuggestions(rawQuery) {
        if (!suggestionsBox) return;
        const q = (rawQuery || '').trim().toLowerCase();
        if (!q) {
            hideSearchSuggestions();
            return;
        }

        const matches = allGames.filter(g => {
            const name = (g.name || g.game_name || '').toLowerCase();
            const genres = (Array.isArray(g.genres) ? g.genres : [])
                .map(x => (typeof x === 'object' ? x.genre_name || x.name : x).toLowerCase()).join(' ');
            const platforms = (Array.isArray(g.platforms) ? g.platforms : [])
                .map(x => (typeof x === 'object' ? x.platform_name || x.name : x).toLowerCase()).join(' ');
            return name.includes(q) || genres.includes(q) || platforms.includes(q);
        }).slice(0, 6);

        suggestionsBox.innerHTML = '';

        if (matches.length === 0) {
            suggestionsBox.innerHTML = '<div class="spotlight-result-item" style="justify-content:center; color:rgba(212,204,239,0.5); cursor:default;">No matching worlds found.</div>';
        } else {
            matches.forEach(game => {
                const item = document.createElement('div');
                item.className = 'spotlight-result-item';
                const gameName = game.name || game.game_name || 'Untitled';
                const rawCover = game.cover_image;
                const coverUrl = typeof getImageUrl === 'function' ? getImageUrl(rawCover) : rawCover;
                const playStatus = (game.play_status || 'not_started').replace('_', ' ').toUpperCase();

                const poster = coverUrl
                    ? `<img class="spotlight-item-poster" src="${escHtml(coverUrl)}" alt="${escHtml(gameName)}" loading="lazy" decoding="async" onerror="this.outerHTML='<div class=spotlight-item-poster style=display:flex;align-items:center;justify-content:center;color:#888>🎮</div>';">`
                    : `<div class="spotlight-item-poster" style="display:flex;align-items:center;justify-content:center;color:#888;">🎮</div>`;

                item.innerHTML = `
                    ${poster}
                    <div class="spotlight-item-info">
                        <span class="spotlight-item-title">${escHtml(gameName)}</span>
                        <span class="spotlight-item-meta">${escHtml(gameGenres(game, 2, ', '))} · <span style="color:#2dd4bf">${playStatus}</span></span>
                    </div>
                    <span style="color:rgba(212,204,239,0.4); font-size:0.8rem;">↵</span>
                `;

                item.addEventListener('click', () => {
                    hideSearchSuggestions();
                    openDetail(item, game);
                });
                suggestionsBox.appendChild(item);
            });
        }
        suggestionsBox.classList.remove('hidden');
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilter.searchQuery = e.target.value;
            const url = new URL(window.location.href);
            if (currentFilter.searchQuery.trim()) {
                url.searchParams.set('q', currentFilter.searchQuery.trim());
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState({}, '', url);
            applyFilters();
            renderSearchSuggestions(e.target.value);
        });
        searchInput.addEventListener('focus', () => renderSearchSuggestions(searchInput.value));
    }

    // Close suggestions when clicking anywhere outside the search box
    document.addEventListener('click', (e) => {
        if (topbarSearchBox && !topbarSearchBox.contains(e.target)) {
            hideSearchSuggestions();
        }
    });

    // ── 9. Sort Dropdown Handling ──
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilter.sort = e.target.value;
            const url = new URL(window.location.href);
            if (currentFilter.sort && currentFilter.sort !== 'recently_played') {
                url.searchParams.set('sort', currentFilter.sort);
            } else {
                url.searchParams.delete('sort');
            }
            window.history.replaceState({}, '', url);
            applyFilters();
        });
    }

    // ── 10. View Mode Switcher ──
    if (viewGridBtn && viewListBtn) {
        viewGridBtn.addEventListener('click', () => {
            currentFilter.viewMode = 'grid';
            viewGridBtn.classList.add('active');
            viewListBtn.classList.remove('active');
            applyFilters();
        });
        viewListBtn.addEventListener('click', () => {
            currentFilter.viewMode = 'list';
            viewListBtn.classList.add('active');
            viewGridBtn.classList.remove('active');
            applyFilters();
        });
    }

    // ── 11. Filter Popover (Genres) ──
    function populateFilterOptions(games) {
        const genreContainer = document.getElementById('filterPopoverGenres');
        if (!genreContainer) return;

        const genreSet = new Set();
        games.forEach(g => {
            if (Array.isArray(g.genres)) {
                g.genres.forEach(x => genreSet.add(typeof x === 'object' ? x.genre_name || x.name : x));
            }
        });

        genreContainer.innerHTML = '';
        Array.from(genreSet).sort().forEach(genre => {
            const chip = document.createElement('span');
            chip.className = 'filter-chip';
            chip.dataset.genre = genre;
            chip.textContent = genre;
            chip.addEventListener('click', () => {
                const isActive = currentFilter.genre === genre;
                currentFilter.genre = isActive ? null : genre;
                document.querySelectorAll('#filterPopoverGenres .filter-chip').forEach(c => c.classList.remove('active'));
                if (!isActive) chip.classList.add('active');

                const url = new URL(window.location.href);
                if (currentFilter.genre) {
                    url.searchParams.set('genre', currentFilter.genre);
                } else {
                    url.searchParams.delete('genre');
                }
                window.history.replaceState({}, '', url);
                applyFilters();
            });
            genreContainer.appendChild(chip);
        });

        // Re-highlight after async population (URL may carry ?genre=)
        markActiveGenreChip(currentFilter.genre);
    }

    function markActiveGenreChip(genre) {
        document.querySelectorAll('#filterPopoverGenres .filter-chip').forEach(c => {
            c.classList.toggle('active', !!genre && c.dataset.genre === genre);
        });
    }

    if (filterBtn && filterPopover) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = filterPopover.classList.contains('hidden');
            filterPopover.classList.toggle('hidden', !isHidden);
            filterBtn.classList.toggle('active', isHidden);
        });

        document.addEventListener('click', (e) => {
            if (!filterPopover.contains(e.target) && e.target !== filterBtn) {
                filterPopover.classList.add('hidden');
                filterBtn.classList.remove('active');
            }
        });
    }

    const resetFiltersBtn = document.getElementById('resetPopoverFiltersBtn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            currentFilter.genre = null;
            currentFilter.platform = null;
            markActiveGenreChip(null);
            const url = new URL(window.location.href);
            url.searchParams.delete('genre');
            window.history.replaceState({}, '', url);
            applyFilters();
        });
    }

    // ── 12. About / Avatar / Profile Buttons ──
    function openProfileUI() {
        // Logged-in admins get the About/profile window (with Logout); visitors get the login modal
        if (typeof isAdmin === 'function' && isAdmin()) {
            const aboutModal = document.getElementById('aboutModal');
            if (aboutModal) {
                aboutModal.classList.remove('hidden');
                const inner = aboutModal.querySelector('.about-modal-inner');
                if (inner) inner.scrollTop = 0;
            }
        } else if (typeof openLoginModal === 'function') {
            openLoginModal();
        }
    }

    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            const aboutModal = document.getElementById('aboutModal');
            if (aboutModal) {
                aboutModal.classList.remove('hidden');
                const inner = aboutModal.querySelector('.about-modal-inner');
                if (inner) inner.scrollTop = 0;
            }
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', openProfileUI);
    }

    // Profile icon inside the game detail modal navbar — same behavior as the topbar avatar
    const modalNavProfile = document.getElementById('modalNavProfile');
    if (modalNavProfile) {
        modalNavProfile.addEventListener('click', openProfileUI);
    }

    // ── 13. Mobile Sidebar Toggle ──
    function closeMobileSidebar() {
        if (dashboardSidebar) dashboardSidebar.classList.remove('mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('visible');
    }

    if (sidebarToggle && dashboardSidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = !dashboardSidebar.classList.contains('mobile-open');
            dashboardSidebar.classList.toggle('mobile-open', willOpen);
            if (sidebarBackdrop) sidebarBackdrop.classList.toggle('visible', willOpen);
        });
    }
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', closeMobileSidebar);
    }

    // ── 14. Keyboard Shortcuts ──
    // Ctrl/Cmd+K opens the shared spotlight search (search.js owns the overlay;
    // it also serves the game detail modal navbar). Escape still closes the
    // filter popover and the mobile sidebar.
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (typeof window.openSpotlightSearch === 'function') {
                window.openSpotlightSearch();
            } else if (searchInput) {
                searchInput.focus();
            }
        } else if (e.key === 'Escape') {
            hideSearchSuggestions();
            if (filterPopover && !filterPopover.classList.contains('hidden')) {
                filterPopover.classList.add('hidden');
                if (filterBtn) filterBtn.classList.remove('active');
            }
            closeMobileSidebar();
        }
    });

    // Start loading
    loadLibrary();
});
