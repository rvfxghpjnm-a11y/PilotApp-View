/* =========================================================
   PilotApp – app.js
   Auto-Refresh immer aktiv + manueller Refresh
   ========================================================= */

console.log("APP.JS LOADED");

let currentPerson = null;
let currentView = "short";
let currentHours = 24;
let autoTimer = null;

const personsEl = document.getElementById("persons");
const contentEl = document.getElementById("content");
const statusEl = document.getElementById("status");

init();

function init() {
  bindViewButtons();
  bindHourButtons();
  bindManualRefresh();
  loadPersons();
  startAutoRefresh();
}

// ---------------------------------------------------------
// PERSONEN
// ---------------------------------------------------------
async function loadPersons() {
  try {
    const res = await fetch("data/workstart_index.json");
    const data = await res.json();

    personsEl.innerHTML = "";
    data.persons.forEach(p => {
      const btn = document.createElement("button");
      btn.textContent = `${p.vorname} ${p.nachname}`;
      btn.onclick = () => selectPerson(p, btn);
      personsEl.appendChild(btn);
    });
  } catch (e) {
    personsEl.textContent = "Fehler beim Laden der Personen";
    console.error(e);
  }
}

function selectPerson(person, btn) {
  currentPerson = person;
  [...personsEl.children].forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderView();
}

// ---------------------------------------------------------
// VIEW
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
  if (currentView === "graph") {
    contentEl.innerHTML = "<canvas id='chart'></canvas>";
    if (typeof loadGraph === "function") loadGraph();
  }

  statusEl.textContent = new Date().toLocaleTimeString("de-DE");
}

// ---------------------------------------------------------
// SHORT / LONG
// ---------------------------------------------------------
async function loadShort() {
  contentEl.innerHTML = "<h2>Short</h2><p>Lade Daten …</p>";
  const res = await fetch(`data/${currentPerson.key}_short.json`);
  const data = await res.json();
  contentEl.innerHTML = `<h2>Short</h2><pre>${data.short}</pre>`;
}

async function loadLong() {
  contentEl.innerHTML = "<h2>Long</h2><p>Lade Daten …</p>";
  const res = await fetch(`data/${currentPerson.key}_long.json`);
  const data = await res.json();
  contentEl.innerHTML = `<h2>Long</h2><pre>${data.long}</pre>`;
}

// ---------------------------------------------------------
// ZEITFILTER (Graph)
// ---------------------------------------------------------
function bindHourButtons() {
  document.querySelectorAll("[data-hours]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("[data-hours]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentHours = Number(btn.dataset.hours);
      if (currentView === "graph" && typeof loadGraph === "function") loadGraph();
    };
  });
}

// ---------------------------------------------------------
// REFRESH
// ---------------------------------------------------------
function bindManualRefresh() {
  const btn = document.getElementById("refreshNow");
  if (!btn) return;
  btn.onclick = () => renderView();
}

function startAutoRefresh() {
  autoTimer = setInterval(() => {
    if (currentPerson) renderView();
  }, 60000);
}