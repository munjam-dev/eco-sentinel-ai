# EcoSentinel AI — Hardware Engineering & Sensor Calibration

Complete hardware assembly, bill of materials (BOM), and sensor calibration reference.

---

## Bill of Materials (BOM)

### Node 1: Flood Node
1. **Microcontroller**: ESP32 DevKit V1 (30-pin / 38-pin)
2. **Ultrasonic Range Sensor**: HC-SR04 (5V VCC, Voltage Divider on Echo pin to 3.3V)
3. **Rain Drop Sensor**: FR-04 with LM393 Comparator Module
4. **Climate Sensor**: DHT11 or DHT22 Temperature & Humidity
5. **Display**: 1602 LCD with PCF8574 I2C Backpack (0x27)
6. **Actuators**: 1x 5mm Green LED, 1x 5mm Red LED, 1x Active 5V Piezo Buzzer (300Ω current limiting resistors)
7. **Power Supply**: 3.7V 18650 Li-ion Battery with TP4056 USB-C Charger & 5V Boost Converter, or 5V 2A DC Adapter

### Node 2: Wildfire Node
1. **Microcontroller**: ESP32 DevKit V1
2. **Combustion Gas Sensor**: MQ-2 Smoke/LPG/CO Sensor Module
3. **Optional Optical Sensor**: YG1006 Infrared Flame Sensor Module
4. **Status Indicators**: 1x 5mm Green LED, 1x 5mm Red LED (300Ω resistors)
5. **Power Supply**: 3.7V 18650 Li-ion Battery with Solar Power Shield (5V 1W Solar Panel)

---

## Sensor Calibration Procedures

### 1. HC-SR04 Ultrasonic Calibration
- Mount the sensor facing downward toward the normal riverbed surface at a fixed height $H$ (e.g. $100\text{ cm}$).
- Set `#define SENSOR_HEIGHT_CM 100.0` in `node_1_flood.ino`.
- The live water depth is calculated as:
  $$\text{Water Level} = \text{SENSOR\_HEIGHT\_CM} - \text{Measured Distance}$$

### 2. MQ-2 Smoke Sensor Pre-Heating & Ro Calibration
- **Pre-heating**: The MQ-2 requires a 24–48 hour initial burn-in period before first deployment, and a 2–3 minute warm-up on subsequent power-ups to stabilize the tin dioxide ($SnO_2$) heating coil.
- The firmware automatically executes a clean air calibration sample loop on startup to establish the baseline sensor resistance ($R_0$):
  $$R_s = \left(\frac{V_{in} - V_{RL}}{V_{RL}}\right) \times R_L$$
  $$R_0 = \frac{R_s}{\text{Clean Air Constant (9.83)}}$$
- Real-time concentration in Parts Per Million (PPM) is calculated using the exponential regression formula:
  $$\text{PPM} = 613.9 \times \left(\frac{R_s}{R_0}\right)^{-2.074}$$

---

## Power Optimization for Remote Solar Deployment

- **Transmission Interval**: 3 seconds during live active monitoring.
- **Deep Sleep Mode**: If the node detects zero rain and normal gas readings for > 1 hour, the ESP32 can cycle into Light Sleep mode (`esp_light_sleep_start()`) and wake up on timer or sensor threshold interrupt.
- **Current Draw**:
  - Active Transmission: ~120–160 mA
  - Idle WiFi Listening: ~80 mA
  - Light Sleep: ~1.5 mA
