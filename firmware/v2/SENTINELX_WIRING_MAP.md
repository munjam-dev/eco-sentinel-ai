# SentinelX 2.0 — Wiring and Bring-up Plan

This plan is deliberately pin-safe: verify the exact ESP32 board, sensor breakout and existing harness before moving wires. The pin maps below are proposals for the classic ESP32 DevKit, not a substitute for checking the physical board.

## Architecture

- NODE-01: flood + environment (JSN-SR04T, BME280, rain sensor; keep DHT11 as fallback; LCD and buzzer).
- NODE-02: fire + smoke (MQ-2 + existing IR/flame module; local status LEDs/buzzer if already wired).
- Each node gets one SX1278 after the second module is physically available. LoRa is a peer-to-peer fallback/transport; local detection and alarms must not wait for a peer or cloud.
- Wi-Fi remains the telemetry path to FastAPI until LoRa forwarding through a node/gateway is implemented and bench-tested.

## Safety rules before wiring

1. All ESP32 GPIO is 3.3 V logic. Never connect a 5 V Echo, MQ-2 AO/DO, or other 5 V output directly to an ESP32 pin. Use a correctly calculated divider or level shifter.
2. Power the MQ-2 heater from a suitable supply specified for the exact module; do not power it from the ESP32 3V3 pin. Join grounds for signal reference.
3. SX1278/RA-02 is a 3.3 V radio. Do not connect it to 5 V. Attach the correct antenna before transmitting.
4. Do not connect a bare lithium cell or solar panel directly to ESP32 power pins. Use a charger/protection circuit compatible with the exact cell chemistry and a regulated output. Add a fuse.
5. Disconnect power before changing wiring. Validate with a multimeter before connecting GPIO.
6. MQ-2 and hobby IR/ultrasonic modules are prototype sensors, not certified life-safety equipment.

## Proposed pin map — Node 1 (classic ESP32 DevKit)

| Signal | ESP32 GPIO | Notes |
|---|---:|---|
| JSN-SR04T TRIG | 5 | Confirm the module's trigger voltage and timing |
| JSN-SR04T ECHO | 18 | Use divider/level shifting if ECHO exceeds 3.3 V |
| Rain digital output | 19 | Verify active-high/active-low |
| Rain analog output | 34 | Input-only ADC pin; scale output to <=3.3 V |
| BME280 SDA | 21 | I2C; verify breakout supports chosen supply |
| BME280 SCL | 22 | I2C; scan address, commonly 0x76 or 0x77 |
| LCD SDA/SCL | 21/22 | Share I2C bus only if addresses do not conflict |
| Green LED | 2 | Existing resistor required |
| Red LED | 15 | Existing resistor required |
| Buzzer driver | 13 | Use a transistor/driver if buzzer current exceeds GPIO capability |
| Battery divider | 35 | Optional; design divider for maximum battery voltage and ADC range |

**Important:** These assignments reuse the current V2 Node 1 pins for TRIG/ECHO/rain/LED/buzzer. Confirm no board-specific boot-strapping or existing peripheral conflict before wiring. JSN-SR04T replaces the HC-SR04 on the same trigger/echo interface only after its variant is confirmed. Keep the HC-SR04 as a rollback option.

## Proposed pin map — Node 2 (classic ESP32 DevKit)

| Signal | ESP32 GPIO | Notes |
|---|---:|---|
| MQ-2 analog output | 34 | ADC input only; divider required if output may exceed 3.3 V |
| MQ-2 digital alarm | 35 | Input only; level-shift if needed |
| IR/flame output | 19 | Verify active level and output voltage |
| Green LED | 2 | Existing resistor required |
| Red LED | 15 | Existing resistor required |
| Battery divider | 32 | Optional; do not enable battery percentage until divider ratio is configured |

## SX1278 radio — repeat on both nodes

| SX1278 pin | Classic ESP32 GPIO |
|---|---:|
| VCC | 3V3 (not 5V) |
| GND | GND |
| SCK | 18 |
| MISO | 19 |
| MOSI | 23 |
| NSS / CS | 5 |
| RESET | 14 |
| DIO0 | 26 |

The radio map above conflicts with some proposed sensor pins if installed on the same node (Node 1 uses GPIO 5/18/19; Node 2 uses GPIO 19). Therefore **do not wire this radio map on top of the current maps unchanged**. Reassign sensor/radio GPIOs together after checking all existing wiring. Use one consistent pin map per node and update firmware constants to match. Avoid GPIOs 6–11 (typically flash-connected); GPIO 34–39 are input-only on classic ESP32.

### Frequency and radio configuration

Confirm the exact module frequency variant and antenna first. Do not assume every SX1278 breakout supports the same frequency. Set both radios to identical, locally permitted frequency/modulation settings and verify current WPC/DoT rules before field operation. Do not copy a 433 MHz example onto an 865 MHz radio or vice versa.

## Solar and battery power

- Solar panel -> compatible charge controller -> protected battery -> regulated converter -> ESP32/sensors.
- Keep the MQ-2 heater power budget separate from low-power sleep calculations; its heater can dominate energy consumption.
- Measure node current in boot, Wi-Fi transmit, LoRa transmit/receive, sensor sampling and sleep.
- Monitor battery via a divider into ADC only after calculating maximum voltage, divider current and ADC calibration. The V2 sketch's simple 1:1 assumption is not valid for an arbitrary battery pack.
- Do not claim battery life until measured current and local solar yield are recorded.

## Bring-up order

1. Test each sensor alone on USB power and log raw values.
2. Verify all signal voltages with a multimeter; check no GPIO sees >3.3 V.
3. Add BME280 to I2C and scan for its address; retain DHT11 as fallback until stable.
4. Replace HC-SR04 with JSN-SR04T and calibrate the sensor-to-water-bed distance; treat timeout as invalid.
5. Test each SX1278 separately, then pair them with antenna attached and a packet counter/ACK test. Resolve GPIO conflicts before integrating.
6. Test battery measurement against a multimeter reading.
7. Test solar charging only with the correct charger and protected cell.
8. Test local alarms with Wi-Fi off. Cloud and peer connectivity must never be required for local alarm behavior.

## Acceptance tests

- JSN-SR04T timeout becomes a sensor fault, never a zero-distance/safe reading.
- BME280 values are plausible and missing I2C reads are marked invalid.
- Local flood/fire indicators continue with Wi-Fi disconnected.
- LoRa sends sequence-numbered packets; receiver acknowledges; missed ACK is reported, not interpreted as confirmation.
- Node failure or missing peer must never suppress a local alarm.
- Battery ADC estimate is compared with a multimeter at multiple charge levels.
- HTTP ingestion, database persistence and WebSocket broadcast are checked separately.
