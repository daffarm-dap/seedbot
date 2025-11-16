-- ===================================
-- SeedBot PostgreSQL Database Schema
-- ===================================
-- Version: 1.0
-- Date: 2025-11-06

-- Drop tables if exists (untuk development/testing)
-- HATI-HATI: Uncomment hanya jika ingin reset database!
-- DROP TABLE IF EXISTS user_parameters CASCADE;
-- DROP TABLE IF EXISTS robot_status CASCADE;
-- DROP TABLE IF EXISTS sensor_realtime CASCADE;
-- DROP TABLE IF EXISTS robot_history CASCADE;
-- DROP TABLE IF EXISTS land_data CASCADE;
-- DROP TABLE IF EXISTS mappings CASCADE;
-- DROP TABLE IF EXISTS system_parameters CASCADE;
-- DROP TABLE IF EXISTS news CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ===================================
-- 1. Tabel Users
-- ===================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'petani')),
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ===================================
-- 2. Tabel News (Berita)
-- ===================================
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Published', 'Draft')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);
CREATE INDEX IF NOT EXISTS idx_news_created_by ON news(created_by);

-- ===================================
-- 3. Tabel System Parameters
-- ===================================
CREATE TABLE IF NOT EXISTS system_parameters (
    id SERIAL PRIMARY KEY,
    parameter_name VARCHAR(100) UNIQUE NOT NULL,
    parameter_value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20),
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_system_parameters_name ON system_parameters(parameter_name);

-- Insert default parameters
INSERT INTO system_parameters (parameter_name, parameter_value, unit, description) VALUES
('default_depth', 5.0, 'cm', 'Kedalaman Tanam Default'),
('default_spacing', 20.0, 'cm', 'Jarak Antar Benih Default')
ON CONFLICT (parameter_name) DO NOTHING;

-- ===================================
-- 4. Tabel Mappings (Data Pemetaan Lahan)
-- ===================================
CREATE TABLE IF NOT EXISTS mappings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mapping_name VARCHAR(200) NOT NULL,
    coordinates JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_mappings_user_id ON mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_mappings_created_at ON mappings(created_at DESC);

-- ===================================
-- 5. Tabel Land Data (Data Lahan)
-- ===================================
CREATE TABLE IF NOT EXISTS land_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(200) NOT NULL,
    area VARCHAR(50) NOT NULL,
    crop VARCHAR(100) NOT NULL,
    coordinates VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_land_data_user_id ON land_data(user_id);

-- ===================================
-- 6. Tabel Robot History (Histori Robot)
-- ===================================
CREATE TABLE IF NOT EXISTS robot_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    suhu DECIMAL(5, 2),
    kelembapan DECIMAL(5, 2),
    ph DECIMAL(4, 2),
    nitrogen DECIMAL(6, 2),
    phospor DECIMAL(6, 2),
    kalium DECIMAL(6, 2),
    benih_tertanam INTEGER DEFAULT 0,
    baterai INTEGER,
    status VARCHAR(20) CHECK (status IN ('Layak', 'Tidak Layak')),
    gps_latitude DECIMAL(10, 7),
    gps_longitude DECIMAL(10, 7)
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_robot_history_user_id ON robot_history(user_id);
CREATE INDEX IF NOT EXISTS idx_robot_history_timestamp ON robot_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_robot_history_status ON robot_history(status);

-- ===================================
-- 7. Tabel Sensor Realtime (Data Sensor Real-time)
-- ===================================
CREATE TABLE IF NOT EXISTS sensor_realtime (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    suhu DECIMAL(5, 2),
    kelembapan DECIMAL(5, 2),
    ph DECIMAL(4, 2),
    nitrogen DECIMAL(6, 2),
    phospor DECIMAL(6, 2),
    kalium DECIMAL(6, 2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_sensor_realtime_user_id ON sensor_realtime(user_id);

-- ===================================
-- 8. Tabel Robot Status (Status Robot Real-time)
-- ===================================
CREATE TABLE IF NOT EXISTS robot_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    connection_status VARCHAR(20) DEFAULT 'terhubung' CHECK (connection_status IN ('terhubung', 'terputus')),
    operation_status VARCHAR(50) DEFAULT 'Standby',
    benih_tertanam INTEGER DEFAULT 0,
    baterai INTEGER DEFAULT 100,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_robot_status_user_id ON robot_status(user_id);

-- ===================================
-- 9. Tabel User Parameters (Parameter Penaburan Per User)
-- ===================================
CREATE TABLE IF NOT EXISTS user_parameters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    seeding_depth DECIMAL(5, 2) DEFAULT 5.0,
    hole_spacing DECIMAL(5, 2) DEFAULT 20.0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_user_parameters_user_id ON user_parameters(user_id);

-- ===================================
-- Triggers untuk auto-update updated_at
-- ===================================

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk news
DROP TRIGGER IF EXISTS update_news_updated_at ON news;
CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON news
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk mappings
DROP TRIGGER IF EXISTS update_mappings_updated_at ON mappings;
CREATE TRIGGER update_mappings_updated_at
    BEFORE UPDATE ON mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk land_data
DROP TRIGGER IF EXISTS update_land_data_updated_at ON land_data;
CREATE TRIGGER update_land_data_updated_at
    BEFORE UPDATE ON land_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- Verification Queries
-- ===================================

-- List all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check table structures
-- \d users
-- \d news
-- \d system_parameters

-- ===================================
-- Success Message
-- ===================================
DO $$
BEGIN
    RAISE NOTICE '✅ SeedBot Database Schema created successfully!';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '   1. Run: python migrate_demo_data.py';
    RAISE NOTICE '   2. Start Flask backend: python app.py';
    RAISE NOTICE '   3. Test API endpoints';
END $$;
