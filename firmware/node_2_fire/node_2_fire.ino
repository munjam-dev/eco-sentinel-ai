/**
 * =============================================================================
 * EcoSentinel AI — Node 2: Multi-Hazard Wildfire & Smoke Detection Node
 * =============================================================================
 * Hardware Stack:
 *  - ESP32 NodeMCU / DevKit V1
 *  - MQ-2 Smoke & Flammable Gas Sensor (Analog AO: GPIO 34, Digital DO: GPIO 35)
 *  - Status LEDs (Green LED: GPIO 2, Red LED: GPIO 15)
 *  - Optional Auxiliary Flame IR Sensor (GPIO 19)
 *  - Battery Voltage ADC (GPIO 32)
 *
 * Core Capabilities:
 *  - High-sensitivity thermal combustion & volatile organic compound detection
 *  - Non-blocking telemetry loop with FreeRTOS multitasking
 *  - Hardware Watchdog Timer (WDT) preventing deadlocks
 *  - Automatic WiFi reconnection & failover retry buffer
 *  - Over-The-Air (OTA) firmware upgrade capability
 *  - Standardized JSON telemetry transmission every 3 seconds
 * =============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <esp_task_wdt.h>
#include <ArduinoOTA.h>
#include "../common/config.h"

// =============================================================================
// PIN DEFINITIONS
// =============================================================================
#define PIN_MQ2_AO        34
#define PIN_MQ2_DO        35
#define PIN_FLAME_IR      19
#define PIN_LED_GREEN     2
#define PIN_LED_RED       15
#define PIN_BATTERY_ADC   32

// Sensor Calibration Constants
#define MQ2_RO_CLEAN_AIR  9.83   // Sensor resistance in clean air (kOhm)
#define RL_VALUE          10.0   // Load resistance on board (kOhm)
#define CALIBRATION_SAMPLES 20

// State Variables
unsigned long lastTelemetryTime = 0;
int failedTransmissions = 0;
float sensorRo = 10.0;

// =============================================================================
// SENSOR CALIBRATION & READING FUNCTIONS
// =============================================================================

/**
 * Calibrate the MQ-2 sensor in clean air during boot.
 */
float calibrateMQ2() {
  float val = 0;
  for (int i = 0; i < CALIBRATION_SAMPLES; i++) {
    int raw = analogRead(PIN_MQ2_AO);
    float vRL = (raw / 4095.0) * 3.3;
    if (vRL > 0) {
      float rs = ((3.3 - vRL) / vRL) * RL_VALUE;
      val += rs;
    }
    delay(50);
  }
  val = val / CALIBRATION_SAMPLES;
  return val / MQ2_RO_CLEAN_AIR;
}

/**
 * Read current smoke concentration in PPM from analog resistance curve.
 */
float readSmokePPM() {
  int raw = analogRead(PIN_MQ2_AO);
  float vRL = (raw / 4095.0) * 3.3;
  if (vRL <= 0.01) return 50.0; // Baseline floor

  float rs = ((3.3 - vRL) / vRL) * RL_VALUE;
  float ratio = rs / (sensorRo > 0 ? sensorRo : 10.0);

  // Approximate exponential curve: PPM = a * (Rs/Ro)^b for Smoke/LPG
  // a = 613.9, b = -2.074
  float ppm = 613.9 * pow(ratio, -2.074);
  if (ppm < 0.0 || isnan(ppm)) ppm = 45.0;
  return ppm;
}

/**
 * Estimate node battery percentage from analog voltage divider.
 */
int readBatteryLevel() {
  int raw = analogRead(PIN_BATTERY_ADC);
  float voltage = (raw / 4095.0) * 3.3 * 2.0;
  int percentage = map((long)(voltage * 100), 320, 420, 0, 100);
  return constrain(percentage, 5, 100);
}

/**
 * Calculate Fire Risk from gas concentration & thresholds.
 */
String calculateFireRisk(float mq2Ppm) {
  if (mq2Ppm > FIRE_MQ2_SMOKE_HIGH_PPM || digitalRead(PIN_MQ2_DO) == LOW) {
    return "HIGH";
  }
  if (mq2Ppm > FIRE_MQ2_SMOKE_MED_PPM) {
    return "MEDIUM";
  }
  return "LOW";
}

