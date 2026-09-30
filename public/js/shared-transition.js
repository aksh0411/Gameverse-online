// =========================================================================
// GAMEVERSE CINEMATIC SHARED-ELEMENT TRANSITION CONTROLLER
// Seamless 60fps FLIP morphing between game cards and full detail view
// =========================================================================

(function() {
    let isTransitioning = false;
    let isDetailOpen = false;
    let activeCardElement = null;
    let activeGameData = null;

    // Status styling configs matching design
    const statusConfig = {
        playing: {
            label: 'PLAYING',
            tagBg: 'rgba(16, 185, 129, 0.15)',
            tagColor: '#34d399',
            tagBorder: 'rgba(52, 211, 153, 0.3)'
        },
        completed: {
            label: 'COMPLETED',
            tagBg: 'rgba(122, 150, 188, 0.15)',
            tagColor: '#a8c0dc',
            tagBorder: 'rgba(168, 192, 220, 0.3)'
        },
        not_started: {
            label: 'NOT STARTED',
            tagBg: 'rgba(125, 108, 168, 0.15)',
            tagColor: '#67e8f9',
            tagBorder: 'rgba(187, 174, 223, 0.3)'
        },
        play_later: {
            label: 'PLAY LATER',
            tagBg: 'rgba(156, 82, 207, 0.15)',
            tagColor: '#d9b3ee',
            tagBorder: 'rgba(217, 179, 238, 0.3)'
        },
        wont_play: {
            label: "WON'T PLAY",
            tagBg: 'rgba(107, 45, 75, 0.2)',
            tagColor: '#eab0c6',
            tagBorder: 'rgba(234, 176, 198, 0.3)'
        }
    };

    /**
     * Resolves game's accent color based on status or deterministic palette
     */
    function getGameAccentColor(game) {
        if (!game) return '#00f5d4';
        if (game.accentColor || game.accent_color) return game.accentColor || game.accent_color;
        const status = (game.play_status || '').toLowerCase();
        const statusColors = {
            playing: '#00f5d4',
            completed: '#38bdf8',
            play_later: '#06b6d4',
            not_started: '#c66a93',
            wont_play: '#7a96bc'
        };
        if (statusColors[status]) return statusColors[status];
        const palette = ['#c66a93', '#7a96bc', '#00f5d4', '#06b6d4', '#38bdf8'];
        const id = Number(game.id || game.game_id || 0);
        return palette[id % palette.length];
    }

    /**
     * Resolves best image URL for a game, checking hero art or cover image
     */
    function resolveGameImages(gameId, coverImage) {
        const heroFile = `hero_${gameId}.jpg`;
        const coverFile = (coverImage || `game_${gameId}.jpg`).split('/').pop();
        return {
            heroUrl: `/static/images/${heroFile}`,
            coverUrl: typeof getImageUrl === 'function' ? getImageUrl(coverImage) : (coverImage || `/static/images/${coverFile}`)
        };
    }

    /**
     * Formats array of genres/platforms/modes to display string
     */
    function formatList(arr) {
        if (!arr || arr.length === 0) return '—';
        return arr.map(item => (typeof item === 'object' && item !== null) 
            ? (item.name || item.genre_name || item.platform_name || item.mode_name || item.story_type || '') 
            : String(item)).filter(Boolean).join(', ') || '—';
    }

    /**
     * Parses markdown text into formatted paragraphs and headings
     */
    function formatAboutMarkdown(rawText) {
        if (!rawText) return '<p class="about-paragraph">No description provided.</p>';
        const lines = rawText.split('\n');
        let html = '';
        let currentParagraph = [];

        function flushParagraph() {
            if (currentParagraph.length > 0) {
                const pText = currentParagraph.join(' ').trim();
                if (pText) {
                    const formatted = pText
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="about-strong">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>');
                    html += `<p class="about-paragraph">${formatted}</p>`;
                }
                currentParagraph = [];
            }
        }

        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                flushParagraph();
                continue;
            }
            const headingMatch = trimmed.match(/^###?\s+(.+)$/);
            if (headingMatch) {
                flushParagraph();
                html += `<h3 class="about-subtitle"><span class="about-subtitle-gem">◈</span> ${headingMatch[1].trim()}</h3>`;
            } else {
                currentParagraph.push(trimmed);
            }
        }
        flushParagraph();
        return html || `<p class="about-paragraph">${rawText}</p>`;
    }

    /**
     * Populates all fields of the modal detail panel
     */
    function populateModalContent(gameData) {
        const gameId = gameData.id || gameData.game_id;
        const gameTitle = gameData.name || gameData.game_name || 'Untitled Game';
        const gameDesc = gameData.description || 'No description provided.';
        const playStatus = (gameData.play_status || 'not_started').toLowerCase();

        // 1. Hero text & status tag
        const titleEl = document.getElementById('modalGameName');
        const descEl = document.getElementById('modalGameDescription');
        const statusTag = document.getElementById('modalStatusTag');

        if (titleEl) titleEl.textContent = gameTitle;
        if (descEl) descEl.textContent = gameDesc;

        if (statusTag) {
            const conf = statusConfig[playStatus] || statusConfig.not_started;
            statusTag.textContent = conf.label;
            statusTag.style.background = conf.tagBg;
            statusTag.style.color = conf.tagColor;
            statusTag.style.borderColor = conf.tagBorder;
        }

        // 2. Artwork image
        const heroImg = document.getElementById('modalHeroImg');
        const heroBg = document.getElementById('modalHeroBg');
        const { heroUrl, coverUrl } = resolveGameImages(gameId, gameData.cover_image);

        if (heroImg) {
            heroImg.style.opacity = '0.4';
            heroImg.onerror = function() {
                if (this.src !== coverUrl) {
                    this.src = coverUrl;
                }
            };
            heroImg.onload = function() {
                this.style.opacity = '0.96';
            };
            heroImg.src = heroUrl;
        }

        // 3. Bookmark and Favorite buttons
        const bookmarkBtn = document.getElementById('modalBookmarkBtn');
        if (bookmarkBtn) {
            bookmarkBtn.classList.toggle('active', !!(gameData.is_bookmarked || gameData.bookmarked));
        }

        const favoriteBtn = document.getElementById('modalFavoriteBtn');
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active', !!(gameData.is_favorited || gameData.favorited));
        }

        // 4. Quick info strip
        const devName = gameData.developer ? (gameData.developer.developer_name || gameData.developer.name || 'Unknown') : 'Unknown';
        const engineName = gameData.game_engine || gameData.engine || 'Unknown';
        const genreStr = formatList(gameData.genres);
        const platformStr = formatList(gameData.platforms);
        const releaseStr = gameData.release_date || 'Unknown';

        const quickInfo = document.getElementById('modalQuickInfoRow');
        if (quickInfo) {
            quickInfo.innerHTML = `
                <div class="meta-item">
                    <div class="meta-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="6" width="20" height="12" rx="4"></rect>
                            <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01"></path>
                        </svg>
                    </div>
                    <div class="meta-text">
                        <span class="meta-label">Genre</span>
                        <span class="meta-val" title="${genreStr}">${genreStr}</span>
                    </div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                        </svg>
                    </div>
                    <div class="meta-text">
                        <span class="meta-label">Developer</span>
                        <span class="meta-val" title="${devName}">${devName}</span>
                    </div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <div class="meta-text">
                        <span class="meta-label">Released</span>
                        <span class="meta-val" title="${releaseStr}">${releaseStr}</span>
                    </div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                    </div>
                    <div class="meta-text">
                        <span class="meta-label">Platform</span>
                        <span class="meta-val" title="${platformStr}">${platformStr}</span>
                    </div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </div>
                    <div class="meta-text">
                        <span class="meta-label">Engine</span>
                        <span class="meta-val" title="${engineName}">${engineName}</span>
                    </div>
                </div>
            `;
        }

        // 5. About text
        const fullDesc = document.getElementById('modalFullDescription');
        if (fullDesc) {
            const aboutText = gameData.detailed_description || gameData.description || 'No detailed description available.';
            fullDesc.innerHTML = formatAboutMarkdown(aboutText);
        }

        // 6. Status selector buttons
        const statusSelector = document.getElementById('modalStatusSelector');
        if (statusSelector) {
            const btns = statusSelector.querySelectorAll('.status-choice-btn');
            btns.forEach(btn => {
                const btnVal = btn.getAttribute('data-val');
                btn.classList.toggle('active', btnVal === playStatus);
            });
        }

        // 7. Reset tabs to Overview
        const tabs = document.querySelectorAll('[data-modal-tab]');
        const panels = document.querySelectorAll('.game-detail-modal-view .tab-panel');
        tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-modal-tab') === 'overview'));
        panels.forEach(p => p.classList.toggle('active', p.id === 'modalTab-overview'));

        // 7b. Sync admin more-menu visibility
        const modalAdminWrapper = document.getElementById('modalAdminMenuWrapper');
        if (modalAdminWrapper) {
            modalAdminWrapper.classList.toggle('hidden', !(typeof isAdmin === 'function' && isAdmin()));
        }

        // 8. Fetch detailed data asynchronously to ensure complete information
        apiGet(`/games/${gameId}`).then(fullData => {
            if (!fullData) return;
            activeGameData = { ...(activeGameData || {}), ...fullData };

            // Update title and description if previously placeholder or incomplete
            const resolvedTitle = fullData.game_name || fullData.name;
            if (resolvedTitle && titleEl) titleEl.textContent = resolvedTitle;
            const resolvedDesc = fullData.description;
            if (resolvedDesc && descEl) descEl.textContent = resolvedDesc;

            // Update status tag
            const resolvedStatus = (fullData.play_status || 'not_started').toLowerCase();
            if (statusTag) {
                const conf = statusConfig[resolvedStatus] || statusConfig.not_started;
                statusTag.textContent = conf.label;
                statusTag.style.background = conf.tagBg;
                statusTag.style.color = conf.tagColor;
                statusTag.style.borderColor = conf.tagBorder;
            }

            // Update hero artwork
            const { heroUrl: fHero, coverUrl: fCover } = resolveGameImages(gameId, fullData.cover_image);
            if (heroImg) {
                heroImg.onerror = function() {
                    if (this.src !== fCover) {
                        this.src = fCover;
                    }
                };
                heroImg.src = fHero;
            }

            // Update quick info strip
            const fDev = fullData.developer ? (fullData.developer.developer_name || fullData.developer.name || 'Unknown') : 'Unknown';
            const fEngine = fullData.game_engine || fullData.engine || 'Unknown';
            const fGenre = formatList(fullData.genres);
            const fPlatform = formatList(fullData.platforms);
            const fRelease = fullData.release_date || 'Unknown';

            if (quickInfo) {
                quickInfo.innerHTML = `
                    <div class="meta-item">
                        <div class="meta-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="6" width="20" height="12" rx="4"></rect>
                                <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01"></path>
                            </svg>
                        </div>
                        <div class="meta-text">
                            <span class="meta-label">Genre</span>
                            <span class="meta-val" title="${fGenre}">${fGenre}</span>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                            </svg>
                        </div>
                        <div class="meta-text">
                            <span class="meta-label">Developer</span>
                            <span class="meta-val" title="${fDev}">${fDev}</span>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <div class="meta-text">
                            <span class="meta-label">Released</span>
                            <span class="meta-val" title="${fRelease}">${fRelease}</span>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                        </div>
                        <div class="meta-text">
                            <span class="meta-label">Platform</span>
                            <span class="meta-val" title="${fPlatform}">${fPlatform}</span>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </div>
                        <div class="meta-text">
                            <span class="meta-label">Engine</span>
                            <span class="meta-val" title="${fEngine}">${fEngine}</span>
                        </div>
                    </div>
                `;
            }

            // Update bookmark / favorite state if available
            if (bookmarkBtn && fullData.is_bookmarked !== undefined) {
                bookmarkBtn.classList.toggle('active', !!fullData.is_bookmarked);
            }
            if (favoriteBtn && fullData.is_favorited !== undefined) {
                favoriteBtn.classList.toggle('active', !!fullData.is_favorited);
            }

            // Update detailed description if richer
            if (fullData.detailed_description && fullDesc) {
                fullDesc.innerHTML = formatAboutMarkdown(fullData.detailed_description);
            }
            // System requirements
            const sysReq = fullData.system_requirements || fullData;
            const minTable = document.getElementById('modalSysreqMin');
            const recTable = document.getElementById('modalSysreqRec');
            if (minTable && recTable) {
                if (sysReq && (sysReq.minimum_cpu || sysReq.minimum_gpu || sysReq.minimum_ram || sysReq.operating_system)) {
                    minTable.innerHTML = `
                        <tr><th>OS</th><td>${sysReq.operating_system || '—'}</td></tr>
                        <tr><th>CPU</th><td>${sysReq.minimum_cpu || '—'}</td></tr>
                        <tr><th>GPU</th><td>${sysReq.minimum_gpu || '—'}</td></tr>
                        <tr><th>RAM</th><td>${sysReq.minimum_ram || '—'}</td></tr>
                        <tr><th>Storage</th><td>${sysReq.minimum_storage || '—'}</td></tr>
                    `;
                    recTable.innerHTML = `
                        <tr><th>OS</th><td>${sysReq.operating_system || '—'}</td></tr>
                        <tr><th>CPU</th><td>${sysReq.recommended_cpu || '—'}</td></tr>
                        <tr><th>GPU</th><td>${sysReq.recommended_gpu || '—'}</td></tr>
                        <tr><th>RAM</th><td>${sysReq.recommended_ram || '—'}</td></tr>
                        <tr><th>Storage</th><td>${sysReq.recommended_storage || '—'}</td></tr>
                    `;
                } else {
                    minTable.innerHTML = '<tr><td colspan="2" style="color:rgba(255,255,255,0.45); padding:16px 0;">No minimum system requirements recorded.</td></tr>';
                    recTable.innerHTML = '<tr><td colspan="2" style="color:rgba(255,255,255,0.45); padding:16px 0;">No recommended system requirements recorded.</td></tr>';
                }
            }

            // Related games
            if (window.__ALL_GAMES__ && document.getElementById('modalRelatedGamesGrid')) {
                const currentGenres = (fullData.genres || []).map(g => (typeof g === 'object' ? g.genre_name : g));
                const related = window.__ALL_GAMES__.filter(g => {
                    const gid = g.id || g.game_id;
                    if (String(gid) === String(gameId)) return false;
                    const gGenres = (g.genres || []).map(item => (typeof item === 'object' ? item.genre_name : item));
                    return currentGenres.some(cg => gGenres.includes(cg));
                }).slice(0, 4);

                renderGameGrid(related.length ? related : window.__ALL_GAMES__.filter(g => String(g.id || g.game_id) !== String(gameId)).slice(0, 4), 'modalRelatedGamesGrid');
            }
        }).catch(err => console.error('Error fetching full game info:', err));
    }

    /**
     * MAIN OPEN FUNCTION: Smooth Cinematic FLIP Shared-Element Transition
     */
    window.openGameDetail = function(cardElement, gameData) {
        if (isTransitioning) return;

        const targetGid = (gameData && (gameData.id || gameData.game_id)) || (cardElement && cardElement.dataset.gameId);

        // If gameData is not provided or missing full details, look it up in __ALL_GAMES__
        if (targetGid && window.__ALL_GAMES__) {
            const found = window.__ALL_GAMES__.find(g => String(g.id || g.game_id) === String(targetGid));
            if (found) {
                gameData = { ...found, ...(gameData || {}) };
            }
        }
        if (!gameData && cardElement) {
            const gid = cardElement.dataset.gameId;
            if (window.__ALL_GAMES__) {
                gameData = window.__ALL_GAMES__.find(g => String(g.id || g.game_id) === String(gid));
            }
        }
        if (!gameData && targetGid) {
            gameData = { id: targetGid };
        }
        if (!gameData) return;

        const gameId = gameData.id || gameData.game_id;

        // If detail is already open, smoothly switch games
        if (isDetailOpen) {
            if (activeGameData && String(activeGameData.id || activeGameData.game_id) === String(gameId)) return;
            isTransitioning = true;
            const modalView = document.getElementById('gameDetailModalView');
            if (modalView) {
                modalView.classList.add('content-closing');
                setTimeout(() => {
                    activeGameData = gameData;
                    populateModalContent(gameData);
                    modalView.scrollTop = 0;
                    modalView.classList.remove('content-closing');
                    modalView.classList.add('content-revealed');
                    try {
                        history.pushState({ gameId, isDetailOpen: true }, '', `?game=${gameId}`);
                    } catch (e) {}
                    isTransitioning = false;
                }, 220);
            }
            return;
        }

        // If cardElement wasn't passed directly (e.g. from search), find it in DOM
        if (!cardElement) {
            cardElement = document.querySelector(`.poster-card[data-game-id="${gameId}"], .game-card[data-game-id="${gameId}"]`);
        }

        isTransitioning = true;
        activeCardElement = cardElement;
        activeGameData = gameData;

        // Populate detail view data
        populateModalContent(gameData);

        const scrim = document.getElementById('detailBackdropScrim');
        const modalView = document.getElementById('gameDetailModalView');
        const backgroundShell = document.querySelector('.universe-shell') || document.getElementById('hero');
        const carouselSection = document.getElementById('my-collection');
        const favoritesSection = document.getElementById('favorites');
        const playingSection = document.getElementById('currently-playing');
        const footerEl = document.querySelector('.site-footer');

        // Background elements to dim
        const dimElements = [backgroundShell, carouselSection, favoritesSection, playingSection, footerEl].filter(Boolean);

        const accentColor = getGameAccentColor(gameData);
        const gameTitle = gameData.name || gameData.game_name || 'Game';

        // 1. Create Transition Overlay
        const overlay = document.createElement('div');
        overlay.id = 'transitionOverlay';
        overlay.className = 'transition-overlay';
        overlay.style.background = `radial-gradient(circle at 50% 50%, ${accentColor}25 0%, rgba(2, 11, 16, 0.85) 60%, rgba(2, 11, 16, 0.98) 100%)`;

        const radialGlow = document.createElement('div');
        radialGlow.className = 'transition-radial-glow';
        radialGlow.style.background = `radial-gradient(circle, ${accentColor}35 0%, transparent 70%)`;
        overlay.appendChild(radialGlow);

        const panel = document.createElement('div');
        panel.className = 'transition-expanding-panel glass-panel';
        panel.style.background = `linear-gradient(135deg, ${accentColor}20, rgba(7, 5, 10, 0.95))`;
        panel.style.borderColor = `${accentColor}40`;
        panel.style.boxShadow = `0 0 60px ${accentColor}35, 0 25px 60px rgba(0, 0, 0, 0.85)`;

        const textWrap = document.createElement('div');
        textWrap.className = 'transition-title-wrap';
        textWrap.innerHTML = `
            <span style="font-family: var(--font-heading); font-size: 0.85rem; letter-spacing: 6px; color: ${accentColor}; text-transform: uppercase; margin-bottom: 8px; text-shadow: 0 0 16px ${accentColor}; font-weight: 600;">ENTERING</span>
            <h1 style="font-family: var(--font-heading); font-size: clamp(2rem, 5.5vw, 4rem); font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin: 0; text-shadow: 0 0 35px ${accentColor}80, 0 4px 20px rgba(0,0,0,0.9); line-height: 1.1;">${gameTitle}</h1>
        `;
        panel.appendChild(textWrap);

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'transition-particles-container';
        panel.appendChild(particlesContainer);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // 2. Dim background elements & activate scrim
        dimElements.forEach(el => el.classList.add('universe-dimmed'));
        if (scrim) scrim.classList.add('active');

        // Phase 1: Expanding (0–500ms): Small 280x320 rectangle rapidly grows to 100vw x 100vh
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                panel.classList.add('expanded');
            });
        });

        // Phase 2: Holding (500–800ms): Holds full-screen for 300ms, title fades in, 12 particles streak outward
        setTimeout(() => {
            textWrap.classList.add('visible');

            // 12 colored particle dots streaking outward from center
            const numParticles = 12;
            for (let i = 0; i < numParticles; i++) {
                const dot = document.createElement('div');
                dot.className = 'transition-particle-dot';
                dot.style.background = accentColor;
                dot.style.boxShadow = `0 0 10px ${accentColor}, 0 0 20px ${accentColor}`;

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

        // Phase 3: Fading (800–1200ms): Overlay and background radial glow fade out
        setTimeout(() => {
            overlay.style.opacity = '0';
            radialGlow.style.opacity = '0';
            textWrap.style.opacity = '0';
            textWrap.style.transform = 'scale(1.06)';

            // Prepare details page to be revealed
            if (modalView) {
                modalView.scrollTop = 0;
                modalView.classList.remove('content-closing');
                modalView.classList.add('active');
                modalView.classList.add('content-revealed');
            }
            const globalHeader = document.getElementById('globalHeader') || document.querySelector('.floating-header');
            if (globalHeader) globalHeader.classList.remove('scrolled');
        }, 800);

        // Phase 4: Complete (1200ms): Swaps view to details page and scrolls to top
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = 'hidden';
            if (modalView) modalView.scrollTop = 0;

            try {
                history.pushState({ gameId, isDetailOpen: true }, '', `?game=${gameId}`);
            } catch (e) {}

            isTransitioning = false;
            isDetailOpen = true;
            window.isDetailOpen = true;
        }, 1200);
    };

    /**
     * MAIN CLOSE FUNCTION: Smooth Fade-out back to collection
     */
    window.closeGameDetail = function() {
        if (isTransitioning || !isDetailOpen) return;

        isTransitioning = true;
        const modalView = document.getElementById('gameDetailModalView');
        const scrim = document.getElementById('detailBackdropScrim');
        const backgroundShell = document.querySelector('.universe-shell') || document.getElementById('hero');
        const carouselSection = document.getElementById('my-collection');
        const favoritesSection = document.getElementById('favorites');
        const playingSection = document.getElementById('currently-playing');
        const footerEl = document.querySelector('.site-footer');
        const dimElements = [backgroundShell, carouselSection, favoritesSection, playingSection, footerEl].filter(Boolean);

        // 1. Fade out modal view & scrim
        if (modalView) {
            modalView.classList.add('content-closing');
        }
        if (scrim) scrim.classList.remove('active');

        // 2. Un-dim background elements
        setTimeout(() => {
            if (modalView) {
                modalView.classList.remove('active');
                modalView.classList.remove('content-revealed');
                modalView.classList.remove('content-closing');
            }
            dimElements.forEach(el => el.classList.remove('universe-dimmed'));
            if (activeCardElement) {
                activeCardElement.style.visibility = 'visible';
            }
            document.body.style.overflow = '';

            // Restore URL to home
            try {
                history.pushState({}, '', window.location.pathname);
            } catch (e) {}

            const globalHeader = document.getElementById('globalHeader') || document.querySelector('.floating-header');
            if (globalHeader) {
                if (window.scrollY > 15) globalHeader.classList.add('scrolled');
                else globalHeader.classList.remove('scrolled');
            }

            isTransitioning = false;
            isDetailOpen = false;
            window.isDetailOpen = false;
            activeCardElement = null;
            activeGameData = null;
        }, 280);
    };

    // ── Global Event Bindings ──
    document.addEventListener('DOMContentLoaded', () => {
        // Close on scrim click
        const scrim = document.getElementById('detailBackdropScrim');
        if (scrim) {
            scrim.addEventListener('click', () => window.closeGameDetail());
        }

        // Modal Navbar: logo closes the game view (same convention as the global brand logo)
        const modalNavLogo = document.getElementById('modalNavLogo');
        if (modalNavLogo) {
            modalNavLogo.addEventListener('click', (e) => {
                if (isDetailOpen) {
                    e.preventDefault();
                    window.closeGameDetail();
                }
            });
        }

        // Modal Navbar: search opens the spotlight overlay (search.js on both pages)
        const modalNavSearch = document.getElementById('modalNavSearch');
        if (modalNavSearch) {
            modalNavSearch.addEventListener('click', () => {
                if (typeof window.openSpotlightSearch === 'function') {
                    window.openSpotlightSearch();
                } else {
                    const searchToggle = document.getElementById('searchToggle');
                    if (searchToggle) searchToggle.click();
                }
            });
        }

        // Close on back pill or close button
        const backBtn = document.getElementById('modalBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.closeGameDetail();
            });
        }

        // Modal Admin More-Menu (Edit / Delete) Toggle
        const modalAdminToggle = document.getElementById('modalAdminMenuToggle');
        const modalAdminDropdown = document.getElementById('modalAdminMenuDropdown');
        if (modalAdminToggle && modalAdminDropdown) {
            modalAdminToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof isAdmin === 'function' && !isAdmin()) return;
                modalAdminDropdown.classList.toggle('hidden');
            });
            document.addEventListener('click', () => {
                if (modalAdminDropdown && !modalAdminDropdown.classList.contains('hidden')) {
                    modalAdminDropdown.classList.add('hidden');
                }
            });

            const modalEditBtn = document.getElementById('modalEditGameBtn');
            if (modalEditBtn) {
                modalEditBtn.addEventListener('click', () => {
                    if (typeof requireAdmin === 'function' && !requireAdmin('edit game')) return;
                    if (!activeGameData) return;
                    const gid = activeGameData.id || activeGameData.game_id;
                    // Stay on the current page (both index.html and library.html carry the full edit form)
                    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                    window.location.href = `${currentPage}?edit=${gid}`;
                });
            }

            const modalDeleteBtn = document.getElementById('modalDeleteGameBtn');
            if (modalDeleteBtn) {
                modalDeleteBtn.addEventListener('click', async () => {
                    if (typeof requireAdmin === 'function' && !requireAdmin('delete game')) return;
                    if (!activeGameData) return;
                    const gid = activeGameData.id || activeGameData.game_id;
                    const title = activeGameData.game_name || activeGameData.name || 'this game';
                    if (confirm(`Are you sure you want to delete "${title}"?`)) {
                        try {
                            await apiDelete(`/games/${gid}`);
                            window.closeGameDetail();
                            window.location.reload();
                        } catch (e) {
                            alert(e.message || 'Error deleting game. Please ensure you are logged in as admin.');
                        }
                    }
                });
            }
        }

        // Close on Escape key (but not while the spotlight search overlay is open on top)
        document.addEventListener('keydown', (e) => {
            const searchOverlay = document.getElementById('searchOverlay');
            if (searchOverlay && !searchOverlay.classList.contains('hidden')) return;
            if (e.key === 'Escape' && isDetailOpen && !isTransitioning) {
                window.closeGameDetail();
            }
        });

        // Handle Browser Back / Forward buttons
        window.addEventListener('popstate', (e) => {
            if (isDetailOpen && (!e.state || !e.state.isDetailOpen)) {
                window.closeGameDetail();
            } else if (!isDetailOpen && e.state && e.state.gameId) {
                window.openGameDetail(null, { id: e.state.gameId });
            }
        });

        // Modal Tab Switching Logic
        const tabs = document.querySelectorAll('[data-modal-tab]');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-modal-tab');
                tabs.forEach(t => t.classList.toggle('active', t === tab));
                const panels = document.querySelectorAll('.game-detail-modal-view .tab-panel');
                panels.forEach(p => p.classList.toggle('active', p.id === `modalTab-${targetTab}`));
            });
        });

        // Modal Bookmark Toggle
        const modalBookmarkBtn = document.getElementById('modalBookmarkBtn');
        if (modalBookmarkBtn) {
            modalBookmarkBtn.addEventListener('click', async () => {
                if (typeof requireAdmin === 'function' && !requireAdmin('bookmark games')) return;
                if (!activeGameData) return;
                const gid = activeGameData.id || activeGameData.game_id;
                const current = modalBookmarkBtn.classList.contains('active');
                const nextState = !current;
                modalBookmarkBtn.classList.toggle('active', nextState);
                activeGameData.is_bookmarked = nextState;
                activeGameData.bookmarked = nextState;
                if (window.__ALL_GAMES__) {
                    const match = window.__ALL_GAMES__.find(g => (g.id || g.game_id) == gid);
                    if (match) { match.is_bookmarked = nextState; match.bookmarked = nextState; }
                }

                // Sync card if present
                if (activeCardElement) {
                    const cardBookmark = activeCardElement.querySelector('.bookmark-toggle');
                    if (cardBookmark) cardBookmark.classList.toggle('active', nextState);
                }

                if (typeof window.refreshStats === 'function') window.refreshStats();
                if (typeof window.updateCollectionCore === 'function' && window.__ALL_GAMES__) {
                    window.updateCollectionCore(window.__ALL_GAMES__);
                }

                try {
                    if (typeof apiPatch === 'function') {
                        await apiPatch(`/games/${gid}/status`, { is_bookmarked: nextState });
                    }
                } catch (err) {
                    console.error('Failed to update bookmark:', err);
                }
            });
        }

        // Modal Favorite Toggle
        const modalFavoriteBtn = document.getElementById('modalFavoriteBtn');
        if (modalFavoriteBtn) {
            modalFavoriteBtn.addEventListener('click', async () => {
                if (typeof requireAdmin === 'function' && !requireAdmin('favorite games')) return;
                if (!activeGameData) return;
                const gid = activeGameData.id || activeGameData.game_id;
                const current = modalFavoriteBtn.classList.contains('active');
                const nextState = !current;
                modalFavoriteBtn.classList.toggle('active', nextState);
                activeGameData.is_favorited = nextState;
                activeGameData.favorited = nextState;
                if (window.__ALL_GAMES__) {
                    const match = window.__ALL_GAMES__.find(g => (g.id || g.game_id) == gid);
                    if (match) { match.is_favorited = nextState; match.favorited = nextState; }
                }

                if (typeof window.refreshGrids === 'function') window.refreshGrids();
                if (typeof window.updateCollectionCore === 'function' && window.__ALL_GAMES__) {
                    window.updateCollectionCore(window.__ALL_GAMES__);
                }

                try {
                    if (typeof apiPatch === 'function') {
                        await apiPatch(`/games/${gid}/status`, { is_favorited: nextState });
                    }
                } catch (err) {
                    console.error('Failed to update favorite:', err);
                }
            });
        }

        // Modal Status Selector Buttons
        const modalStatusSelector = document.getElementById('modalStatusSelector');
        if (modalStatusSelector) {
            const btns = modalStatusSelector.querySelectorAll('.status-choice-btn');
            btns.forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (typeof requireAdmin === 'function' && !requireAdmin('change play status')) return;
                    if (!activeGameData) return;
                    const gid = activeGameData.id || activeGameData.game_id;
                    const btnVal = btn.getAttribute('data-val');

                    btns.forEach(b => b.classList.toggle('active', b === btn));
                    activeGameData.play_status = btnVal;
                    if (window.__ALL_GAMES__) {
                        const match = window.__ALL_GAMES__.find(g => (g.id || g.game_id) == gid);
                        if (match) { match.play_status = btnVal; }
                    }

                    const statusTag = document.getElementById('modalStatusTag');
                    if (statusTag) {
                        const conf = statusConfig[btnVal] || statusConfig.not_started;
                        statusTag.textContent = conf.label;
                        statusTag.style.background = conf.tagBg;
                        statusTag.style.color = conf.tagColor;
                        statusTag.style.borderColor = conf.tagBorder;
                    }

                    if (typeof window.refreshStats === 'function') window.refreshStats();
                    if (typeof window.refreshGrids === 'function') window.refreshGrids();
                    if (typeof window.updateCollectionCore === 'function' && window.__ALL_GAMES__) {
                        window.updateCollectionCore(window.__ALL_GAMES__);
                    }

                    try {
                        if (typeof apiPatch === 'function') {
                            await apiPatch(`/games/${gid}/status`, { play_status: btnVal });
                        }
                    } catch (err) {
                        console.error('Failed to update status:', err);
                    }
                });
            });
        }

        // Check if URL has ?game=ID or ?id=ID on initial load
        const urlParams = new URLSearchParams(window.location.search);
        const autoGameId = urlParams.get('game') || urlParams.get('id');
        if (autoGameId) {
            const launchAutoGame = async () => {
                let targetGame = null;
                if (window.__ALL_GAMES__) {
                    targetGame = window.__ALL_GAMES__.find(g => String(g.id || g.game_id) === String(autoGameId));
                }
                if (!targetGame && typeof apiGet === 'function') {
                    targetGame = await apiGet(`/games/${autoGameId}`).catch(() => null);
                }
                if (targetGame) {
                    window.openGameDetail(null, targetGame);
                } else {
                    window.openGameDetail(null, { id: autoGameId });
                }
            };
            setTimeout(launchAutoGame, 180);
        }
    });
})();
