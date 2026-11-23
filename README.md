# VoltGuard – Smart Battery Management System (BMS)

VoltGuard is a browser-based **battery monitoring dashboard simulation** built as an intermediate beginner ECE + software portfolio project. It demonstrates how a Battery Management System (BMS) interface can display battery telemetry, visualize performance and show protection alerts.

> **Important:** This is a software simulation. It does not connect to a real battery, measure physical voltage/current/temperature, or provide safety protection. Values are generated in JavaScript for demonstration and learning.

## Features

- Live-style simulated State of Charge (SOC), voltage, current and temperature readings
- Charging and discharging indication
- Battery pack visualization and estimated remaining energy
- Battery State of Health (SOH) display (illustrative demo value)
- Interactive chart with selectable voltage, SOC, current and temperature data
- Simulated overvoltage, undervoltage and temperature warning checks
- Event log with clear option
- Start/pause and reset controls
- Export recent telemetry readings to CSV
- Responsive dashboard for desktop and mobile

## Built with

- HTML5
- CSS3
- JavaScript (vanilla)
- Chart.js
- Git and GitHub

## Project structure

```text
voltguard-bms/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run locally

1. Download or clone this repository.
2. Open the folder in Visual Studio Code.
3. Open `index.html` in a browser, or use the Live Server extension.
4. Internet access is required for the Chart.js CDN and Google Fonts used by the page.

No build tools, package manager or framework installation is needed.

## How to use

1. Open the dashboard.
2. Watch the simulated battery readings update automatically.
3. Use **Pause simulation** to stop updates and **Resume simulation** to continue.
4. Use **Reset** to restore the initial demo values.
5. Change the chart dropdown to view different telemetry parameters.
6. Use the download icon to export the visible reading history as a CSV file.
7. The protection panel checks demo readings against illustrative thresholds.

## Concepts demonstrated

- Battery State of Charge (SOC)
- Battery State of Health (SOH)
- Voltage, current and temperature monitoring
- Charging and discharging states
- Basic protection thresholds
- Telemetry visualization and time-series charts
- DOM manipulation, event handling and CSV export

## Future improvements

- Connect an ESP32 with suitable voltage, current and temperature sensors
- Stream real readings through a backend or MQTT broker
- Add cell-level voltage monitoring and balancing visualization
- Store readings in a database
- Add user-configurable warning thresholds and downloadable reports

## Safety and accuracy note

This project is intended for educational demonstration only. The displayed battery values, State of Health and protection events are simulated or illustrative. The dashboard must not be used to operate, charge, diagnose or protect a real battery pack. Real BMS design requires appropriate hardware, validated measurement circuits, protection components, testing and engineering review.

## Author

**Your Name**  
First-Year Electronics and Communication Engineering Student

## License

This project is shared under the MIT License. See `LICENSE`.
