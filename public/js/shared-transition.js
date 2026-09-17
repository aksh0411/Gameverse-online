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
            tagColor: '#bbaedf',
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

        // 8. Fetch detailed data asynchronously for system requirements & related games
        apiGet(`/games/${gameId}`).then(fullData => {
            if (!fullData) return;
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

        // If gameData is not provided, look it up by card dataset or id
        if (!gameData && cardElement) {
            const gid = cardElement.dataset.gameId;
            if (window.__ALL_GAMES__) {
                gameData = window.__ALL_GAMES__.find(g => String(g.id || g.game_id) === String(gid));
            }
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

        // 1. Measure initial card position
        let sourceRect = null;
        let cardRadius = '16px';
        let cardImgSrc = null;
        let cardTitleText = gameData.name || gameData.game_name || 'Game';

        if (cardElement) {
            sourceRect = cardElement.getBoundingClientRect();
            cardRadius = window.getComputedStyle(cardElement).borderRadius || '16px';
            const imgEl = cardElement.querySelector('.poster-img, .card-image img, img');
            if (imgEl) cardImgSrc = imgEl.currentSrc || imgEl.src;
            const titleEl = cardElement.querySelector('.poster-title, .card-title');
            if (titleEl) cardTitleText = titleEl.textContent;

            // Hide original card smoothly
            cardElement.style.visibility = 'hidden';
        } else {
            // Fallback to viewport center if no card element in DOM
            sourceRect = {
                top: window.innerHeight / 2 - 140,
                left: window.innerWidth / 2 - 95,
                width: 190,
                height: 280
            };
        }

        if (!cardImgSrc) {
            const { coverUrl } = resolveGameImages(gameId, gameData.cover_image);
            cardImgSrc = coverUrl;
        }

        // 2. Dim background & fade in translucent blur scrim
        dimElements.forEach(el => el.classList.add('universe-dimmed'));
        if (scrim) scrim.classList.add('active');

        // 3. Compute target destination dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const targetWidth = Math.min(viewportWidth - (viewportWidth <= 600 ? 20 : 40), 1240);
        const targetTop = viewportWidth <= 600 ? 68 : 88;
        const targetLeft = (viewportWidth - targetWidth) / 2;
        // Estimated hero card height inside detail view
        const targetHeight = Math.min(viewportHeight - targetTop - 30, 480);

        // 4. Create the Floating Morph Proxy (The physical card transforming)
        const morph = document.createElement('div');
        morph.id = 'sharedElementMorph';
        morph.className = 'shared-element-morph';
        morph.style.top = `${sourceRect.top}px`;
        morph.style.left = `${sourceRect.left}px`;
        morph.style.width = `${sourceRect.width}px`;
        morph.style.height = `${sourceRect.height}px`;
        morph.style.borderRadius = cardRadius;

        morph.innerHTML = `
            <div class="morph-backdrop">
                <img class="morph-img" src="${cardImgSrc}" alt="${cardTitleText}" />
                <div class="morph-gradient"></div>
            </div>
            <div class="morph-title-wrap">
                <h2 class="morph-title" style="font-size: ${sourceRect.width > 220 ? '1.2rem' : '0.95rem'}">${cardTitleText}</h2>
            </div>
        `;
        document.body.appendChild(morph);

        // 5. Trigger smooth 60fps morph to destination coordinates
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                morph.style.transition = 'top 600ms cubic-bezier(0.16, 1, 0.3, 1), left 600ms cubic-bezier(0.16, 1, 0.3, 1), width 600ms cubic-bezier(0.16, 1, 0.3, 1), height 600ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 600ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 600ms cubic-bezier(0.16, 1, 0.3, 1)';
                morph.style.top = `${targetTop}px`;
                morph.style.left = `${targetLeft}px`;
                morph.style.width = `${targetWidth}px`;
                morph.style.height = `${targetHeight}px`;
                morph.style.borderRadius = '24px';
                morph.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(122, 53, 168, 0.45)';

                const titleEl = morph.querySelector('.morph-title');
                if (titleEl) {
                    titleEl.style.fontSize = viewportWidth <= 600 ? '2.1rem' : 'clamp(2.4rem, 4vw, 3.2rem)';
                }
            });
        });

        // 6. Settle and reveal the real interactive detail view
        setTimeout(() => {
            if (modalView) {
                modalView.scrollTop = 0;
                modalView.classList.remove('content-closing');
                modalView.classList.add('active');
                modalView.classList.add('content-revealed');
            }

            // Fade out morph proxy cleanly
            morph.style.transition = 'opacity 180ms ease';
            morph.style.opacity = '0';
            setTimeout(() => morph.remove(), 200);

            // Lock body scroll
            document.body.style.overflow = 'hidden';

            // Sync URL history
            try {
                history.pushState({ gameId, isDetailOpen: true }, '', `?game=${gameId}`);
            } catch (e) {}

            isTransitioning = false;
            isDetailOpen = true;
        }, 580);
    };

    /**
     * MAIN CLOSE FUNCTION: Reverse FLIP Morphing back to original card
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

        // 1. Stagger-fade out the extra detail content
        if (modalView) {
            modalView.classList.add('content-closing');
        }

        // 2. Measure current destination / modal rect
        const modalFrame = document.getElementById('modalDetailFrame') || modalView;
        const modalRect = modalFrame ? modalFrame.getBoundingClientRect() : {
            top: 88,
            left: (window.innerWidth - Math.min(window.innerWidth - 40, 1240)) / 2,
            width: Math.min(window.innerWidth - 40, 1240),
            height: 480
        };

        // 3. Re-measure the original card's current position (even if scrolled)
        let targetRect = null;
        let cardRadius = '16px';
        let cardImgSrc = null;
        let cardTitleText = (activeGameData && (activeGameData.name || activeGameData.game_name)) || 'Game';

        if (activeCardElement) {
            targetRect = activeCardElement.getBoundingClientRect();
            cardRadius = window.getComputedStyle(activeCardElement).borderRadius || '16px';
            const imgEl = activeCardElement.querySelector('.poster-img, .card-image img, img');
            if (imgEl) cardImgSrc = imgEl.currentSrc || imgEl.src;
        }

        if (!targetRect) {
            targetRect = {
                top: window.innerHeight / 2 - 140,
                left: window.innerWidth / 2 - 95,
                width: 190,
                height: 280
            };
        }

        if (!cardImgSrc && activeGameData) {
            const { coverUrl } = resolveGameImages(activeGameData.id || activeGameData.game_id, activeGameData.cover_image);
            cardImgSrc = coverUrl;
        }

        // 4. Create reverse morph proxy starting at current modal rect
        const morph = document.createElement('div');
        morph.id = 'sharedElementMorph';
        morph.className = 'shared-element-morph';
        morph.style.top = `${modalRect.top}px`;
        morph.style.left = `${modalRect.left}px`;
        morph.style.width = `${modalRect.width}px`;
        morph.style.height = `${Math.min(modalRect.height, 480)}px`;
        morph.style.borderRadius = '24px';
        morph.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(122, 53, 168, 0.45)';

        morph.innerHTML = `
            <div class="morph-backdrop">
                <img class="morph-img" src="${cardImgSrc}" alt="${cardTitleText}" />
                <div class="morph-gradient"></div>
            </div>
            <div class="morph-title-wrap">
                <h2 class="morph-title" style="font-size: ${window.innerWidth <= 600 ? '2.1rem' : 'clamp(2.4rem, 4vw, 3.2rem)'}">${cardTitleText}</h2>
            </div>
        `;
        document.body.appendChild(morph);

        // Hide full modal view
        if (modalView) {
            modalView.classList.remove('active');
        }

        // 5. Animate morph proxy shrinking back into exact original card
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                morph.style.transition = 'top 500ms cubic-bezier(0.16, 1, 0.3, 1), left 500ms cubic-bezier(0.16, 1, 0.3, 1), width 500ms cubic-bezier(0.16, 1, 0.3, 1), height 500ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 500ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1)';
                morph.style.top = `${targetRect.top}px`;
                morph.style.left = `${targetRect.left}px`;
                morph.style.width = `${targetRect.width}px`;
                morph.style.height = `${targetRect.height}px`;
                morph.style.borderRadius = cardRadius;
                morph.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.4)';

                const titleEl = morph.querySelector('.morph-title');
                if (titleEl) {
                    titleEl.style.fontSize = targetRect.width > 220 ? '1.1rem' : '0.92rem';
                }

                // Fade out scrim & un-dim background
                if (scrim) scrim.classList.remove('active');
                dimElements.forEach(el => el.classList.remove('universe-dimmed'));
            });
        });

        // 6. Finish reverse animation
        setTimeout(() => {
            morph.remove();
            if (activeCardElement) {
                activeCardElement.style.visibility = 'visible';
            }
            document.body.style.overflow = '';

            // Restore URL to home
            try {
                history.pushState({}, '', window.location.pathname);
            } catch (e) {}

            isTransitioning = false;
            isDetailOpen = false;
            activeCardElement = null;
            activeGameData = null;
        }, 510);
    };

    // ── Global Event Bindings ──
    document.addEventListener('DOMContentLoaded', () => {
        // Close on scrim click
        const scrim = document.getElementById('detailBackdropScrim');
        if (scrim) {
            scrim.addEventListener('click', () => window.closeGameDetail());
        }

        // Close on back pill or close button
        const backBtn = document.getElementById('modalBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.closeGameDetail();
            });
        }

        const closeBtn = document.getElementById('modalCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.closeGameDetail();
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
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

                if (typeof window.refreshGrids === 'function') window.refreshGrids();

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

        // Check if URL has ?game=ID on initial load
        const urlParams = new URLSearchParams(window.location.search);
        const autoGameId = urlParams.get('game');
        if (autoGameId) {
            setTimeout(() => {
                window.openGameDetail(null, { id: autoGameId });
            }, 300);
        }
    });
})();
