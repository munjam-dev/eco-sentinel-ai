# SentinelX 2.0 — Implementation Status

## Target
Two ESP32 nodes; Node 1 flood/environment, Node 2 fire/smoke; retain existing sensors, LCD/buzzer, FastAPI, Supabase/PostgreSQL, WebSockets and Next.js. Budget target: ₹3,000–₹5,000 for practical protection, power and installation upgrades.

## Existing V2 tranche
- Arduino sketches: `firmware/v2/node_1_flood/node_1_flood.ino`, `firmware/v2/node_2_fire/node_2_fire.ino`.
- Additive telemetry schema: `ecosentinel-backend/app/schemas/sensor_data.py`.
- Live dashboard: `ecosentinel-app/src/app/dashboard/sentinelx/page.tsx`.
- Implementation notes: `docs/SENTINELX_2.0_IMPLEMENTATION.md`.

## Next integration order
1. Freeze and verify per-node pin maps, including SX1278 SPI conflicts, before changing physical wiring.
2. Integrate JSN-SR04T and BME280 into Node 1; keep DHT11 fallback.
3. Add LoRa packet framing, sequence IDs, acknowledgements, duplicate filtering and retry/backoff. Preserve local alerts when peer is absent.
4. Add battery voltage and sensor-health fields end-to-end (firmware -> Pydantic -> DB model/migration -> WebSocket -> dashboard).
5. Add PDI only as a transparent, advisory rule-based score until labelled data exists for training/validation.
6. Add Digital Twin as a visualization and simulation, with simulated values clearly labelled.
7. Add protected solar/battery supply and measure current across operating states before estimating runtime.

## Verification truth
The repository files have been inspected through GitHub. This status document and wiring plan are documentation, not evidence of a physical build. Unless a CI job or local tool output is attached to the pull request, do not claim firmware compilation, backend tests, frontend build, radio range, sensor calibration, battery life, or outdoor testing has passed.

## Safety and deployment
- Classic ESP32 GPIO is 3.3 V only; scale any 5 V sensor output.
- SX1278 variants/frequency and antenna must match. Confirm current local radio requirements before deployment.
- MQ-2 raw ADC counts are not ppm; no calibrated concentration is exposed until the hardware is calibrated.
- Prototype sensors are not certified life-safety equipment.
