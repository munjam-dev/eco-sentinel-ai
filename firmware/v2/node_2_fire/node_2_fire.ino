/*
 * EcoSentinel AI / SentinelX 2.0 — Node 2: Smoke/gas indicator + flame input
 * Arduino IDE sketch. Uses the existing telemetry API contract.
 *
 * Required library: ArduinoJson 6.x
 *
 * MQ-2 note: this sketch reports raw ADC and a relative sensor ratio. It does
 * NOT claim certified ppm. Use a validated calibration curve and safe ADC
 * voltage scaling for the exact module before interpreting concentration.
 * Many MQ-2 breakout boards are powered at 5 V; never allow >3.3 V into ESP32.
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ArduinoOTA.h>
#include "../../common/config.h"

#define PIN_MQ2_AO       34
#define PIN_MQ2_DO       35
#define PIN_FLAME_IR     19
#define PIN_LED_GREEN    2
#define PIN_LED_RED      15
#define PIN_BATTERY_ADC  32

static constexpr uint32_t SENSOR_INTERVAL_MS = 3000;
static constexpr uint32_t WIFI_RETRY_MS = 10000;
static constexpr int MQ2_MED_RAW = 1800;   // Bench starting point only; tune after calibration.
static constexpr int MQ2_HIGH_RAW = 2500;  // Bench starting point only; tune after calibration.
static constexpr bool FLAME_ACTIVE_LOW = true;

uint32_t lastSampleMs = 0;
uint32_t telemetrySequence = 0;
String bootId;
uint32_t lastWifiAttemptMs = 0;

struct FireReading {
  int mq2Raw;
  bool mq2DigitalAlarm;
  bool flameDetected;
  int batteryPct;
  int rssi;
};

static int readBatteryPercent() {
  // Assumes a 1:1 divider. Recalculate for the actual circuit before use.
  const int raw = analogRead(PIN_BATTERY_ADC);
  const float pinV = (raw / 4095.0f) * 3.3f;
  const float batteryV = pinV * 2.0f;
  return constrain((int)lroundf((batteryV - 3.2f) * 100.0f), 0, 100);
}

static FireReading readSensors() {
  FireReading r{};
  r.mq2Raw = analogRead(PIN_MQ2_AO);
  r.mq2DigitalAlarm = digitalRead(PIN_MQ2_DO) == LOW;
  const int flameRaw = digitalRead(PIN_FLAME_IR);
  r.flameDetected = FLAME_ACTIVE_LOW ? flameRaw == LOW : flameRaw == HIGH;
  r.batteryPct = readBatteryPercent();
  r.rssi = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : -99;
  return r;
}

static const char* riskFor(const FireReading &r) {
  if (r.flameDetected || r.mq2DigitalAlarm || r.mq2Raw >= MQ2_HIGH_RAW) return "HIGH";
  if (r.mq2Raw >= MQ2_MED_RAW) return "MEDIUM";
  return "LOW";
}

static void updateLocalOutputs(const char *risk) {
  const bool high = strcmp(risk, "HIGH") == 0;
  const bool warning = strcmp(risk, "MEDIUM") == 0;
  digitalWrite(PIN_LED_GREEN, high ? LOW : HIGH);
  digitalWrite(PIN_LED_RED, (high || warning) ? HIGH : LOW);
}

static void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  const uint32_t now = millis();
  if (now - lastWifiAttemptMs < WIFI_RETRY_MS) return;
  lastWifiAttemptMs = now;
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

static bool sendTelemetry(const FireReading &r, const char *risk) {
  if (WiFi.status() != WL_CONNECTED) return false;

  WiFiClient client;
  HTTPClient http;
  if (!http.begin(client, BACKEND_API_URL)) return false;
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<384> doc;
  doc["nodeId"] = "NODE-02";
  doc["type"] = "FIRE";
  // Never put ADC counts in the legacy mq2 concentration field.
  // This prevents the backend from treating raw counts as calibrated ppm.
  doc["mq2"] = nullptr;
  doc["mq2Raw"] = r.mq2Raw;
  doc["mq2DigitalAlarm"] = r.mq2DigitalAlarm;
  doc["flame"] = r.flameDetected ? 1 : 0;
  doc["risk"] = risk;
  doc["battery"] = r.batteryPct;
  doc["signal"] = r.rssi;
  doc["protocol"] = "wifi";
  doc["firmwareVersion"] = "2.0.0";
  doc["sequenceNumber"] = telemetrySequence++;
  doc["bootId"] = bootId;
  doc["mq2Units"] = "adc_raw";

  String body;
  serializeJson(doc, body);
  const int code = http.POST(body);
  http.end();

  Serial.printf("[telemetry] HTTP=%d mq2Raw=%d flame=%s risk=%s\n",
    code, r.mq2Raw, r.flameDetected ? "true" : "false", risk);
  return code >= 200 && code < 300;
}

void setup() {
  Serial.begin(115200);
  bootId = String((uint32_t)esp_random(), HEX);
  pinMode(PIN_MQ2_AO, INPUT);
  pinMode(PIN_MQ2_DO, INPUT);
  pinMode(PIN_FLAME_IR, INPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BATTERY_ADC, INPUT);
  analogReadResolution(12);

  // MQ-2 heater needs the manufacturer's warm-up guidance. A short software
  // delay is not a substitute for initial burn-in or calibration.
  Serial.println("EcoSentinel 2.0 NODE-02: MQ-2 indicator mode; not certified ppm.");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lastWifiAttemptMs = millis();

  ArduinoOTA.setHostname("ecosentinel-fire-02");
  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle();
  ensureWiFi();

  const uint32_t now = millis();
  if (now - lastSampleMs >= SENSOR_INTERVAL_MS) {
    lastSampleMs = now;
    const FireReading reading = readSensors();
    const char *risk = riskFor(reading);
    updateLocalOutputs(risk);
    sendTelemetry(reading, risk);
  }
  delay(5);
}
