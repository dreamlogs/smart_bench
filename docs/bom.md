# Bill of Materials

All parts ordered May 7, 2026. Arriving May 8, 2026.

---

## Microcontroller

| Part | Notes |
|---|---|
| ESP32 Dev Board | 38-pin, dual-core 240MHz, built-in WiFi + Bluetooth, built-in capacitive touch pins |

## Sensors

| Part | Protocol | Notes |
|---|---|---|
| DHT22 | Single-wire | Temp range: -40 to 80C, humidity 0-100% RH, 0.1 resolution |
| BH1750 | I2C | Lux range: 1-65535 lux, 16-bit output |

## Display

| Part | Protocol | Notes |
|---|---|---|
| SSD1306 OLED (128x64) | I2C | 0.96", 3.3V or 5V compatible |

## Power

| Part | Notes |
|---|---|
| TP4056 with DW01A protection | Li-ion charge controller, micro USB input, 1A charge current |
| 18650 Li-ion cell | 3.7V nominal, 3000-3500mAh typical |
| 5V solar panel | Sized to maintain float charge under typical indoor/outdoor light |

## Occupancy Detection

| Part | Notes |
|---|---|
| Copper tape | Applied to bench surface, wired to ESP32 touch pins for capacitive sensing |

---

## Wiring Notes (To Be Filled In)

- BH1750 SDA and SCL to ESP32 GPIO 21 and 22
- DHT22 data pin to ESP32 GPIO 4 (with 10k pullup)
- SSD1306 SDA and SCL share I2C bus with BH1750
- TP4056 output to ESP32 VIN or 3.3V rail (TBD pending voltage check)
- Copper tape pads to ESP32 T0-T9 touch pins

---

## Total Parts Count

8 components. No PCB. Breadboard or direct wire for v1.
