#include <Arduino.h>
#include <DHT.h>
#include <BH1750.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <WebServer.h>

// ─── Pin Definitions ─────────────────────────────────────────────────────────
#define DHT_PIN       4
#define DHT_TYPE      DHT22
#define TOUCH_PIN     T0    // Capacitive occupancy pad

// ─── Display ──────────────────────────────────────────────────────────────────
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1

// ─── WiFi Credentials ─────────────────────────────────────────────────────────
// TODO: move to secrets.h before any public commits
const char* WIFI_SSID     = "YOUR_SSID";
const char* WIFI_PASSWORD = "YOUR_PASSWORD";

// ─── Objects ──────────────────────────────────────────────────────────────────
DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
WebServer server(80);

// ─── State ────────────────────────────────────────────────────────────────────
float temperature  = 0.0;
float humidity     = 0.0;
float lux          = 0.0;
bool  occupied     = false;

// ─── Sensor Read ──────────────────────────────────────────────────────────────
void readSensors() {
  temperature = dht.readTemperature();
  humidity    = dht.readHumidity();
  lux         = lightMeter.readLightLevel();

  // Capacitive touch: ESP32 returns lower values when touched
  int touchVal = touchRead(TOUCH_PIN);
  occupied = (touchVal < 30);  // threshold TBD after physical calibration
}

// ─── OLED Display ─────────────────────────────────────────────────────────────
void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);

  display.print("Temp:  "); display.print(temperature); display.println(" C");
  display.print("Humid: "); display.print(humidity);    display.println(" %");
  display.print("Light: "); display.print(lux);         display.println(" lx");
  display.print("Bench: "); display.println(occupied ? "OCCUPIED" : "EMPTY");

  display.display();
}

// ─── WiFi Dashboard ───────────────────────────────────────────────────────────
void handleRoot() {
  String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'>";
  html += "<meta http-equiv='refresh' content='5'>";
  html += "<title>Smart Bench</title></head><body>";
  html += "<h2>Smart Bench</h2>";
  html += "<p>Temperature: " + String(temperature) + " C</p>";
  html += "<p>Humidity: "    + String(humidity)    + " %</p>";
  html += "<p>Light: "       + String(lux)         + " lx</p>";
  html += "<p>Bench: "       + String(occupied ? "OCCUPIED" : "EMPTY") + "</p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

// ─── Setup ────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);

  // Init sensors
  dht.begin();
  Wire.begin();
  lightMeter.begin();

  // Init display
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 not found");
    while (true);
  }
  display.clearDisplay();
  display.display();

  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected. IP: " + WiFi.localIP().toString());

  // Start web server
  server.on("/", handleRoot);
  server.begin();
}

// ─── Loop ─────────────────────────────────────────────────────────────────────
void loop() {
  readSensors();
  updateDisplay();
  server.handleClient();
  delay(2000);
}
