/* =========================================================
   PilotApp – app.js
   Fokus: Short, Long & Graph stabil
   ========================================================= */

console.log("APP.JS LOADED");

// ---------------------------------------------------------
// STATE
// ---------------------------------------------------------
let currentPerson = null;
let currentView = "short";
let currentHours = 24;
let autoRefresh = false;
let autoTimer = null;
let chart = null;

// ---------------------------------------------------------
// DOM
// ---------------------------------------------------------
const personsEl = document.getElementById("persons");
const contentEl = document.getElementById("content");
const statusEl = document.getElementById("status");

// ---------------------------------------------------------
// INIT
// ---------------------------------------------------------
init();

function init() {
  bindViewButtons();
  bindHourButtons();
  bindAutoRefresh();
  loadPersons();
}

// ---------------------------------------------------------
// PERSONEN
// ---------------------------------------------------------
async function loadPersons() {
  try {
    const res = await fetch("data/workstart_index.json", { cache: "no-store" });
    const data = await res.json();

    personsEl.innerHTML = "";
    data.persons.forEach(p => {
      const btn = document.createElement("button");
      btn.textContent = `${p.vorname} ${p.nachname}`;
      btn.onclick = (e) => selectPerson(p, e);
      personsEl.appendChild(btn);
    });

  } catch (e) {
    personsEl.textContent = "Fehler beim Laden der Personen";
    console.error(e);
  }
}

function selectPerson(person, event) {
  currentPerson = person;
  [...personsEl.children].forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  renderView();
}

// ---------------------------------------------------------
// VIEW SWITCH
// ---------------------------------------------------------
function bindViewButtons() {
  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("[data-view]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentView = btn.dataset.view;
      renderView();
    };
  });
}

function renderView() {
  if (!currentPerson) {
    contentEl.textContent = "Bitte Person auswählen";
    return;
  }

  if (currentView === "short") loadShort();
  if (currentView === "long") loadLong();
  if (currentView === "graph") renderGraphView();
}

// ---------------------------------------------------------
// SHORT
// ---------------------------------------------------------
async function loadShort() {
  contentEl.innerHTML = "<h2>Short</h2><p>Lade Daten …</p>";

  try {
    const res = await fetch(`data/${currentPerson.key}_short.json`, { cache: "no-store" });
    const data = await res.json();

    contentEl.innerHTML = `
      <h2>Short</h2>
      <pre>${data.short}</pre>
    `;
  } catch (e) {
    contentEl.textContent = "Fehler beim Laden der Short-Daten";
    console.error(e);
  }
}

// ---------------------------------------------------------
// LONG
// ---------------------------------------------------------
async function loadLong() {
  contentEl.innerHTML = "<h2>Long</h2><p>Lade Long-Daten …</p>";

  try {
    const res = await fetch(`data/${currentPerson.key}_long.json`, { cache: "no-store" });
    const data = await res.json();

    contentEl.innerHTML = `
      <h2>Long</h2>
      <pre>${data.long}</pre>
    `;
  } catch (e) {
    contentEl.textContent = "Fehler beim Laden der Long-Daten";
    console.error(e);
  }
}

// ---------------------------------------------------------
// GRAPH
// ---------------------------------------------------------
function renderGraphView() {
  contentEl.innerHTML = `<canvas id="chart" style="width:100%;max-height:70vh"></canvas>`;
  loadGraph();
}

async function loadGraph() {
  try {
    const res = await fetch(`data/workstart_history_${currentPerson.key}.json`, { cache: "no-store" });
    const data = await res.json();
    buildChart(data.entries || []);
    statusEl.textContent = new Date().toLocaleTimeString("de-DE");
  } catch (e) {
    contentEl.innerHTML = "<p>Fehler beim Laden des Graphen</p>";
    console.error(e);
  }
}

function buildChart(entries) {
  if (chart) chart.destroy();

  const cutoff = Date.now() - currentHours * 3600 * 1000;

  const points = entries
    .map(e => ({
      x: new Date(e.ts_calc.replace(" ", "T")),
      y1: e.from_meldung ? new Date(e.from_meldung.replace(" ", "T")) : null,
      y2: e.from_meldung_alt ? new Date(e.from_meldung_alt.replace(" ", "T")) : null,
      y3: e.calc_div2 ? new Date(e.calc_div2.replace(" ", "T")) : null,
      y4: e.calc_div3 ? new Date(e.calc_div3.replace(" ", "T")) : null,
    }))
    .filter(p => p.x && p.x.getTime() >= cutoff);

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      datasets: [
        dataset("Meldung", points, "y1", "#fbbf24"),
        dataset("Meldung alt", points, "y2", "#60a5fa"),
        dataset("Calc /2", points, "y3", "#ef4444"),
        dataset("Calc /3", points, "y4", "#22c55e"),
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { type: "time" },
        y: { type: "time" }
      }
    }
  });
}

function dataset(label, points, key, color) {
  return {
    label,
    data: points.filter(p => p[key]).map(p => ({ x: p.x, y: p[key] })),
    borderColor: color,
    borderWidth: 2,
    tension: 0.2,
    pointRadius: 0
  };
}

// ---------------------------------------------------------
// ZEITFILTER
// ---------------------------------------------------------
function bindHourButtons() {
  document.querySelectorAll("[data-hours]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("[data-hours]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentHours = Number(btn.dataset.hours);
      if (currentView === "graph") loadGraph();
    };
  });
}

// ---------------------------------------------------------
// AUTO REFRESH
// ---------------------------------------------------------
function bindAutoRefresh() {
  const btn = document.getElementById("autoRefresh");
  if (!btn) return;

  btn.onclick = () => {
    autoRefresh = !autoRefresh;
    btn.classList.toggle("active", autoRefresh);

    if (autoRefresh) {
      autoTimer = setInterval(() => {
        if (currentView === "graph") loadGraph();
      }, 60000);
    } else {
      clearInterval(autoTimer);
    }
  };
}