-- SentinelX 2.0 additive telemetry migration (PostgreSQL).
-- Apply once to the existing sensor_data table. All columns are nullable for backward compatibility.
BEGIN;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS pressure_hpa DOUBLE PRECISION;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS rain_raw INTEGER;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS rain_detected BOOLEAN;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS water_sensor_valid BOOLEAN;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS climate_sensor_valid BOOLEAN;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS mq2_raw INTEGER;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS mq2_digital_alarm BOOLEAN;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS mq2_units VARCHAR(24);
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS battery_voltage DOUBLE PRECISION;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS rssi INTEGER;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS protocol VARCHAR(16);
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS firmware_version VARCHAR(32);
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS gps_latitude DOUBLE PRECISION;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS gps_longitude DOUBLE PRECISION;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS gps_fix_valid BOOLEAN;
ALTER TABLE sensor_data ADD COLUMN IF NOT EXISTS sequence_number INTEGER;
COMMIT;

-- Rollback (manual, only if no data in these columns needs preserving):
-- ALTER TABLE sensor_data DROP COLUMN IF EXISTS pressure_hpa, DROP COLUMN IF EXISTS rain_raw,
--   DROP COLUMN IF EXISTS rain_detected, DROP COLUMN IF EXISTS water_sensor_valid,
--   DROP COLUMN IF EXISTS climate_sensor_valid, DROP COLUMN IF EXISTS mq2_raw,
--   DROP COLUMN IF EXISTS mq2_digital_alarm, DROP COLUMN IF EXISTS mq2_units,
--   DROP COLUMN IF EXISTS battery_voltage, DROP COLUMN IF EXISTS rssi, DROP COLUMN IF EXISTS protocol,
--   DROP COLUMN IF EXISTS firmware_version, DROP COLUMN IF EXISTS gps_latitude,
--   DROP COLUMN IF EXISTS gps_longitude, DROP COLUMN IF EXISTS gps_fix_valid, DROP COLUMN IF EXISTS sequence_number;
