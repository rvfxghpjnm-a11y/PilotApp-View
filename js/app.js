/* =========================================================
   PilotApp – app.js
   Short / Long / Graph STABIL
   ========================================================= */

console.log("APP.JS LOADED");

// ---------------------------------------------------------
// STATE
// ---------------------------------------------------------
let currentPerson = null;
let currentView = localStorage.getItem("pilotapp_view") || "short";
let currentHours = Number(localStorage.getItem("pilotapp_hours")) || 24;

// ---------------------------------------------------------
// DOM
// ---------------------------------------------------------
const personsEl = document.getElementById("persons");
const contentEl = document.getElementById("content");
const statusEl = document.getElementById("status");
const timeControlsEl = document.getElementById("timeControls");

// ---------------------------------------------------------
// INIT
// ---------------------------------------------------------
init();

function init() {
  bindViewButtons();
  bindHourButtons();
  bindRefreshButton();
  loadPersons();

  setInterval(refreshCurrentView, 60000); // Auto-Refresh immer
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
      btn.onclick = (e) => selectPerson(p, e.target);
      personsEl.appendChild(btn);
    });

    if (data.persons.length) {
      selectPerson(data.persons[0], personsEl.children[0]);
    }

  } catch (e) {
    personsEl.textContent = "Fehler beim Laden der Personen";
    console.error(e);
  }
}

function selectPerson(person, btn) {
  currentPerson = person;
  localStorage.setItem("pilotapp_person", person.key);

  [...personsEl.children].forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

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
      localStorage.setItem("pilotapp_view", currentView);

      renderView();
    };
  });
}

function renderView() {
  if (!currentPerson) {
    contentEl.textContent = "Bitte Person auswählen";
    return;
  }

  timeControlsEl.style.display = currentView === "graph" ? "flex" : "none";

  if (currentView === "short") loadShort();
  if (currentView === "long") loadLong();
  if (currentView === "graph") loadGraphView();
}

// ---------------------------------------------------------
// SHORT / LONG
// ---------------------------------------------------------
async function loadShort() {
  contentEl.innerHTML = "<h2>Short</h2><p>Lade …</p>";
  const res = await fetch(`data/${currentPerson.key}_short.json`);
  const data = await res.json();
  contentEl.innerHTML = `<h2>Short</h2><pre>${data.short}</pre>`;
}

async function loadLong() {
  contentEl.innerHTML = "<h2>Long</h2><p>Lade …</p>";
  const res = await fetch(`data/${currentPerson.key}_long.json`);
  const data = await res.json();
  contentEl.innerHTML = `<h2>Long</h2><pre>${data.long}</pre>`;
}

// ---------------------------------------------------------
// GRAPH
// ---------------------------------------------------------
async function loadGraphView() {
  contentEl.innerHTML = `<canvas id="chart"></canvas>`;
  await loadGraph();
}

async function loadGraph() {
  const res = await fetch(`data/${currentPerson.file}`, { cache: "no-store" });
  const data = await res.json();

  const mod = await import("./graph.js");
  mod.renderWorkstartChart(data.entries || [], currentHours);

  statusEl.textContent = new Date().toLocaleTimeString("de-DE");
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
      localStorage.setItem("pilotapp_hours", currentHours);

      if (currentView === "graph") loadGraph();
    };
  });
}

// ---------------------------------------------------------
// REFRESH
// ---------------------------------------------------------
function bindRefreshButton() {
  document.getElementById("refreshNow").onclick = refreshCurrentView;
}

function refreshCurrentView() {
  if (currentView === "graph") loadGraph();
  if (currentView === "short") loadShort();
  if (currentView === "long") loadLong();
}