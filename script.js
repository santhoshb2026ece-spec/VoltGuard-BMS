// VoltGuard BMS - educational battery telemetry simulation.
// Values are generated in the browser and are NOT readings from real hardware.

const $ = (id) => document.getElementById(id);

const state = {
  soc: 82,
  voltage: 48.6,
  current: 2.4,
  temperature: 29.4,
  health: 96,
  running: true,
  mode: "discharging",
  tick: 0,
  history: [],
  alerts: [],
  lastAlertKey: ""
};

const thresholds = {
  overVoltage: 54.0,
  underVoltage: 42.0,
  temperature: 45.0
};

const metricInfo = {
  voltage: { label: "Pack voltage", color: "#42d6bd", min: 40, max: 56 },
  soc: { label: "State of charge", color: "#6d9eff", min: 0, max: 100 },
  temperature: { label: "Temperature", color: "#f4b860", min: 15, max: 60 },
  current: { label: "Pack current", color: "#bd9cff", min: -5, max: 8 }
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function addHistory() {
  state.history.push({
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    voltage: Number(state.voltage.toFixed(2)),
    soc: Number(state.soc.toFixed(1)),
    temperature: Number(state.temperature.toFixed(1)),
    current: Number(state.current.toFixed(2))
  });
  if (state.history.length > 20) state.history.shift();
}

function simulateStep() {
  state.tick += 1;

  // Small changes create a live-style demonstration without connecting hardware.
  if (state.mode === "charging") {
    state.soc = Math.min(100, state.soc + randomBetween(0.12, 0.28));
    state.current = -randomBetween(1.2, 3.0);
  } else {
    state.soc = Math.max(5, state.soc - randomBetween(0.04, 0.16));
    state.current = randomBetween(1.0, 3.8);
  }

  state.voltage = 42 + (state.soc / 100) * 9.8 + randomBetween(-0.18, 0.18);
  state.temperature = Math.max(24, Math.min(48, state.temperature + randomBetween(-0.35, 0.45)));
  // Slowly return temperature toward room temperature during this demo.
  state.temperature += (29.5 - state.temperature) * 0.04;

  addHistory();
  checkProtection();
  render();
}

function checkProtection() {
  const issues = [];
  if (state.voltage > thresholds.overVoltage) issues.push({ key: "over", title: "Overvoltage warning", detail: `Pack voltage is ${state.voltage.toFixed(1)} V.` });
  if (state.voltage < thresholds.underVoltage) issues.push({ key: "under", title: "Undervoltage warning", detail: `Pack voltage is ${state.voltage.toFixed(1)} V.` });
  if (state.temperature > thresholds.temperature) issues.push({ key: "temp", title: "High temperature warning", detail: `Temperature is ${state.temperature.toFixed(1)} °C.` });

  const key = issues.map(issue => issue.key).join("-");
  if (key && key !== state.lastAlertKey) {
    issues.forEach(issue => {
      state.alerts.unshift({ ...issue, time: new Date().toLocaleTimeString() });
    });
    state.alerts = state.alerts.slice(0, 12);
  }
  state.lastAlertKey = key;
}

function setText(id, value) {
  $(id).textContent = value;
}

function renderProtection() {
  const over = state.voltage <= thresholds.overVoltage;
  const under = state.voltage >= thresholds.underVoltage;
  const temp = state.temperature <= thresholds.temperature;

  $("voltageCheck").textContent = over ? "✓" : "!";
  $("lowVoltageCheck").textContent = under ? "✓" : "!";
  $("temperatureCheck").textContent = temp ? "✓" : "!";
  $("voltageCheck").style.color = over ? "var(--green)" : "var(--red)";
  $("lowVoltageCheck").style.color = under ? "var(--green)" : "var(--red)";
  $("temperatureCheck").style.color = temp ? "var(--green)" : "var(--red)";

  const allGood = over && under && temp;
  $("overallStatus").textContent = allGood ? "● ALL SYSTEMS NORMAL" : "● ATTENTION REQUIRED";
  $("overallStatus").style.color = allGood ? "var(--green)" : "var(--red)";
  $("temperatureStatus").textContent = temp ? "● Normal range" : "● High temperature";
  $("temperatureStatus").style.color = temp ? "var(--green)" : "var(--red)";
}

function renderAlerts() {
  const list = $("alertList");
  if (!state.alerts.length) {
    list.innerHTML = '<div class="empty-alert"><span>✓</span><div><strong>No active alerts</strong><small>System is operating within demo limits.</small></div></div>';
    return;
  }
  list.innerHTML = state.alerts.map(alert => `
    <div class="alert-entry ${alert.key === "temp" ? "critical" : "warning"}">
      <span class="alert-symbol">⚠</span>
      <div><strong>${alert.title}</strong><small>${alert.detail} · ${alert.time}</small></div>
    </div>`).join("");
}

function render() {
  setText("socValue", Math.round(state.soc));
  setText("socState", state.soc > 70 ? "Healthy charge" : state.soc > 30 ? "Moderate charge" : "Low charge");
  setText("voltageValue", state.voltage.toFixed(1));
  setText("currentValue", Math.abs(state.current).toFixed(1));
  setText("currentDirection", state.current < 0 ? "CHARGING" : "DISCHARGING");
  $("currentDirection").style.color = state.current < 0 ? "var(--green)" : "var(--blue)";
  setText("temperatureValue", state.temperature.toFixed(1));
  setText("batteryPercent", `${Math.round(state.soc)}%`);
  setText("energyValue", `${(48 * 20 * state.soc / 100 / 1000).toFixed(2)} kWh`);
  setText("healthValue", `${state.health}%`);

  $("socRing").style.background = `conic-gradient(var(--teal) 0 ${state.soc}%, #2b3b4b ${state.soc}% 100%)`;
  $("batteryFill").style.width = `${state.soc}%`;
  renderProtection();
  renderAlerts();
  updateChart();
  setText("lastUpdated", `Updated ${new Date().toLocaleTimeString()}`);
}

let chart;
function initChart() {
  const ctx = $("telemetryChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: state.history.map(item => item.time),
      datasets: [{
        label: "Pack voltage",
        data: state.history.map(item => item.voltage),
        borderColor: metricInfo.voltage.color,
        backgroundColor: "rgba(66,214,189,.10)",
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: "#0b111b", titleColor: "#eaf1f7", bodyColor: "#b8c7d7", borderColor: "#34485d", borderWidth: 1 }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#71849a", maxTicksLimit: 5, font: { size: 9 } } },
        y: { grid: { color: "rgba(130,148,168,.12)" }, ticks: { color: "#71849a", font: { size: 9 } } }
      }
    }
  });
}

