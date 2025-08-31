-- Test script to verify the migration worked correctly

-- Check if all tables exist
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- Check users table structure
PRAGMA table_info(users);

-- Check articles table structure  
PRAGMA table_info(articles);

-- Check if new tables were created
SELECT COUNT(*) as categories_count FROM categories;
SELECT COUNT(*) as settings_count FROM settings;

-- Verify default data was inserted
SELECT * FROM categories;
SELECT * FROM settings;

-- Check if indexes were created
SELECT name FROM sqlite_master WHERE type='index' ORDER BY name;