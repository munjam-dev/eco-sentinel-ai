/*
 * EcoSentinel AI / SentinelX 2.0 — Node 1: Flood monitor
 * Arduino IDE sketch. Uses the existing telemetry API contract.
 *
 * Required libraries:
 * - ArduinoJson 6.x
 * - Adafruit BME280 Library
 * - Adafruit Unified Sensor
 * - Adafruit DHT sensor library (optional fallback)
 * - LiquidCrystal_I2C compatible with your installed LCD backpack
 *
 * IMPORTANT: JSN-SR04T Echo must be level-shifted to 3.3 V. Verify the exact module version.
 * Configure SENSOR_HEIGHT_CM to the actual installation height.
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Adafruit_BME280.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoOTA.h>
#include "../../common/config.h"

#define PIN_DHT          4
#define PIN_TRIG         5
#define PIN_ECHO         18
#define PIN_RAIN_DO      19
#define PIN_RAIN_AO      34
#define PIN_LED_GREEN    2
#define PIN_LED_RED      15
#define PIN_BUZZER       13
#define PIN_BATTERY_ADC  35
#define DHTTYPE          DHT11

// Set this to the real sensor-to-bed distance after installation.
static constexpr float SENSOR_HEIGHT_CM = 100.0f;
static constexpr uint32_t SENSOR_INTERVAL_MS = 3000;
static constexpr uint32_t WIFI_RETRY_MS = 10000;
static constexpr uint16_t RAIN_ADC_THRESHOLD = 2500;
static constexpr uint8_t BME280_ADDRESS_PRIMARY = 0x76;
static constexpr uint8_t BME280_ADDRESS_SECONDARY = 0x77;

DHT dht(PIN_DHT, DHTTYPE);
Adafruit_BME280 bme;
bool bmeAvailable = false;
LiquidCrystal_I2C lcd(0x27, 16, 2);

struct FloodReading {
  float waterLevelCm;
  bool waterValid;
  bool rain;
  int rainRaw;
  float temperatureC;
  float humidityPct;
  float pressureHpa;
  bool climateValid;
  bool climateFromBme;
  int batteryPct;
  float batteryVoltage;
  int rssi;
};

uint32_t lastSampleMs = 0;
uint32_t telemetrySequence = 0;
String bootId;
uint32_t lastWifiAttemptMs = 0;
bool highRiskLatched = false;

static float readWaterLevelCm(bool &valid) {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(3);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // A timeout is a sensor fault, never a valid 0 cm reading.
  const uint32_t duration = pulseIn(PIN_ECHO, HIGH, 30000UL);
  if (duration == 0) {
    valid = false;
    return NAN;
  }

  const float distanceCm = (duration * 0.0343f) / 2.0f;
  if (!isfinite(distanceCm) || distanceCm < 2.0f || distanceCm > SENSOR_HEIGHT_CM + 100.0f) {
    valid = false;
    return NAN;
  }

  valid = true;
  return max(0.0f, SENSOR_HEIGHT_CM - distanceCm);
}

static float readBatteryVoltage() {
  // Assumes a 1:1 divider and a correctly wired battery measurement circuit.
  // Recalculate this for the actual divider and battery chemistry before use.
  const int raw = analogRead(PIN_BATTERY_ADC);
  const float pinV = (raw / 4095.0f) * 3.3f;
  const float batteryV = pinV * 2.0f;
  return batteryV;
}

static FloodReading readSensors() {
  FloodReading r{};
  r.waterLevelCm = readWaterLevelCm(r.waterValid);
  r.rainRaw = analogRead(PIN_RAIN_AO);
  r.rain = (digitalRead(PIN_RAIN_DO) == LOW) || (r.rainRaw < RAIN_ADC_THRESHOLD);

  if (bmeAvailable) {
    r.temperatureC = bme.readTemperature();
    r.humidityPct = bme.readHumidity();
    r.pressureHpa = bme.readPressure() / 100.0f;
    r.climateFromBme = true;
  } else {
    // DHT11 fallback remains available when the BME280 is absent.
    r.temperatureC = dht.readTemperature();
    r.humidityPct = dht.readHumidity();
    r.pressureHpa = NAN;
    r.climateFromBme = false;
  }
  r.climateValid = isfinite(r.temperatureC) && isfinite(r.humidityPct)
    && r.temperatureC >= -40.0f && r.temperatureC <= 85.0f
    && r.humidityPct >= 0.0f && r.humidityPct <= 100.0f
    && (!r.climateFromBme || (isfinite(r.pressureHpa) && r.pressureHpa >= 300.0f && r.pressureHpa <= 1200.0f));

  if (!r.climateValid) {
    r.temperatureC = NAN;
    r.humidityPct = NAN;
    r.pressureHpa = NAN;
  }

  r.batteryVoltage = readBatteryVoltage();
  r.batteryPct = constrain((int)lroundf((r.batteryVoltage - 3.2f) * 100.0f), 0, 100);
  r.rssi = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : -99;
  return r;
}

static const char* riskFor(const FloodReading &r) {
  if (!r.waterValid) return "SENSOR_FAULT";
  if (r.waterLevelCm >= FLOOD_WATER_LEVEL_HIGH_CM) return "HIGH";
  if (r.waterLevelCm >= FLOOD_WATER_LEVEL_MED_CM && r.rain) return "HIGH";
  if (r.waterLevelCm >= FLOOD_WATER_LEVEL_MED_CM || (r.rain && r.climateValid && r.humidityPct >= 85.0f)) return "MEDIUM";
  return "LOW";
}

static void updateLocalOutputs(const FloodReading &r, const char *risk) {
  const bool fault = strcmp(risk, "SENSOR_FAULT") == 0;
  const bool high = strcmp(risk, "HIGH") == 0;
  const bool medium = strcmp(risk, "MEDIUM") == 0;

  digitalWrite(PIN_LED_GREEN, (!high && !fault) ? HIGH : LOW);
  digitalWrite(PIN_LED_RED, (high || medium || fault) ? HIGH : LOW);

  // A fault is visibly indicated. Buzzer sounds for HIGH risk only.
  if (high) {
    tone(PIN_BUZZER, 2400);
    highRiskLatched = true;
  } else {
    noTone(PIN_BUZZER);
    highRiskLatched = false;
  }

  lcd.setCursor(0, 0);
  lcd.print("Water:");
  if (r.waterValid) {
    lcd.print((int)r.waterLevelCm);
    lcd.print("cm ");
  } else {
    lcd.print("FAULT ");
  }
  lcd.print(r.rain ? "RAIN" : "DRY ");

  lcd.setCursor(0, 1);
  if (fault) lcd.print("Sensor fault    ");
  else {
    lcd.print("Risk:");
    lcd.print(risk);
    lcd.print("        ");
  }
}

static void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  const uint32_t now = millis();
  if (now - lastWifiAttemptMs < WIFI_RETRY_MS) return;
  lastWifiAttemptMs = now;
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

static bool sendTelemetry(const FloodReading &r, const char *risk) {
  if (WiFi.status() != WL_CONNECTED) return false;

  WiFiClient client;
  HTTPClient http;
  if (!http.begin(client, BACKEND_API_URL)) return false;
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<512> doc;
  doc["nodeId"] = "NODE-01";
  doc["type"] = "FLOOD";
  if (r.waterValid) doc["waterLevel"] = r.waterLevelCm;
  else doc["waterLevel"] = nullptr;
  doc["rain"] = r.rain;
  doc["rainRaw"] = r.rainRaw;
  if (r.climateValid) {
    doc["temperature"] = r.temperatureC;
    doc["humidity"] = r.humidityPct;
    if (r.climateFromBme && isfinite(r.pressureHpa)) doc["pressureHpa"] = r.pressureHpa;
  } else {
    doc["temperature"] = nullptr;
    doc["humidity"] = nullptr;
  }
  doc["risk"] = risk;
  doc["battery"] = r.batteryPct;
  doc["batteryVoltage"] = r.batteryVoltage;
  doc["signal"] = r.rssi;
  doc["protocol"] = "wifi";
  doc["firmwareVersion"] = "2.0.0";
  doc["sequenceNumber"] = telemetrySequence++;
  doc["bootId"] = bootId;
  doc["waterSensorValid"] = r.waterValid;
  doc["climateSensorValid"] = r.climateValid;

  String body;
  serializeJson(doc, body);
  const int code = http.POST(body);
  http.end();

  Serial.printf("[telemetry] HTTP=%d waterValid=%s risk=%s\n",
    code, r.waterValid ? "true" : "false", risk);
  return code >= 200 && code < 300;
}

void setup() {
  Serial.begin(115200);
  bootId = String((uint32_t)esp_random(), HEX);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_RAIN_DO, INPUT);
  pinMode(PIN_RAIN_AO, INPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_BATTERY_ADC, INPUT);

  analogReadResolution(12);
  dht.begin();
  Wire.begin(21, 22);
  // BME280 shares I2C with the LCD. Address depends on the module SDO strap.
  bmeAvailable = bme.begin(BME280_ADDRESS_PRIMARY, &Wire);
  if (!bmeAvailable) bmeAvailable = bme.begin(BME280_ADDRESS_SECONDARY, &Wire);
  Serial.printf("BME280: %s; climate source=%s\\n", bmeAvailable ? "found" : "not found", bmeAvailable ? "BME280" : "DHT11 fallback");
  lcd.init();
  lcd.backlight();
  lcd.print("EcoSentinel 2.0");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lastWifiAttemptMs = millis();

  ArduinoOTA.setHostname("ecosentinel-flood-01");
  // OTA requires Wi-Fi and should be enabled only on a trusted network.
  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle();
  ensureWiFi();

  const uint32_t now = millis();
  if (now - lastSampleMs >= SENSOR_INTERVAL_MS) {
    lastSampleMs = now;
    const FloodReading reading = readSensors();
    const char *risk = riskFor(reading);
    updateLocalOutputs(reading, risk);
    sendTelemetry(reading, risk);
  }
  delay(5);
}
