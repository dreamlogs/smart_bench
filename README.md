# Smart Bench

Capacitive touch occupancy detection, environmental sensing, and solar powered telemetry on a welded steel bench frame. ESP32 firmware serves a real time data dashboard over WiFi.

## System

A 19 x 66 x 26 inch welded steel frame supports a wood seat surface with copper tape electrodes laminated to the underside. The electrodes connect to the ESP32's built in capacitive touch GPIOs, enabling per zone occupancy detection without mechanical switches or external ICs.

Environmental data (temperature, humidity, ambient light) is sampled continuously via I2C. A 6V solar panel feeds a TP4056 charge controller into an 18650 lithium cell, making the system self sustaining outdoors.

The ESP32 hosts a local web server over WiFi. A single page dashboard displays occupancy state, sensor readings, and battery status with auto refreshing fetch calls.

## Hardware

| Component | Role |
|---|---|
| ESP32 WROOM 32 | MCU, WiFi, 10x capacitive touch GPIO |
| Copper tape electrodes | Occupancy zones (left, center, right) |
| DHT22 | Temperature, humidity |
| BH1750 | Ambient light (lux), I2C |
| 6V 1W solar panel | Energy harvesting |
| TP4056 | Li ion charge management |
| 18650 3.7V cell | Power storage |
| SSD1306 0.96" OLED | Local display, I2C |

## Firmware

Written in Arduino C++ targeting the ESP32 Arduino core. Main loop samples all sensors at 1Hz, updates the OLED, and handles HTTP requests from connected clients. Touch thresholds are calibrated per electrode during setup.

```
firmware/
  main.ino        Entry point, sensor polling, web server routes
  config.h        Pin map, WiFi credentials, touch thresholds
  sensors.h       DHT22 and BH1750 read wrappers
  touch.h         Capacitive zone logic and debouncing
```

## Web dashboard

Served from SPIFFS (ESP32 onboard flash). Static HTML/CSS/JS. The page polls `/api/data` at 1s intervals and renders:

- Occupancy zones (binary per zone, with time since last change)
- Temperature and humidity (current, min, max)
- Light level (lux)
- Battery voltage and charge state

```
web/
  index.html
  style.css
  app.js
```

## Physical build

The steel frame was MIG welded from rectangular tubing. Seat surface is dimensional lumber bolted to welded angle tabs on the frame. Copper electrodes are applied as continuous strips across each seating zone, routed through holes in the wood to the electronics cavity underneath. All wiring and the ESP32 are housed in a 3D printed or sheet metal enclosure bolted to the frame's underside.

```
docs/
  wiring.png
  build-photos/
```

## Build status

- [x] Steel frame fabricated
- [x] Seat surface cut and mounted
- [x] Capacitive touch wiring and calibration
- [x] Environmental sensor integration
- [x] Solar charging circuit
- [x] OLED local display
- [x] WiFi web dashboard
- [x] Enclosure for electronics
- [x] Final documentation

## Author

Adam Perez
