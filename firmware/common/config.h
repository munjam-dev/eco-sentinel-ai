#ifndef ECOSENTINEL_CONFIG_H
#define ECOSENTINEL_CONFIG_H

// =============================================================================
// EcoSentinel AI — Production ESP32 Sensor Network Shared Configuration
// =============================================================================

// WiFi Credentials
#define WIFI_SSID           "YOUR_WIFI_SSID"
#define WIFI_PASSWORD       "YOUR_WIFI_PASSWORD"
#define WIFI_CONNECT_TIMEOUT_MS 15000

// EcoSentinel AI Backend Server Configuration
// Local Development: "http://192.168.1.100:8000/api/v1/node-data"
// Production (Render): "https://ecosentinel-api.onrender.com/api/v1/node-data"
#define BACKEND_API_URL     "http://192.168.1.100:8000/api/v1/node-data"
#define HTTP_TIMEOUT_MS     5000
#define MAX_RETRY_ATTEMPTS  3

// Telemetry Transmission Cadence
#define TELEMETRY_INTERVAL_MS 3000   // Transmit JSON every 3 seconds
#define WATCHDOG_TIMEOUT_SEC  10     // Hardware watchdog reset timeout

// Hardware Thresholds
#define FLOOD_WATER_LEVEL_HIGH_CM   60.0  // cm above baseline considered high risk
#define FLOOD_WATER_LEVEL_MED_CM    40.0  // cm above baseline considered medium risk
#define FLOOD_TEMP_HIGH_C           38.0  // Ambient temperature anomaly threshold
#define FIRE_MQ2_SMOKE_HIGH_PPM     400.0 // Gas / Smoke threshold for danger
#define FIRE_MQ2_SMOKE_MED_PPM      250.0 // Gas warning threshold

#endif // ECOSENTINEL_CONFIG_H
