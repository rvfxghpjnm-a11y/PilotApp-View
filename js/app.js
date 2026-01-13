/* =========================================================
   PilotApp – app.js
   Persistenter State + Auto Refresh
   ========================================================= */

console.log("APP.JS LOADED");

// ---------------------------------------------------------
// STATE
// ---------------------------------------------------------
let currentPerson = null;
let currentView = localStorage.getItem("pilotapp_view") || "short";
let currentHours = Number(localStorage.getItem("pilotapp_hours")) || 24;
let autoTimer = null;

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
  bindManualRefresh();
  loadPersons();
  startAutoRefresh();
}

// ---------------------------------------------------------
// PERSONEN
// ---------------------------------------------------------
async function loadPersons() {
  try {
    const res = await fetch("data/workstart_index.json", { cache: "no-store" });
    const data = await res.json();

    personsEl.innerHTML = "";

    const savedPersonKey = localStorage.getItem("pilotapp_person");

    data.persons.forEach((p, i) => {
      const btn = document.createElement("button");
      btn.textContent = `${p.vorname} ${p.nachname}`;
      btn.dataset.key = p.key;

      btn.onclick = () => selectPerson(p, btn);

      personsEl.appendChild(btn);

      // 🔑 Restore letzte Person
      if (p.key === savedPersonKey || (!savedPersonKey && i === 0)) {
        selectPerson(p, btn, true);
      }
    });

  } catch (e) {
    personsEl.textContent = "Fehler beim Laden der Personen";
    console.error(e);
  }
}

function selectPerson(person, btn, silent = false) {
  currentPerson = person;
  localStorage.setItem("pilotapp_person", person.key);

  [...personsEl.children].forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  if (!silent) renderView();
}

// ---------------------------------------------------------
// VIEW SWITCH
// ---------------------------------------------------------
function bindViewButtons() {
  document.querySelectorAll("[data-view]").forEach(btn => {
    const view = btn.dataset.view;

    // 🔑 Restore View
    if (view === currentView) btn.classList.add("active");
    else btn.classList.remove("active");

    btn.onclick = () => {
      document.querySelectorAll("[data-view]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentView = view;
      localStorage.setItem("pilotapp_view", view);

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
// SHORT
// ---------------------------------------------------------
async function loadShort() {
  contentEl.innerHTML = "<h2>Short</h2><p>Lade Daten …</p>";
  const res = await fetch(`data/${currentPerson.key}_short.json`, { cache: "no-store" });
  const data = await res.json();
  contentEl.innerHTML = `<h2>Short</h2><pre>${data.short}</pre>`;
}

// ---------------------------------------------------------
// LONG
// ---------------------------------------------------------
async function loadLong() {
  contentEl.innerHTML = "<h2>Long</h2><p>Lade Daten …</p>";
  const res = await fetch(`data/${currentPerson.key}_long.json`, { cache: "no-store" });
  const data = await res.json();
  contentEl.innerHTML = `<h2>Long</h2><pre>${data.long}</pre>`;
}

// ---------------------------------------------------------
// ZEITFILTER (Graph)
// ---------------------------------------------------------
function bindHourButtons() {
  document.querySelectorAll("[data-hours]").forEach(btn => {
    const hours = Number(btn.dataset.hours);

    // 🔑 Restore Stunden
    if (hours === currentHours) btn.classList.add("active");
    else btn.classList.remove("active");

    btn.onclick = () => {
      document.querySelectorAll("[data-hours]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentHours = hours;
      localStorage.setItem("pilotapp_hours", hours);

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