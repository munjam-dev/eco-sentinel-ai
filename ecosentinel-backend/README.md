# 🛡️ EcoSentinel AI — Enterprise Backend Engine

Production-grade, asynchronous, AI-powered Environmental Disaster Monitoring Platform backend built with **FastAPI**, **SQLAlchemy 2.0 (Async)**, **PostgreSQL / Supabase**, **SHAP Explainable AI**, and **Realtime WebSockets**.

Designed to scale from pilot village sensor meshes to nationwide government disaster defense grids.

---

## 📐 Architecture Overview

Built using **Clean Architecture** principles to separate concerns into modular, independently testable layers:

```text
[ ESP32 Sensor Nodes / LoRa Gateways ]
                   │
                   ▼
┌──────────────────────────────────────────┐
│      FastAPI REST & WebSocket Layer      │  ◄── Ingestion & In-Memory Rate Limiter
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│        AI & Multi-Hazard Pipeline        │  ◄── Feature Engineering & SHAP Engine
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│    Domain Services & Alert Classifier    │  ◄── Health & Lifecycle Engines
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│    Async Repositories & PostgreSQL DB    │  ◄── SQLAlchemy 2.0 Async Engine
└──────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Entities

The platform maintains 10 core relational tables with audit columns (`created_at`, `updated_at`, `is_deleted`):

1. `sensor_nodes`: Hardware registry, location coordinates, status, protocol, battery level.
2. `sensor_data`: High-frequency sensor readings (water depth, rain rate, temp, humidity, MQ2 smoke, MQ135 AQI, flame, PM2.5, PM10, CO2).
3. `alerts`: Active emergency alerts categorized by severity (`INFO`, `WARNING`, `HIGH`, `CRITICAL`).
4. `predictions`: AI-computed risk scores (0-100), confidence ratings, SHAP explanations, and action recommendations.
5. `hazard_events`: Grouped disaster occurrences and geographical bounding perimeters.
6. `communication_logs`: Network telemetry (WiFi/LoRa RSSI, SNR, packet loss, latency).
7. `node_health`: Diagnostic scores, battery drain rate, sensor calibration requirements.
8. `system_health`: Platform API latency, connection pool usage, CPU/Memory telemetry.
9. `reports`: Generated PDF, CSV, Excel analytical summaries.
10. `system_settings`: Key-value platform threshold configurations.

---

## 🚀 Quick Start Guide

### 1. Installation

```bash
cd ecosentinel-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation available at:
- **Swagger UI**: `http://localhost:8000/api/v1/docs`
- **ReDoc**: `http://localhost:8000/api/v1/redoc`
- **WebSocket Feed**: `ws://localhost:8000/ws/live`

---

## 🐳 Docker Deployment

To launch the full backend stack alongside a local PostgreSQL instance:

```bash
docker-compose up --build -d
```

---

## 📡 Sample Sensor Ingestion Request

### Ingest Telemetry Payload (`POST /api/v1/sensor-data/ingest`)

```json
{
  "node_id": "NODE-FL-001",
  "water_level": 3.45,
  "rain_rate": 45.2,
  "temperature": 29.5,
  "humidity": 88.0,
  "mq2_smoke": 120.0,
  "mq135_air_quality": 65.0,
  "flame_detected": 0.0,
  "pm25": 42.0,
  "battery_level": 94.0,
  "rssi": -68,
  "protocol": "wifi"
}
```

---

## 🔐 Security & Production Readiness

- **Input Validation**: Pydantic v2 strict schemas preventing SQL injection & malformed data payloads.
- **In-Memory Rate Limiting**: Built-in HTTP client rate throttling.
- **Asynchronous I/O**: Non-blocking database transactions powered by `asyncpg` connection pooling.
- **LoRa Mesh Token Authentication**: Header validation for LoRaWAN concentrators (`X-Gateway-Token`).
