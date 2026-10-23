# EcoSentinel AI — SentinelX 2.0 Implementation Plan

This document records the first hardening pass for the existing two-node prototype. It deliberately separates code changes from hardware upgrades that require purchasing or wiring new components.

## Existing architecture retained

- Two ESP32 DevKit boards programmed in Arduino IDE.
- Node 1: HC-SR04, rain module (DO/AO), DHT11, 16x2 I2C LCD, LEDs and buzzer.
- Node 2: MQ-2, optional IR flame module and status LEDs.
- FastAPI + SQLAlchemy async + PostgreSQL/Supabase, with a Next.js dashboard and WebSocket feed.
- The existing API accepts `POST /api/v1/node-data` and `POST /api/v1/sensor-data/ingest`. Keep this contract during migration.
- Only one SX1278 module is currently available. It cannot form a two-radio point-to-point link by itself. Wi-Fi remains the working transport until a second compatible radio or a separate LoRa gateway is available.

## First implementation pass

The sketches in `firmware/v2/` are opt-in replacements, not automatic replacements for the existing firmware. They are designed to preserve the current telemetry field names while addressing the most important reliability concerns:

1. Treat ultrasonic timeouts as invalid measurements, not a real 0 cm water level.
2. Treat DHT read failures as missing values, not fabricated 25 °C / 60% readings.
3. Read the rain analog channel as raw ADC telemetry as well as a threshold-based rain flag.
4. Read the flame input and send its state when the module is connected.
5. Bound sensor waits and HTTP requests; continue local monitoring when Wi-Fi is down.
6. Avoid representing the MQ-2's approximate curve as certified ppm. MQ-2 output is a relative prototype indicator until the specific module, load resistance, warm-up and calibration are validated.
7. Keep local warnings independent from cloud connectivity.

## Hardware upgrades

### Keep and verify before purchasing
- ESP32 × 2, HC-SR04, rain module, DHT11, MQ-2, IR module, LCD, buzzer and LEDs.
- Check the exact ESP32 board and GPIO mapping before uploading. GPIO 34–39 are input-only on the classic ESP32; do not use them for outputs.
- HC-SR04 Echo is typically 5 V. Use a resistor divider or level shifter before the 3.3 V ESP32 GPIO.
- Many MQ-2 breakout boards use a 5 V heater and can output up to approximately 5 V on AO/DO. Verify the board output and use a divider/level shifter so ESP32 ADC/GPIO pins never receive 5 V.
- Do not power the MQ-2 heater from an ESP32 3.3 V pin. Use an adequately rated supply and common ground.

### Recommended staged additions
1. Waterproof ultrasonic sensor (e.g. JSN-SR04T) for outdoor level measurements.
2. BME280 for temperature/humidity/pressure context; retain DHT11 until the new sensor is tested.
3. A second compatible SX1278 radio and suitable antennas for a LoRa point-to-point test, or a proper LoRa gateway.
4. Battery voltage divider designed for the actual battery maximum voltage, protected charging and a weatherproof enclosure.
5. PM2.5 sensor only if particulate monitoring is a real requirement and the budget supports it.

A hobby MQ-2 or IR flame module is not a certified fire detector. This prototype must not be used as the sole life-safety alarm or as a substitute for official flood/fire warnings.

## Software hardening sequence

### Firmware
- Flash and validate one node at a time.
- Confirm sensor units and active-high/active-low logic on the bench.
- Record calibration values and sensor-health flags.
- Add a bounded offline queue only after confirming the available RAM and payload size.
- Add authenticated HTTPS ingestion before public deployment. Never commit Wi-Fi passwords or device tokens.

### Backend
- Keep Pydantic validation at ingestion and reject impossible values rather than silently substituting plausible values.
- Add per-device credentials, timestamp freshness checks, duplicate handling and request-size limits before exposing ingestion to the public internet.
- Use persistent database-backed alert state. Do not rely on an in-memory WebSocket connection list across multiple backend workers.
- Treat model output as advisory until validated against labelled field observations. Explain the measurements behind each risk level.

### Dashboard
- Display each node's last-seen time and mark stale nodes offline.
- Display sensor fault/missing-data states separately from LOW risk.
- Show raw readings, units, risk rationale and alert history.
- Add map pins only when real coordinates are configured; never use invented locations.
- Keep a clear indicator when data is simulated or from a bench test.

## Bench acceptance checklist

- [ ] Both sketches compile with the selected ESP32 Arduino core and installed libraries.
- [ ] HC-SR04 disconnected/out-of-range is shown as a sensor fault, not safe water.
- [ ] DHT11 read failures are displayed as unavailable.
- [ ] Node 1 local LED/buzzer response works with Wi-Fi disabled.
- [ ] Node 2 reports MQ-2 ADC-derived indicator and flame input state.
- [ ] API returns 2xx for valid payloads and a validation error for malformed payloads.
- [ ] WebSocket clients receive saved telemetry updates and disconnects are handled.
- [ ] Stale nodes become offline in the UI.
- [ ] Power, enclosure, sensor voltage levels and antenna compliance are verified before outdoor deployment.

## Deployment order

1. Test new firmware on the bench with the existing backend.
2. Validate database writes and WebSocket events.
3. Add frontend stale-node and sensor-fault presentation.
4. Add auth and TLS for public deployment.
5. Add new sensors and LoRa only after the current two-node Wi-Fi path is stable.
