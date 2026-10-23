# SentinelX 2.0 Arduino firmware

These are **opt-in V2 sketches**. Existing firmware remains unchanged until the new sketches are bench-tested.

## Files

- `node_1_flood/node_1_flood.ino`: water-level + rain + DHT11 + LCD + local alarm.
- `node_2_fire/node_2_fire.ino`: MQ-2 relative indicator + flame input + status LEDs.

## Arduino IDE setup

1. Open the sketch folder and open its `.ino` file.
2. Select the correct ESP32 board and serial port.
3. Install ArduinoJson 6.x, Adafruit DHT Sensor Library, Adafruit Unified Sensor, and a compatible LiquidCrystal_I2C library for Node 1.
4. Set Wi-Fi and backend URL in `firmware/common/config.h`.
5. Confirm the backend endpoint is reachable from the same network. For local development, use the computer's LAN IP, not `localhost`.
6. Compile and flash one node at a time. Open Serial Monitor at 115200 baud.
7. Test with Wi-Fi disconnected to verify local monitoring still operates.

## Required bench checks

- Verify all pin assignments against your physical wiring.
- Confirm HC-SR04 Echo and MQ-2 outputs are reduced to safe ESP32 3.3 V logic.
- Confirm the rain module's digital output polarity.
- Confirm the flame module's active level; change `FLAME_ACTIVE_LOW` if required.
- Calibrate the water sensor height and ADC thresholds for the real installation.
- The MQ-2 thresholds in V2 are **starting ADC counts only**. Tune them using repeatable controlled tests. The firmware does not produce certified gas ppm.
- The battery percentage calculation assumes a 1:1 divider; update it for your actual circuit or disable it if no divider is installed.

## Telemetry compatibility

The sketches preserve `nodeId`, `type`, `waterLevel`, `rain`, `temperature`, `humidity`, `mq2`, `flame`, `risk`, `battery`, and `signal` fields accepted by the current API. New fields such as `firmwareVersion`, `mq2Raw`, and sensor-valid flags may be ignored by the current Pydantic schema until explicitly added there.

The V2 MQ-2 sketch places raw ADC counts in the legacy `mq2` field for compatibility; update backend scoring before using those values with ppm-based thresholds. Until then, treat backend fire scores as uncalibrated and do not rely on them for real-world safety decisions.
