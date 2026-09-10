# EcoSentinel AI — Complete API & Map Reference Manual

Complete reference of all REST endpoints, WebSocket event streams, hardware telemetry protocols, and **OpenLibre / OpenStreetMap** mapping tile services for EcoSentinel AI.

---

## 1. Quick Reference Table

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Hardware Ingest** | `POST` | `/api/v1/node-data` | ESP32 telemetry ingestion (Flood, Fire, Air) |
| **Hardware Ingest** | `POST` | `/api/v1/sensor-data/ingest` | Secondary telemetry ingestion endpoint |
| **Dashboard** | `GET` | `/api/v1/dashboard` | High-level KPIs, active alert counts, online nodes |
| **Nodes** | `GET` | `/api/v1/nodes` | List all sensor nodes with live status |
| **Nodes** | `POST` | `/api/v1/nodes` | Register new hardware node |
| **Nodes** | `GET` | `/api/v1/nodes/{node_id}` | Detailed node health, battery, RSSI, latest reading |
| **Nodes** | `PUT` | `/api/v1/nodes/{node_id}` | Update node metadata or calibration baseline |
| **Nodes** | `DELETE` | `/api/v1/nodes/{node_id}` | Deregister node from monitoring grid |
| **Alerts** | `GET` | `/api/v1/alerts` | Query active & historical alerts with filters |
| **Alerts** | `PATCH` | `/api/v1/alerts/{alert_id}/acknowledge` | Mark alert acknowledged by response operator |
| **Alerts** | `PATCH` | `/api/v1/alerts/{alert_id}/resolve` | Resolve emergency alert with action notes |
| **AI & XAI** | `GET` | `/api/v1/ai/predictions` | Live AI predictions with risk scores & PDI |
| **AI & XAI** | `GET` | `/api/v1/ai/explain/{id}` | SHAP feature weighting & human-readable rationale |
| **Analytics** | `GET` | `/api/v1/analytics` | Aggregated statistics, trends & hazard distributions |
| **History** | `GET` | `/api/v1/history` | Query time-series telemetry over date ranges |
| **GIS Map** | `GET` | `/api/v1/map/nodes` | GeoJSON node feature collection for OpenLibre map |
| **GIS Map** | `GET` | `/api/v1/map/zones` | Danger zones and hazard perimeter polygons |
| **Reports** | `POST` | `/api/v1/reports/generate` | Generate CSV/PDF environmental summary reports |
| **Settings** | `GET` | `/api/v1/settings` | Get threshold and notification configuration |
| **Settings** | `PUT` | `/api/v1/settings/{key}` | Update threshold (e.g. flood level, smoke PPM) |
| **System** | `GET` | `/api/v1/health` | Diagnostic check (DB, WebSocket, AI pipeline) |
| **WebSocket** | `WS` | `/ws/live` | Real-time bi-directional telemetry & alert stream |

---

## 2. Hardware Ingestion APIs

### `POST /api/v1/node-data` (or `/node-data`)

Accepts real-time telemetry packets from ESP32 microcontrollers every 3 seconds.

#### A. Node 1: Flood Node Payload (`NODE-01`)
```json
{
  "nodeId": "NODE-01",
  "type": "FLOOD",
  "waterLevel": 63.5,
  "rain": true,
  "temperature": 29.2,
  "humidity": 71.0,
  "risk": "MEDIUM",
  "battery": 95,
  "signal": -58,
  "timestamp": "2026-09-10T06:30:00Z"
}
```

#### B. Node 2: Wildfire Node Payload (`NODE-02`)
```json
{
  "nodeId": "NODE-02",
  "type": "FIRE",
  "mq2": 412.0,
  "risk": "HIGH",
  "battery": 92,
  "signal": -61,
  "timestamp": "2026-09-10T06:30:00Z"
}
```

#### C. Node 3: Air Pollution Node Payload (`NODE-03`)
```json
{
  "nodeId": "NODE-03",
  "type": "AIR",
  "mq135": 185.0,
  "pm25": 84.2,
  "pm10": 162.0,
  "co2": 920.0,
  "risk": "MEDIUM",
  "battery": 97,
  "signal": -54,
  "timestamp": "2026-09-10T06:30:00Z"
}
```

