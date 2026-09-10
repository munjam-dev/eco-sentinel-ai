# EcoSentinel AI — ESP32 Sensor Nodes Firmware Guide

Production-ready firmware for EcoSentinel AI edge hardware nodes.

---

## Hardware Specifications & Pinouts

### NODE 1: Flood & Hydrological Monitoring Node (`NODE-01`)
Monitors water level, precipitation velocity, ambient temperature, and humidity.

| Component | ESP32 GPIO Pin | Function |
|---|---|---|
| **HC-SR04 Ultrasonic (Trig)** | `GPIO 5` | Ultrasonic pulse trigger output |
| **HC-SR04 Ultrasonic (Echo)** | `GPIO 18` | Echo return time input |
| **Rain Sensor (Digital DO)** | `GPIO 19` | Active LOW precipitation threshold |
| **Rain Sensor (Analog AO)** | `GPIO 34` (ADC1) | Continuous precipitation intensity |
| **DHT11 Sensor (Data)** | `GPIO 4` | Temperature & relative humidity |
| **16x2 LCD Display (SDA)** | `GPIO 21` (I2C) | Live telemetry HUD |
| **16x2 LCD Display (SCL)** | `GPIO 22` (I2C) | I2C clock line |
| **Green LED (Normal)** | `GPIO 2` | Heartbeat & safe level status |
| **Red LED (Danger)** | `GPIO 15` | Critical flood hazard indicator |
| **Piezo Buzzer** | `GPIO 13` | Autonomous audible siren |
| **Battery Voltage Divider** | `GPIO 35` (ADC1) | Node power telemetry (0–100%) |

---

### NODE 2: Wildfire & Smoke Detection Node (`NODE-02`)
Monitors combustion gas, smoke concentration (PPM), and thermal buildup.

| Component | ESP32 GPIO Pin | Function |
|---|---|---|
| **MQ-2 Smoke Sensor (AO)** | `GPIO 34` (ADC1) | Gas/Smoke analog concentration curve |
| **MQ-2 Smoke Sensor (DO)** | `GPIO 35` | Hardware threshold trigger |
| **Green LED (Normal)** | `GPIO 2` | Active grid status |
| **Red LED (Danger)** | `GPIO 15` | Fire threat indicator |
| **Auxiliary Flame Sensor** | `GPIO 19` | Infrared optical combustion detection |
| **Battery Voltage Divider** | `GPIO 32` (ADC1) | Node power telemetry (0–100%) |

---

## Required Arduino Libraries

Install the following libraries via the Arduino IDE Library Manager or PlatformIO:

1. **`ArduinoJson`** (v6.21.0 or higher by Benoit Blanchon)
2. **`DHT sensor library`** (by Adafruit) + **`Adafruit Unified Sensor`**
3. **`LiquidCrystal_I2C`** (by Frank de Brabander)

---

## Flashing Instructions

1. Connect your ESP32 board via micro-USB / Type-C.
2. Open `firmware/common/config.h` and configure:
   ```c
   #define WIFI_SSID       "YourNetworkSSID"
   #define WIFI_PASSWORD   "YourNetworkPassword"
   #define BACKEND_API_URL "http://YOUR_SERVER_IP:8000/api/v1/node-data"
   ```
3. In the Arduino IDE:
   - Board: **`ESP32 Dev Module`**
   - Upload Speed: `921600`
   - CPU Frequency: `240MHz`
   - Flash Frequency: `80MHz`
   - Flash Mode: `QIO`
4. Compile and flash `firmware/node_1_flood/node_1_flood.ino` to Node 1.
5. Compile and flash `firmware/node_2_fire/node_2_fire.ino` to Node 2.
6. Open the Serial Monitor at `115200` baud to confirm WiFi connection and live JSON transmission every 3 seconds.
