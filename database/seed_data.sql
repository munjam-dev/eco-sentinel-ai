-- =============================================================================
-- EcoSentinel AI — Supabase Seed Data
-- =============================================================================

-- 1. Seed System Settings & Hazard Thresholds
INSERT INTO settings (key, value, description, category) VALUES
('flood_thresholds', '{"warning_water_level_cm": 40.0, "critical_water_level_cm": 60.0, "rain_rate_mm_hr": 25.0}'::jsonb, 'Hydrological flood alert triggers', 'thresholds'),
('fire_thresholds', '{"warning_smoke_ppm": 250.0, "critical_smoke_ppm": 400.0, "temperature_c": 45.0}'::jsonb, 'Wildfire and gas detection triggers', 'thresholds'),
('air_thresholds', '{"warning_aqi": 150.0, "critical_aqi": 250.0, "pm25_ug_m3": 75.0}'::jsonb, 'Toxic air surge thresholds', 'thresholds'),
('ai_config', '{"model_version": "v3.2-prod", "confidence_threshold": 0.85, "inference_cadence_ms": 3000, "shap_enabled": true}'::jsonb, 'Explainable AI Engine tuning', 'ai')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Seed Default Sensor Nodes
INSERT INTO nodes (id, name, disaster_type, status, latitude, longitude, location_name, zone, battery_level, rssi, health_score) VALUES
('NODE-01', 'Assam River Flood Sensor 01', 'flood', 'online', 26.2006, 92.9376, 'Brahmaputra River Basin, Sector 4', 'Assam Zone A', 95.0, -58, 98.5),
('NODE-02', 'Bandipur Wildfire Perimeter Sensor 02', 'fire', 'online', 11.6664, 76.6292, 'Bandipur Tiger Reserve Ridge', 'Karnataka Zone B', 92.0, -61, 96.0),
('NODE-03', 'Delhi NCR Urban AQI Sensor 03', 'air_pollution', 'online', 28.6139, 77.2090, 'Anand Vihar Industrial Belt', 'Delhi Zone Central', 97.0, -54, 99.0),
('NODE-04', 'Western Ghats Landslide & Flood 04', 'flood', 'online', 13.0827, 75.5262, 'Chikmagalur River Outflow', 'Western Ghats Zone C', 89.0, -68, 94.0)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- 3. Seed Initial Operator User
INSERT INTO users (id, email, full_name, role, organization) VALUES
('00000000-0000-0000-0000-000000000001', 'command@ecosentinel.ai', 'Chief Disaster Response Operator', 'admin', 'National Environmental Defense Grid')
ON CONFLICT (email) DO NOTHING;