#### Ingestion Response (`200 OK`)
```json
{
  "status": "success",
  "message": "Telemetry ingested and processed by AI engine",
  "data": {
    "id": "c7a840c8-7013-4791-bd12-0f56e9c4df02",
    "node_id": "NODE-01",
    "calculated_risk_score": 78.4,
    "created_at": "2026-09-10T06:30:00.124Z"
  }
}
```

---

## 3. OpenLibre & OpenStreetMap Tile Services

EcoSentinel AI uses **100% Free Open-Source Map Tile Providers** with zero API keys or credit cards required:

### Tile Endpoints:

1. **CartoDB Positron (Default Light HUD)**:
   ```
   https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
   ```

2. **OpenFreeMap / MapLibre Positron**:
   ```
   https://tiles.openfreemap.org/styles/positron/{z}/{x}/{y}.png
   ```

3. **Standard OpenStreetMap (OSM)**:
   ```
   https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
   ```

4. **CartoDB Dark Matter (Dark Mode HUD)**:
   ```
   https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
   ```

5. **OpenTopoMap (Topographic Terrain Layer for Flood Basins)**:
   ```
   https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png
   ```

### GeoJSON GIS Nodes Endpoint: `GET /api/v1/map/nodes`
Returns standard GeoJSON `FeatureCollection` for MapLibre / Leaflet rendering:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [92.9376, 26.2006] },
      "properties": {
        "id": "NODE-01",
        "name": "Assam River Flood Sensor 01",
        "disaster_type": "flood",
        "status": "online",
        "risk_score": 84.0,
        "risk_category": "HIGH",
        "latest_reading": {
          "water_level": 63.5,
          "rain_detected": true,
          "temperature": 29.2,
          "humidity": 71.0
        }
      }
    }
  ]
}
```

---

## 4. Explainable AI (XAI) & SHAP Breakdown APIs

### `GET /api/v1/ai/predictions`
Returns real-time risk predictions scored by the AI engine.

#### Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": "pred-90214",
      "node_id": "NODE-01",
      "hazard_type": "flood",
      "risk_score": 84.0,
      "confidence_score": 98.4,
      "risk_category": "HIGH",
      "explanation": "High Flood Risk: Water depth (+63.5cm) exceeds 60cm critical threshold and continuous rainfall is detected.",
      "feature_importances": {
        "water_level_delta": 0.48,
        "rain_intensity": 0.32,
        "humidity": 0.12,
        "temperature": 0.08
      },
      "recommended_action": "Dispatch automated evacuation SMS to Sector 4 residents and sound local river sirens.",
      "timestamp": "2026-09-10T06:30:00Z"
    }
  ]
}
```

---

## 5. Real-Time WebSocket Protocol

### Endpoint: `ws://localhost:8000/ws/live`

Clients establish a persistent WebSocket connection upon opening the dashboard.

#### Client & Server Event Formats:

1. **`sensor_update`** (Server $\rightarrow$ Client every 3s):
```json
{
  "event": "sensor_update",
  "data": {
    "node_id": "NODE-01",
    "disaster_type": "flood",
    "risk_score": 84.0,
    "risk_category": "HIGH",
    "telemetry": {
      "water_level": 63.5,
      "rain_rate": 25.0,
      "temperature": 29.2,
      "humidity": 71.0,
      "battery": 95,
      "signal": -58
    },
    "timestamp": "2026-09-10T06:30:00.124Z"
  }
}
```

2. **`alert_triggered`** (Server $\rightarrow$ Client on anomaly):
```json
{
  "event": "alert_triggered",
  "data": {
    "id": "alert-3019",
    "node_id": "NODE-02",
    "severity": "critical",
    "title": "Severe Wildfire Spike Detected",
    "location": "Bandipur Tiger Reserve Ridge",
    "risk_score": 91.2,
    "timestamp": "2026-09-10T06:30:00Z"
  }
}
```

3. **`ping` / `pong`** (Heartbeat every 15s):
```json
// Client sends:
{ "type": "ping" }
// Server responds:
{ "type": "pong", "timestamp": 1789021800 }
```

---

## 6. System Settings & Thresholds API

### `GET /api/v1/settings`
Returns active threshold configurations.

### `PUT /api/v1/settings/{key}`
Updates threshold rules in real-time without restarting the backend.

#### Example Request (`PUT /api/v1/settings/flood_thresholds`):
```json
{
  "warning_water_level_cm": 45.0,
  "critical_water_level_cm": 65.0,
  "rain_rate_mm_hr": 30.0
}
```
