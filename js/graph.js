// js/graph.js
// ============================================================
// WORKSTART GRAPH – STABIL & FEHLERTOLERANT
// ============================================================

let chart = null;
let currentHours = 24;

// ------------------------------------------------------------
// WAIT UNTIL READY
// ------------------------------------------------------------

function waitForReady() {
  const canvas = document.getElementById("workstartChart");

  if (!canvas || !window.PILOTAPP_PERSON || !window.Chart) {
    setTimeout(waitForReady, 50);
    return;
  }

  initGraph(canvas);
}

waitForReady();

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------

function initGraph(canvas) {
  document
    .querySelectorAll(".time-buttons button")
    .forEach(btn => {
      btn.onclick = () => {
        document
          .querySelectorAll(".time-buttons button")
          .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");
        currentHours = Number(btn.dataset.hours);
        loadGraph(canvas);
      };
    });

  loadGraph(canvas);
}

// ------------------------------------------------------------
// LOAD DATA
// ------------------------------------------------------------

async function loadGraph(canvas) {
  const file =
    `data/workstart_history_${window.PILOTAPP_PERSON}.json`;

  try {
    const res = await fetch(file, { cache: "no-store" });
    if (!res.ok) throw new Error("JSON nicht ladbar");

    const json = await res.json();
    drawGraph(canvas, json.entries || []);

  } catch (err) {
    showError(canvas, "Workstart-Daten konnten nicht geladen werden");
    console.error(err);
  }
}

// ------------------------------------------------------------
// DRAW
// ------------------------------------------------------------

function drawGraph(canvas, entries) {
  if (chart) chart.destroy();

  if (!entries.length) {
    showError(canvas, "Keine Daten vorhanden");
    return;
  }

  const now = Date.now();
  const cutoff = now - currentHours * 3600 * 1000;

  const points = entries
    .map(e => ({
      x: parseTime(e.ts_calc),
      y: parseTime(e.calc_div3)
    }))
    .filter(p => p.x && p.y && p.x.getTime() >= cutoff);

  if (!points.length) {
    showError(canvas, "Keine Daten im Zeitfenster");
    return;
  }

  chart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      datasets: [{
        label: "Prognose Arbeitsbeginn",
        data: points,
        borderColor: "#4aa3ff",
        backgroundColor: "#4aa3ff",
        tension: 0.25,
        pointRadius: 0
      }]
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
          type: "time",
          time: { unit: "hour" },
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
// HELPERS
// ------------------------------------------------------------

function parseTime(str) {
  if (!str) return null;
  const d = new Date(str.replace(" ", "T"));
  return isNaN(d) ? null : d;
}

function showError(canvas, msg) {
  canvas.parentElement.innerHTML =
    `<div class="error-box">${msg}</div>`;
}