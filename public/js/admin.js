document.addEventListener('DOMContentLoaded', async () => {
    // Admin features are mostly for index.html (adding/editing games)
    const addGameModal = document.getElementById('addGameModal');
    const addGameFab = document.getElementById('addGameFab');
    const gameModalClose = document.getElementById('gameModalClose');
    const gameModalCancel = document.getElementById('gameModalCancel');
    const gameForm = document.getElementById('gameForm');
    const imagePreview = document.getElementById('imagePreview');
    const coverImageInput = document.getElementById('coverImageInput');

    if (!addGameModal || !addGameFab || !gameForm) return; // Only execute if elements exist

    // Populate Selects and Checkboxes
    async function loadFormOptions() {
        try {
            // In a real app we'd have /api/developers, /api/genres, etc.
            // Using placeholder fetch calls, they may fail if endpoints don't exist yet, so we catch
            const [devs, pubs, genres, platforms, modes] = await Promise.all([
                apiGet('/developers').catch(() => []),
                apiGet('/publishers').catch(() => []),
                apiGet('/genres').catch(() => []),
                apiGet('/platforms').catch(() => []),
                apiGet('/modes').catch(() => [])
            ]);

            const devSelect = document.getElementById('developerSelect');
            const pubSelect = document.getElementById('publisherSelect');
            devs.forEach(d => devSelect.insertAdjacentHTML('beforeend', `<option value="${d.id}">${d.name}</option>`));
            pubs.forEach(p => pubSelect.insertAdjacentHTML('beforeend', `<option value="${p.id}">${p.name}</option>`));

            const makeCheckboxes = (containerId, items, name) => {
                const container = document.getElementById(containerId);
                items.forEach(item => {
                    const label = document.createElement('label');
                    label.className = 'checkbox-pill';
                    label.innerHTML = `<input type="checkbox" name="${name}" value="${item.id}"> ${item.name}`;
                    label.addEventListener('change', (e) => {
                        if(e.target.checked) label.classList.add('selected');
                        else label.classList.remove('selected');
                    });
                    container.appendChild(label);
                });
            };

            makeCheckboxes('genreCheckboxes', genres, 'genre_ids');
            makeCheckboxes('platformCheckboxes', platforms, 'platform_ids');
            makeCheckboxes('modeCheckboxes', modes, 'mode_ids');

        } catch (e) {
            console.error("Error loading form options", e);
        }
    }
    
    // Only load if admin
    if (isAdmin()) {
        loadFormOptions();
    }

    addGameFab.addEventListener('click', () => {
        gameForm.reset();
        document.getElementById('editGameId').value = '';
        document.getElementById('gameFormTitle').textContent = 'Add New Game';
        document.querySelectorAll('.checkbox-pill').forEach(l => l.classList.remove('selected'));
        imagePreview.innerHTML = 'No image selected';
        addGameModal.classList.remove('hidden');
    });

    const closeModal = () => addGameModal.classList.add('hidden');
    gameModalClose.addEventListener('click', closeModal);
    gameModalCancel.addEventListener('click', closeModal);

    // Image preview
    coverImageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            }
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = 'No image selected';
        }
    });

    // Handle Form Submit
    gameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const editId = document.getElementById('editGameId').value;
        const formData = new FormData();

        const gameName = document.getElementById('f_name').value.trim();
        if (!gameName) {
            alert("Game Name is required.");
            return;
        }

        formData.append('game_name', gameName);
        formData.append('description', document.getElementById('f_description').value || '');
        formData.append('release_date', document.getElementById('f_release_date').value || '');
        formData.append('rating', document.getElementById('f_rating').value || '');
        formData.append('price', document.getElementById('f_price').value || '');
        formData.append('is_free_to_play', document.getElementById('f_is_free_to_play').checked ? 'true' : 'false');
        formData.append('game_engine', document.getElementById('f_engine').value || '');
        formData.append('play_status', document.getElementById('f_play_status').value || 'not_started');
        formData.append('is_bookmarked', document.getElementById('f_is_bookmarked').checked ? 'true' : 'false');
        formData.append('is_favorited', document.getElementById('f_is_favorited').checked ? 'true' : 'false');
        
        const devVal = document.getElementById('developerSelect').value;
        if (devVal) formData.append('developer_id', devVal);
        const pubVal = document.getElementById('publisherSelect').value;
        if (pubVal) formData.append('publisher_id', pubVal);

        const getCheckedValues = (name) => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(cb => parseInt(cb.value))
            .filter(n => !isNaN(n));

        formData.append('genre_ids', JSON.stringify(getCheckedValues('genre_ids')));
        formData.append('platform_ids', JSON.stringify(getCheckedValues('platform_ids')));
        formData.append('mode_ids', JSON.stringify(getCheckedValues('mode_ids')));
        formData.append('story_type_ids', JSON.stringify([]));

        const sysReq = {
            operating_system: document.getElementById('f_os')?.value || '',
            minimum_cpu: document.getElementById('f_min_cpu')?.value || '',
            minimum_gpu: document.getElementById('f_min_gpu')?.value || '',
            minimum_ram: document.getElementById('f_min_ram')?.value || '',
            minimum_storage: document.getElementById('f_min_storage')?.value || '',
            recommended_cpu: document.getElementById('f_rec_cpu')?.value || '',
            recommended_gpu: document.getElementById('f_rec_gpu')?.value || '',
            recommended_ram: document.getElementById('f_rec_ram')?.value || '',
            recommended_storage: document.getElementById('f_rec_storage')?.value || ''
        };
        formData.append('sys_req', JSON.stringify(sysReq));

        const fileInput = document.getElementById('coverImageInput');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            formData.append('cover_image', fileInput.files[0]);
        }
        
        try {
            if (editId) {
                // Update
                await apiPut(`/games/${editId}`, formData, true);
                alert("Game updated successfully!");
            } else {
                // Create
                await apiPost('/games', formData, true);
                alert("Game added successfully!");
            }
            closeModal();
            window.location.reload();
        } catch (err) {
            alert(`Error saving game: ${err.message}`);
        }
    });

    // Check if we arrived from edit redirect
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId && isAdmin()) {
        try {
            const game = await apiGet(`/games/${editId}`);
            
            document.getElementById('editGameId').value = game.id;
            document.getElementById('gameFormTitle').textContent = 'Edit Game';
            
            // Populate basic info
            document.getElementById('f_name').value = game.name || '';
            document.getElementById('f_release_date').value = game.release_date || '';
            document.getElementById('f_rating').value = game.rating || '';
            document.getElementById('f_price').value = game.price || '';
            document.getElementById('f_engine').value = game.engine || '';
            document.getElementById('f_description').value = game.description || '';
            document.getElementById('f_is_free_to_play').checked = game.is_free_to_play;
            
            // System requirements
            document.getElementById('f_os').value = game.operating_system || '';
            document.getElementById('f_min_cpu').value = game.minimum_cpu || '';
            document.getElementById('f_min_gpu').value = game.minimum_gpu || '';
            document.getElementById('f_min_ram').value = game.minimum_ram || '';
            document.getElementById('f_min_storage').value = game.minimum_storage || '';
            document.getElementById('f_rec_cpu').value = game.recommended_cpu || '';
            document.getElementById('f_rec_gpu').value = game.recommended_gpu || '';
            document.getElementById('f_rec_ram').value = game.recommended_ram || '';
            document.getElementById('f_rec_storage').value = game.recommended_storage || '';
            
            // Statuses
            document.getElementById('f_play_status').value = game.play_status || 'not_started';
            document.getElementById('f_is_bookmarked').checked = game.is_bookmarked;
            document.getElementById('f_is_favorited').checked = game.is_favorited;

            // Wait for selects to populate
            setTimeout(() => {
                if(game.developer_id) document.getElementById('developerSelect').value = game.developer_id;
                if(game.publisher_id) document.getElementById('publisherSelect').value = game.publisher_id;
                
                // Select checkboxes (genres, platforms, modes)
                const selectPills = (items, name) => {
                    if(!items) return;
                    const ids = items.map(i => (typeof i === 'object' && i !== null ? (i.id || i.genre_id || i.platform_id || i.mode_id) : i).toString());
                    const inputs = document.querySelectorAll(`input[name="${name}"]`);
                    inputs.forEach(input => {
                        if (ids.includes(input.value)) {
                            input.checked = true;
                            input.parentElement.classList.add('selected');
                        }
                    });
                };
                selectPills(game.genres, 'genre_ids');
                selectPills(game.platforms, 'platform_ids');
                selectPills(game.modes, 'mode_ids');
            }, 500);

            if (game.cover_image) {
                imagePreview.innerHTML = `<img src="${game.cover_image}" alt="Preview">`;
            }

            addGameModal.classList.remove('hidden');

            // Remove param from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
        } catch (e) {
            console.error("Failed to load game for editing", e);
        }
    }
});