function updateChart() {
  if (!chart) return;
  const metric = $("chartMetric").value;
  const info = metricInfo[metric];
  chart.data.labels = state.history.map(item => item.time);
  chart.data.datasets[0].label = info.label;
  chart.data.datasets[0].data = state.history.map(item => item[metric]);
  chart.data.datasets[0].borderColor = info.color;
  chart.data.datasets[0].backgroundColor = `${info.color}18`;
  chart.options.scales.y.min = info.min;
  chart.options.scales.y.max = info.max;
  chart.update("none");
  setText("chartLegendText", info.label);
}

function resetSimulation() {
  state.soc = 82;
  state.voltage = 48.6;
  state.current = 2.4;
  state.temperature = 29.4;
  state.health = 96;
  state.mode = "discharging";
  state.tick = 0;
  state.history = [];
  state.alerts = [];
  state.lastAlertKey = "";
  for (let i = 0; i < 8; i++) {
    state.voltage += randomBetween(-0.05, 0.05);
    addHistory();
  }
  state.running = true;
  $("toggleBtn").textContent = "Ⅱ  Pause simulation";
  render();
}

function toggleSimulation() {
  state.running = !state.running;
  $("toggleBtn").textContent = state.running ? "Ⅱ  Pause simulation" : "▶  Resume simulation";
}

// Export recorded demo readings as a CSV file.
function exportCSV() {
  const headers = ["Time", "State of Charge (%)", "Voltage (V)", "Current (A)", "Temperature (C)"];
  const rows = state.history.map(item => [item.time, item.soc, item.voltage, item.current, item.temperature]);
  const csv = [headers, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "voltguard-battery-readings.csv";
  link.click();
  URL.revokeObjectURL(url);
}

$("toggleBtn").addEventListener("click", toggleSimulation);
$("resetBtn").addEventListener("click", resetSimulation);
$("exportTop").addEventListener("click", exportCSV);
$("chartMetric").addEventListener("change", updateChart);
$("clearAlerts").addEventListener("click", () => {
  state.alerts = [];
  state.lastAlertKey = "";
  renderAlerts();
});

// Seed initial chart data and begin periodic demo updates.
resetSimulation();
initChart();
render();
setInterval(() => {
  if (state.running) simulateStep();
}, 1800);