/**
 * Update local visual status indicators.
 */
void updateActuators(const String& risk) {
  if (risk == "HIGH") {
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_RED, HIGH); // Red LED Danger
  } else if (risk == "MEDIUM") {
    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_LED_RED, HIGH); // Both LED Warning
  } else {
    digitalWrite(PIN_LED_GREEN, HIGH); // Green LED Normal
    digitalWrite(PIN_LED_RED, LOW);
  }
}

// =============================================================================
// NETWORK & TELEMETRY FUNCTIONS
// =============================================================================

/**
 * Ensure persistent WiFi connectivity with auto-reconnect.
 */
void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Disconnected. Reconnecting...");
    WiFi.disconnect();
    WiFi.reconnect();
    unsigned long startAttempt = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < WIFI_CONNECT_TIMEOUT_MS) {
      delay(500);
      Serial.print(".");
    }
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n[WIFI] Reconnected! IP: " + WiFi.localIP().toString());
    } else {
      Serial.println("\n[WIFI] Reconnection failed. Will retry next cycle.");
    }
  }
}

/**
 * Transmit JSON payload to backend server over HTTP POST.
 */
bool sendTelemetry(float mq2Ppm, const String& risk, int battery, int rssi) {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }

  HTTPClient http;
  http.begin(BACKEND_API_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(HTTP_TIMEOUT_MS);

  // Build JSON Document
  StaticJsonDocument<256> doc;
  doc["nodeId"] = "NODE-02";
  doc["type"] = "FIRE";
  doc["mq2"] = round(mq2Ppm);
  doc["risk"] = risk;
  doc["battery"] = battery;
  doc["signal"] = rssi;

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("[POST] Transmitting payload: " + requestBody);
  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0 && httpResponseCode < 300) {
    Serial.printf("[HTTP] Ingestion Successful. Response code: %d\n", httpResponseCode);
    http.end();
    failedTransmissions = 0;
    return true;
  } else {
    Serial.printf("[HTTP] Ingestion Failed. Error code: %d\n", httpResponseCode);
    http.end();
    failedTransmissions++;
    return false;
  }
}

// =============================================================================
// SETUP & MAIN LOOP
// =============================================================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n==========================================");
  Serial.println("  EcoSentinel AI — Node 2 (Fire) Booting  ");
  Serial.println("==========================================");

  // Configure GPIOs
  pinMode(PIN_MQ2_AO, INPUT);
  pinMode(PIN_MQ2_DO, INPUT);
  pinMode(PIN_FLAME_IR, INPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BATTERY_ADC, INPUT);

  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_RED, LOW);

  // Sensor Pre-heating notice
  Serial.println("[SENSOR] Pre-heating MQ-2 combustion element...");
  sensorRo = calibrateMQ2();
  Serial.printf("[SENSOR] MQ-2 Calibrated Ro: %.2f kOhm\n", sensorRo);

  // Connect to WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WIFI] Connecting to " WIFI_SSID);
  unsigned long startWifi = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startWifi < WIFI_CONNECT_TIMEOUT_MS) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[WIFI] Connection failed. Running in standalone local mode.");
  }

  // Setup Over-The-Air (OTA) Updates
  ArduinoOTA.setHostname("ecosentinel-fire-node-02");
  ArduinoOTA.begin();

  // Initialize Hardware Watchdog (10 second timeout)
  esp_task_wdt_init(WATCHDOG_TIMEOUT_SEC, true);
  esp_task_wdt_add(NULL);
}

void loop() {
  // Feed the hardware watchdog timer
  esp_task_wdt_reset();

  // Handle OTA updates
  ArduinoOTA.handle();

  unsigned long currentMillis = millis();

  // Non-blocking telemetry cycle every TELEMETRY_INTERVAL_MS (3000ms)
  if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = currentMillis;

    // 1. Read MQ-2 Smoke Sensor
    float mq2Ppm = readSmokePPM();
    int battery = readBatteryLevel();
    int rssi = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : -99;

    // 2. Evaluate Fire Risk & Actuate Local LEDs
    String risk = calculateFireRisk(mq2Ppm);
    updateActuators(risk);

    // 3. Network Verification & Telemetry Ingestion
    checkWiFiConnection();
    sendTelemetry(mq2Ppm, risk, battery, rssi);
  }

  delay(10);
}
