import os

files_to_update = {
    'public/css/home.css': [
        ('#c084fc', '#06b6d4'),
        ('#f472b6', '#2dd4bf'),
        ('#a855f7', '#0891b2'),
        ('#ec4899', '#006d77'),
        ('#e9d5ff', '#cffafe'),
        ('#d8b4fe', '#a5f3fc')
    ],
    'public/js/auth.js': [
        ('#e879f9', '#00f5d4')
    ],
    'public/js/collection-core.js': [
        ('#7d6ca8', '#0e7490'),
        ('#9c52cf', '#06b6d4'),
        ('#c084fc', '#06b6d4'),
        ('#f472b6', '#2dd4bf'),
        ('#f0abfc', '#67e8f9'),
        ('#9333ea', '#0369a1'),
        ('#fce7f3', '#ccfbf1'),
        ('#db2777', '#0f766e'),
        ('#a855f7', '#0891b2'),
        ('#080410', '#020810'),
        ('#090514', '#030914')
    ],
    'public/js/game-detail.js': [
        ('#bbaedf', '#67e8f9')
    ],
    'public/js/particle-text.js': [
        ('#8b5cf6', '#0891b2')
    ],
    'public/js/search.js': [
        ('#c66a93', '#2dd4bf')
    ],
    'public/js/shared-transition.js': [
        ('#bbaedf', '#67e8f9')
    ]
}

for filepath, replacements in files_to_update.items():
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements:
            content = content.replace(old, new)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')
