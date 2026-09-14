// ===== GAMEVERSE Game Detail Page Controller =====
// Matches screenshot UI: Overview strip, 2-col split, tabs, and status changer

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    
    if (!gameId) {
        document.getElementById('gameName').textContent = 'Game Not Found';
        return;
    }

    // Status styling configs matching screenshot
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

    let gameData = null;

    try {
        gameData = await apiGet(`/games/${gameId}`);
        
        const gameTitle = gameData.game_name || gameData.name || 'Untitled Game';
        const gameDesc = gameData.description || 'No description provided.';
        const playStatus = (gameData.play_status || 'not_started').toLowerCase();

        // 1. Populate Hero Content
        document.getElementById('gameName').textContent = gameTitle;
        document.getElementById('gameDescription').textContent = gameDesc;
        
        // Artwork Background
        const heroBg = document.getElementById('gameHeroBg');
        const heroImg = document.getElementById('gameHeroImg');
        
        const heroFile = `hero_${gameId}.jpg`;
        const coverFile = (gameData.cover_image || `game_${gameId}.jpg`).split('/').pop();
        
        // Candidate paths guaranteed to resolve across Live Server, FastAPI, and file protocols
        const imgCandidates = [
            `static/images/${heroFile}`,
            `/frontend/static/images/${heroFile}`,
            `/static/images/${heroFile}`,
            `static/images/${coverFile}`,
            `/frontend/static/images/${coverFile}`,
            `/static/images/${coverFile}`,
            `http://localhost:8000/static/images/${heroFile}`,
            `http://localhost:8000/static/images/${coverFile}`
        ];

        if (heroImg) {
            let candidateIdx = 0;
            heroImg.onerror = function() {
                candidateIdx++;
                if (candidateIdx < imgCandidates.length) {
                    this.src = imgCandidates[candidateIdx];
                }
            };
            heroImg.onload = function() {
                this.style.opacity = '0.95';
                if (heroBg) heroBg.style.display = 'block';
            };
            heroImg.src = imgCandidates[0];
        } else if (heroBg) {
            heroBg.style.backgroundImage = `url('static/images/${heroFile}')`;
            heroBg.style.display = 'block';
        }

        // Status Tag Pill
        const statusTag = document.getElementById('gameStatusTag');
        if (statusTag) {
            const conf = statusConfig[playStatus] || statusConfig.not_started;
            statusTag.textContent = conf.label;
            statusTag.style.background = conf.tagBg;
            statusTag.style.color = conf.tagColor;
            statusTag.style.borderColor = conf.tagBorder;
        }

        // 2. Bookmark Button Toggle
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        if (bookmarkBtn) {
            if (gameData.is_bookmarked) bookmarkBtn.classList.add('active');
            bookmarkBtn.addEventListener('click', async () => {
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

                const current = bookmarkBtn.classList.contains('active');
                const nextState = !current;
                bookmarkBtn.classList.toggle('active', nextState);
                gameData.is_bookmarked = nextState;
                try {
                    await apiPatch(`/games/${gameId}/status`, { is_bookmarked: nextState });
                } catch (err) {
                    console.error('Failed to update bookmark:', err);
                    bookmarkBtn.classList.toggle('active', current);
                    gameData.is_bookmarked = current;
                }
            });
        }

        // 2b. Favorite Button Toggle (Heart / Like)
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            if (gameData.is_favorited) favoriteBtn.classList.add('active');
            favoriteBtn.addEventListener('click', async () => {
                if (typeof requireAdmin === 'function' && !requireAdmin('like or favorite games')) {
                    return;
                } else if (typeof isAdmin === 'function' && !isAdmin()) {
                    if (typeof openLoginModal === 'function') {
                        openLoginModal('Admin login required to like games.');
                    } else {
                        alert('Admin login required to like games.');
                    }
                    return;
                }

                const current = favoriteBtn.classList.contains('active');
                const nextState = !current;
                favoriteBtn.classList.toggle('active', nextState);
                gameData.is_favorited = nextState;
                try {
                    await apiPatch(`/games/${gameId}/status`, { is_favorited: nextState });
                } catch (err) {
                    console.error('Failed to update favorite:', err);
                    favoriteBtn.classList.toggle('active', current);
                    gameData.is_favorited = current;
                }
            });
        }

        // 3. Format Lists & Strings
        const formatList = (arr) => {
            if (!arr || arr.length === 0) return '—';
            return arr.map(item => (typeof item === 'object' && item !== null) ? (item.name || item.genre_name || item.platform_name || item.mode_name || item.story_type || JSON.stringify(item)) : String(item)).join(', ');
        };

        const devName = gameData.developer ? (gameData.developer.developer_name || gameData.developer.name || 'Unknown') : 'Unknown';
        const engineName = gameData.game_engine || gameData.engine || 'Unknown';
        const genreStr = formatList(gameData.genres);
        const platformStr = formatList(gameData.platforms);
        const releaseStr = gameData.release_date || 'Unknown';

        // 4. Populate 5-Column Metadata Strip with Icons
        const metaStrip = document.getElementById('quickInfoRow');
        if (metaStrip) {
            metaStrip.innerHTML = `
                <!-- Genre -->
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

                <!-- Developer -->
                <div class="meta-item">
                    <div class="meta-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                        </svg>
                    </div>
                    <div class="meta-text">
                        <span class="meta-label">Developer</span>
                        <span class="meta-val" title="${devName}">${devName}</span>
                    </div>
                </div>

                <!-- Released -->
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

                <!-- Platform -->
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

                <!-- Engine -->
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

        // 5. Populate About This Game (Left Box)
        const fullDescEl = document.getElementById('gameFullDescription');
        if (fullDescEl) {
            const aboutText = gameData.detailed_description || gameData.description || 'No detailed description available.';
            fullDescEl.innerHTML = formatAboutMarkdown(aboutText);
        }

        // 6. Populate My Status Selector (Right Box)
        const statusSelector = document.getElementById('statusSelector');
        if (statusSelector) {
            const btns = statusSelector.querySelectorAll('.status-choice-btn');
            btns.forEach(btn => {
                const btnVal = btn.getAttribute('data-val');
                if (btnVal === playStatus) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
                
                btn.addEventListener('click', async () => {
                    if (typeof requireAdmin === 'function' && !requireAdmin('change play status')) {
                        return;
                    } else if (typeof isAdmin === 'function' && !isAdmin()) {
                        if (typeof openLoginModal === 'function') {
                            openLoginModal('Admin login required to change play status.');
                        } else {
                            alert('Admin login required to change play status.');
                        }
                        return;
                    }

                    const prevBtn = statusSelector.querySelector('.status-choice-btn.active');
                    btns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Update the hero status tag dynamically
                    if (statusTag) {
                        const conf = statusConfig[btnVal] || statusConfig.not_started;
                        statusTag.textContent = conf.label;
                        statusTag.style.background = conf.tagBg;
                        statusTag.style.color = conf.tagColor;
                        statusTag.style.borderColor = conf.tagBorder;
                    }
                    
                    try {
                        await apiPatch(`/games/${gameId}/status`, { play_status: btnVal });
                        gameData.play_status = btnVal;
                    } catch (e) {
                        console.error('Failed to update status', e);
                        if (prevBtn) {
                            btns.forEach(b => b.classList.remove('active'));
                            prevBtn.classList.add('active');
                        }
                    }
                });
            });
        }

        // 7. Populate System Requirements Tab
        const sysReq = gameData.system_requirements || gameData;
        const minTable = document.getElementById('sysreqMin');
        const recTable = document.getElementById('sysreqRec');
        
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

        // 8. Populate Related Games Tab
        try {
            const allGamesRes = await apiGet('/games');
            const allGames = Array.isArray(allGamesRes) ? allGamesRes : (allGamesRes.games || []);
            const relatedGrid = document.getElementById('relatedGamesGrid');
            if (relatedGrid) {
                // Filter games with matching genre or developer (excluding current game)
                const currentGenres = (gameData.genres || []).map(g => (typeof g === 'object' ? g.genre_name : g));
                const related = allGames.filter(g => {
                    const gid = g.id || g.game_id;
                    if (String(gid) === String(gameId)) return false;
                    const gGenres = (g.genres || []).map(item => (typeof item === 'object' ? item.genre_name : item));
                    return currentGenres.some(cg => gGenres.includes(cg));
                }).slice(0, 4);

                if (related.length > 0) {
                    renderGameGrid(related, 'relatedGamesGrid');
                } else {
                    const fallback = allGames.filter(g => String(g.id || g.game_id) !== String(gameId)).slice(0, 4);
                    renderGameGrid(fallback, 'relatedGamesGrid');
                }
            }
        } catch (e) {
            console.error('Error fetching related games', e);
        }

    } catch (err) {
        console.error('Error loading game details', err);
        document.getElementById('gameName').textContent = 'Error Loading Game';
    }

    // 9. Tabs Switching Logic (Overview / System Requirements / Related)
    const tabs = document.querySelectorAll('.detail-tab');
    const panels = document.querySelectorAll('.tab-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const targetId = `tab-${tab.getAttribute('data-tab')}`;
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // 10. Admin Menu Toggle (Edit / Delete / Login)
    const adminMenuToggle = document.getElementById('adminMenuToggle');
    const adminMenuDropdown = document.getElementById('adminMenuDropdown');
    
    if (adminMenuToggle && adminMenuDropdown) {
        if (!isAdmin()) {
            adminMenuDropdown.innerHTML = `
                <button id="adminDetailLoginBtn">🔑 Admin Login</button>
            `;
            const detailLoginBtn = document.getElementById('adminDetailLoginBtn');
            if (detailLoginBtn) {
                detailLoginBtn.addEventListener('click', () => {
                    adminMenuDropdown.classList.add('hidden');
                    if (typeof openLoginModal === 'function') {
                        openLoginModal();
                    }
                });
            }
        } else {
            adminMenuDropdown.innerHTML = `
                <button id="editGameBtn">✏️ Edit Game</button>
                <button id="deleteGameBtn" class="delete-opt">🗑️ Delete Game</button>
                <button id="adminDetailLogoutBtn" style="color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 4px; padding-top: 8px;">🔒 Logout Admin</button>
            `;

            const deleteBtn = document.getElementById('deleteGameBtn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async () => {
                    const title = (gameData && (gameData.game_name || gameData.name)) || 'this game';
                    if (confirm(`Are you sure you want to delete "${title}" from your database?`)) {
                        try {
                            await apiDelete(`/games/${gameId}`);
                            window.location.href = 'index.html';
                        } catch (e) {
                            alert('Error deleting game');
                        }
                    }
                });
            }

            const editBtn = document.getElementById('editGameBtn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    window.location.href = `index.html?edit=${gameId}`;
                });
            }

            const logoutBtn = document.getElementById('adminDetailLogoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('admin_token');
                    window.location.reload();
                });
            }
        }

        adminMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            adminMenuDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', () => adminMenuDropdown.classList.add('hidden'));
    }
});

/**
 * Parses markdown-formatted detailed description into semantic HTML.
 * Handles ### Headings with cyan/magenta diamond accents, paragraphs, **bold**, and *italics*.
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
            const title = headingMatch[1].trim();
            html += `<h3 class="about-subtitle"><span class="about-subtitle-gem">◈</span> ${title}</h3>`;
        } else {
            currentParagraph.push(trimmed);
        }
    }
    flushParagraph();

    return html || `<p class="about-paragraph">${rawText}</p>`;
}

