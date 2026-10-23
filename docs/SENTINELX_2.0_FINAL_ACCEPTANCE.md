# SentinelX 2.0 — Final integration and field acceptance checklist

This checklist distinguishes repository implementation from hardware- or deployment-dependent validation. A green CI run is not proof that physical sensors, radio links, or deployed databases are calibrated and safe.

## Implemented in this branch

- ESP32 Node 1 flood/environment and Node 2 fire/smoke prototype sketches.
- Explicit invalid water-level readings; raw rain ADC preserved separately from rain detection.
- MQ-2 raw ADC is not represented as calibrated ppm.
- Optional BME280 pressure telemetry with DHT11 fallback.
- Battery-voltage estimate, sequence number, boot identifier, RSSI, firmware version and sensor-validity telemetry.
- Backend schema/model/service fields for the new telemetry contract.
- SentinelX live WebSocket dashboard cards, sensor-fault/stale indicators and battery/pressure metrics.
- Alert lifecycle improvements: avoid repeated open alerts for the same node/hazard, escalate severity on the existing alert, and resolve it when computed risk falls below the alert threshold.
- CI runs backend tests, lint for the SentinelX page, and a frontend production build.
- LoRa protocol design is documented, but LoRa packet transport, ACK/retry and gateway ingestion are not yet implemented.

## Before applying to a deployed environment

1. Back up PostgreSQL and inspect the live schema. Review database/migrations/20261023_sentinelx_telemetry.sql, then apply it through your normal migration/change-control process. It is a standalone SQL migration, not an Alembic revision.
2. Set ENVIRONMENT=production, DEBUG=false, a unique high-entropy SECRET_KEY, and a unique LORA_GATEWAY_SECRET using your hosting provider's secret manager. Do not commit .env or real credentials.
3. Configure WIFI_SSID, WIFI_PASSWORD, and BACKEND_API_URL in the local firmware config; keep credentials out of public repositories.
4. Confirm that backend node registration, authentication/authorization and rate limiting match the deployment. The current sketches post telemetry over HTTP and do not authenticate the node request; do not expose an unauthenticated ingestion endpoint to the public internet.
5. Configure frontend NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL to the actual deployed backend. The localhost defaults are for local development only.
6. Verify that the API and WebSocket event contract matches the current backend response. Run an end-to-end smoke test with one node before installing both.

## Hardware calibration and safety acceptance

- Confirm the exact ESP32 board and all pin assignments against firmware/v2/SENTINELX_WIRING_MAP.md; do not assume the pins fit every ESP32 variant.
- Confirm the installed JSN-SR04T revision and minimum range; ensure Echo is level-shifted to 3.3 V. Verify sensor mounting height and flood baseline.
- Keep all ESP32 GPIO inputs at 3.3 V maximum. Check MQ-2 breakout analog/digital outputs with a meter before connection; many modules are 5 V powered.
- Battery ADC formula currently assumes a 1:1 voltage divider and a single-cell voltage range. Verify the divider, ADC calibration, battery chemistry, charging controller and safe cutoff before trusting battery percentage.
- Calibrate rain thresholds against wet/dry observations. MQ-2 thresholds are bench starting points and require warm-up and calibration; do not report ppm without a validated calibration curve.
- Test disconnected/failed sensors, Wi-Fi loss, backend restart, power cycling, low battery, duplicate/reordered packets and alert acknowledgement/resolution.
- Test OTA only on a trusted network; restrict access and use authenticated update infrastructure before production.
- LoRa is not active in the current sketches. Before enabling it, confirm the module frequency variant, local radio regulations, antenna and a collision-free pin map. The documented SPI pins can conflict with sensor pins if copied without review.

## Known limitations / remaining work

- No persistent offline telemetry queue/replay in firmware yet; telemetry during a Wi-Fi outage can be lost.
- No authenticated per-device telemetry signature/token in the sketches yet.
- No LoRa transport/ACK/retry implementation.
- GPS fields are accepted by the backend, but GPS acquisition is not wired into the current firmware.
- The risk engine uses configured/model thresholds; it is not a certified prediction or emergency dispatch service.
- Alert updates are application-level deduplication, not a database-atomic uniqueness guarantee under concurrent ingestion.
- Battery percentage is only a rough estimate until calibrated on the actual circuit and battery.
- Physical sensor readings, OTA, production credentials, database migration and deployment endpoints have not been verified from this repository session.

## Release gate

Treat the project as a prototype/integration candidate, not a certified life-safety product, until CI passes on the final head, the deployed migration and secrets are verified, and the field acceptance tests above are recorded. Keep an independent, certified warning method in place during testing.
