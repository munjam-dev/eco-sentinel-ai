-- =============================================================================
-- EcoSentinel AI — Production Supabase PostgreSQL Schema
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USERS & ROLES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'operator', -- admin, operator, viewer, field_responder
    organization VARCHAR(255) DEFAULT 'Disaster Response Authority',
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. NODES TABLE (Edge Sensors)
-- =============================================================================
CREATE TABLE IF NOT EXISTS nodes (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'NODE-01', 'NODE-02'
    name VARCHAR(255) NOT NULL,
    disaster_type VARCHAR(50) NOT NULL, -- 'flood', 'fire', 'air_pollution'
    status VARCHAR(50) DEFAULT 'online', -- 'online', 'offline', 'warning', 'maintenance'
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    battery_level DOUBLE PRECISION DEFAULT 100.0,
    firmware_version VARCHAR(50) DEFAULT 'v2.4.0',
    protocol VARCHAR(50) DEFAULT 'wifi', -- 'wifi', 'lora_mesh', 'cellular'
    rssi INTEGER DEFAULT -65,
    health_score DOUBLE PRECISION DEFAULT 98.0,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. SENSOR READINGS TABLE (High-frequency Time-Series)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id VARCHAR(50) REFERENCES nodes(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Hydrological metrics
    water_level DOUBLE PRECISION,
    rain_rate DOUBLE PRECISION,
    
    -- Atmospheric & thermal metrics
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    mq2_smoke DOUBLE PRECISION,
    mq135_air_quality DOUBLE PRECISION,
    flame_detected DOUBLE PRECISION DEFAULT 0.0,
    
    -- Air particulate metrics
    pm25 DOUBLE PRECISION,
    pm10 DOUBLE PRECISION,
    co2_level DOUBLE PRECISION,
    
    -- Hardware telemetry
    battery_level DOUBLE PRECISION DEFAULT 100.0,
    rssi INTEGER DEFAULT -65,
    protocol VARCHAR(50) DEFAULT 'wifi',
    calculated_risk_score DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hyper-optimized time-series indexes
CREATE INDEX IF NOT EXISTS idx_sensor_readings_node_time ON sensor_readings(node_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_time ON sensor_readings(timestamp DESC);

-- =============================================================================
-- 4. ALERTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id VARCHAR(50) REFERENCES nodes(id) ON DELETE CASCADE,
    disaster_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    risk_score DOUBLE PRECISION NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_active_severity ON alerts(is_active, severity, created_at DESC);

-- =============================================================================
-- 5. AI PREDICTIONS TABLE (Explainable AI Engine)
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id VARCHAR(50) REFERENCES nodes(id) ON DELETE CASCADE,
    hazard_type VARCHAR(50) NOT NULL,
    risk_score DOUBLE PRECISION NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 95.0,
    risk_category VARCHAR(50) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    explanation TEXT NOT NULL,
    feature_importances JSONB, -- Mathematical feature weightings
    recommended_action TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_predictions_node ON ai_predictions(node_id, timestamp DESC);

-- =============================================================================
-- 6. NODE HEALTH TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS node_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id VARCHAR(50) REFERENCES nodes(id) ON DELETE CASCADE,
    battery_level DOUBLE PRECISION NOT NULL,
    signal_quality INTEGER NOT NULL,
    packet_loss_rate DOUBLE PRECISION DEFAULT 0.0,
    uptime_seconds BIGINT DEFAULT 86400,
    status VARCHAR(50) DEFAULT 'healthy', -- 'healthy', 'degraded', 'failing', 'critical'
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_node_health_node ON node_health(node_id, recorded_at DESC);

-- =============================================================================
-- 7. SYSTEM SETTINGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general', -- 'thresholds', 'notifications', 'ai', 'network'
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. NOTIFICATION LOGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL, -- 'websocket', 'browser_toast', 'email', 'sms', 'webhook'
    recipient VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'delivered', -- 'pending', 'delivered', 'failed'
    payload JSONB,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. SYSTEM LOGS & AUDIT TRAIL TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) DEFAULT 'INFO', -- 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
    component VARCHAR(100) NOT NULL, -- 'INGESTION', 'AI_ENGINE', 'WEBSOCKET', 'ALERT_DISPATCH'
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at DESC);
