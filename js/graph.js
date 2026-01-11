// js/graph.js
// ============================================================
// WORKSTART GRAPH – FINAL (INHALTLICH SINNVOLL)
// ============================================================

let chart = null;
let currentHours = 24;

const ctx = document.getElementById("workstartChart");
if (!ctx) {
  console.error("Canvas workstartChart nicht gefunden");
}

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------

document.querySelectorAll(".time-buttons button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".time-buttons button")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentHours = Number(btn.dataset.hours);
    loadGraph();
  };
});

loadGraph();

// ------------------------------------------------------------
// HAUPTFUNKTION
// ------------------------------------------------------------

async function loadGraph() {
  if (!window.PILOTAPP_PERSON) {
    console.warn("Keine Person gesetzt");
    return;
  }

  const file = `data/workstart_history_${window.PILOTAPP_PERSON}.json`;

  try {
    const res = await fetch(file, { cache: "no-store" });
    if (!res.ok) throw new Error("Workstart JSON nicht ladbar");

    const data = await res.json();
    buildChart(data.entries || []);

  } catch (err) {
    console.error(err);
    showError("Workstart-Daten konnten nicht geladen werden");
  }
}

// ------------------------------------------------------------
// CHART
// ------------------------------------------------------------

function buildChart(entries) {
  if (chart) chart.destroy();

  const now = Date.now();
  const cutoff = now - currentHours * 3600 * 1000;

  const filtered = entries
    .map(e => ({
      t: parseTime(e.ts_calc),
      pos: e.pos,
      div2: parseTime(e.calc_div2),
      div3: parseTime(e.calc_div3),
      meldung: parseTime(e.from_meldung),
      real: parseTime(e.real_start)
    }))
    .filter(e => e.t && e.t.getTime() >= cutoff);

  if (!filtered.length) {
    showError("Keine Daten im gewählten Zeitfenster");
    return;
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        dataset("Position", filtered.map(e => ({ x: e.t, y: e.pos })), "#4aa3ff"),
        dataset("calc_div3", filtered.map(e => ({ x: e.t, y: e.div3 })), "#00c853"),
        dataset("from_meldung", filtered.map(e => ({ x: e.t, y: e.meldung })), "#ffb300"),
        dataset("calc_div2", filtered.map(e => ({ x: e.t, y: e.div2 })), "#e53935"),
        dataset("real_start", filtered
          .filter(e => e.real)
          .map(e => ({ x: e.t, y: e.real })), "#ffffff", true)
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "time",
          time: { unit: "hour" },
          ticks: { color: "#ccc" }
        },
        y: {
          ticks: { color: "#ccc" }
        }
      },
      plugins: {
        legend: {
          labels: { color: "#ccc" }
        }
      }
    }
  });
}

// ------------------------------------------------------------
// HELFER
// ------------------------------------------------------------

function dataset(label, data, color, points = false) {
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: color,
    borderWidth: 2,
    tension: 0.2,
    pointRadius: points ? 4 : 0,
    showLine: !points
  };
}

function parseTime(str) {
  if (!str) return null;
  const d = new Date(str.replace(" ", "T"));
  return isNaN(d) ? null : d;
}

function showError(msg) {
  ctx.parentElement.innerHTML =
    `<div class="error-box">${msg}</div>`;
}