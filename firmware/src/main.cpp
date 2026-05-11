#include <Arduino.h>
#include <DHT.h>
#include <BH1750.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <WebServer.h>
#include "secrets.h"

// Pin Definitions
#define DHT_PIN       4
#define DHT_TYPE      DHT22
#define TOUCH_PIN     13    // TTP223B digital output

// Display
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1

// Timing
#define READ_INTERVAL 2000  // ms between sensor reads

// Objects
DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
WebServer server(80);

// State
float temperature = 0.0;
float humidity    = 0.0;
float lux         = 0.0;
bool  occupied    = false;
unsigned long lastRead = 0;

void readSensors() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t)) temperature = t;
  if (!isnan(h)) humidity    = h;

  lux      = lightMeter.readLightLevel();
  occupied = digitalRead(TOUCH_PIN) == HIGH;
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);

  display.print("Temp:  "); display.print(temperature, 1); display.println(" C");
  display.print("Humid: "); display.print(humidity, 1);    display.println(" %");
  display.print("Light: "); display.print(lux, 0);         display.println(" lx");
  display.print("Bench: "); display.println(occupied ? "OCCUPIED" : "EMPTY");

  display.display();
}

void handleRoot() {
  String html = "<!DOCTYPE html><html><head>"
    "<meta charset='UTF-8'>"
    "<meta http-equiv='refresh' content='5'>"
    "<meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<title>Smart Bench</title>"
    "<style>"
      "body{font-family:monospace;padding:2rem;background:#0a0a0a;color:#e0e0e0;}"
      "h2{color:#7eb8f7;margin-bottom:1.5rem;}"
      ".row{display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid #222;}"
      ".label{color:#888;}"
      ".value{color:#fff;font-weight:bold;}"
      ".occupied{color:#4caf50;} .empty{color:#f44336;}"
    "</style></head><body>"
    "<h2>smart bench</h2>"
    "<div class='row'><span class='label'>temperature</span><span class='value'>" + String(temperature, 1) + " C</span></div>"
    "<div class='row'><span class='label'>humidity</span><span class='value'>"    + String(humidity, 1)    + " %</span></div>"
    "<div class='row'><span class='label'>light</span><span class='value'>"       + String(lux, 0)         + " lx</span></div>"
    "<div class='row'><span class='label'>bench</span><span class='value "        + String(occupied ? "occupied'>OCCUPIED" : "empty'>EMPTY") + "</span></div>"
    "</body></html>";
  server.send(200, "text/html", html);
}

void handleData() {
  String json = "{";
  json += "\"temperature\":" + String(temperature, 2) + ",";
  json += "\"humidity\":"    + String(humidity, 2)    + ",";
  json += "\"lux\":"         + String(lux, 2)         + ",";
  json += "\"occupied\":"    + String(occupied ? "true" : "false");
  json += "}";
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  pinMode(TOUCH_PIN, INPUT);
  dht.begin();
  Wire.begin();
  lightMeter.begin();

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 not found");
    while (true);
  }
  display.clearDisplay();
  display.display();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected. IP: " + WiFi.localIP().toString());

  server.on("/",     handleRoot);
  server.on("/data", handleData);
  server.begin();
}

void loop() {
  unsigned long now = millis();
  if (now - lastRead >= READ_INTERVAL) {
    lastRead = now;
    readSensors();
    updateDisplay();
  }
  server.handleClient();
}
