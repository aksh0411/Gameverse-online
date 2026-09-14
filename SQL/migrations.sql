-- GAMEVERSE Database Migrations
-- Run these against your existing games_db database

-- ============================================
-- Add new columns to the games table
-- ============================================

-- Play status: tracks your personal play state
ALTER TABLE games ADD COLUMN IF NOT EXISTS play_status VARCHAR(20) DEFAULT 'not_started';
-- Valid values: 'not_started', 'playing', 'play_later', 'completed', 'wont_play'

-- Bookmark: "I want to come back to this"
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_bookmarked BOOLEAN DEFAULT FALSE;

-- Favorite: "This is one of my top games"
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_favorited BOOLEAN DEFAULT FALSE;

-- Cover image path (relative to /static/images/)
ALTER TABLE games ADD COLUMN IF NOT EXISTS cover_image VARCHAR(255);

-- Game engine (e.g. 'REDengine 3', 'Unreal Engine 5')
ALTER TABLE games ADD COLUMN IF NOT EXISTS game_engine VARCHAR(100);

-- ============================================
-- Add constraint to validate play_status values
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_play_status'
    ) THEN
        ALTER TABLE games ADD CONSTRAINT chk_play_status
        CHECK (play_status IN ('not_started', 'playing', 'play_later', 'completed', 'wont_play'));
    END IF;
END $$;
