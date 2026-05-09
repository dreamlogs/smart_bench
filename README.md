git add README.md && git commit -m "update: parts received May 8 2026" && git push# Smart Bench

A sensor-equipped workbench with local environmental monitoring, occupancy detection, solar charging, and a WiFi dashboard. Built on a welded steel frame.

## Status

**Parts ordered. Received May 8, 2026. Starting build.**

---

## Hardware

| Component | Purpose |
|---|---|
| ESP32 | Microcontroller, WiFi dashboard host |
| DHT22 | Temperature and humidity sensor |
| BH1750 | Ambient light sensor |
| Copper tape (capacitive) | Occupancy detection |
| OLED display | Local readout |
| TP4056 module | Solar charge controller |
| 18650 Li-ion cell | Battery |
| Solar panel | Power input |

## Frame

Welded steel. 19" x 66" x 26" (W x L x H).

## Planned Features

- Capacitive touch occupancy detection via copper tape grid
- Environmental logging (temp, humidity, lux)
- Local OLED display showing live sensor readings
- Solar charging with 18650 battery backup
- ESP32 WiFi dashboard accessible on local network

## Planned Software Stack

- **Firmware:** Arduino C++ via PlatformIO (VS Code)
- **Dashboard:** ESP32 web server serving a lightweight HTML page
- **Sensors:** DHT22 over single-wire, BH1750 over I2C
- **Capacitive touch:** ESP32 built-in touch pins or standalone capacitive IC

## Repo Structure (Planned)

```
smart_bench/
├── firmware/
│   ├── src/
│   │   └── main.cpp
│   └── platformio.ini
├── docs/
│   ├── wiring_diagram.pdf
│   └── bom.md
└── README.md
```

## Build Log

| Date | Milestone |
|---|---|
| Early 2026 | Frame welded (19x66x26 steel) |
| May 7, 2026 | Parts ordered |
| May 8, 2026 | Parts Received: Esp32 x3, DHT22, OLED x5, TTP223 x10, TP4056x3, 18650 holders x20, solar panels. 22AWG wire, heat shrink  |
| TBD | Wiring and sensor integration |
| TBD | Firmware v1 (sensor reads + OLED) |
| TBD | WiFi dashboard live |
| TBD | Solar charging integrated |

## Notes

- Frame dimensions finalized in Rhino with 0.01" decimal tolerance
- Capacitive occupancy detection is primary bench interaction sensor
- WiFi dashboard is local only, no cloud dependency
