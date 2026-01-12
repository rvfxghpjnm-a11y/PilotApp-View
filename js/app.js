// js/app.js
// ============================================================
// PILOTAPP – APP CONTROLLER (SPLIT STEP 2, STABIL)
// ============================================================

import { renderWorkstartChart } from "./graph.js";

let currentPerson = null;
let currentHours = 24;

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
init();

function init() {
  bindHourButtons();
  loadPersons();
}

// ------------------------------------------------------------
// ZEITFENSTER BUTTONS
// ------------------------------------------------------------
function bindHourButtons() {
  document.querySelectorAll("button[data-hours]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("button[data-hours]")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      currentHours = Number(btn.dataset.hours);

      if (currentPerson) loadGraph();
    };
  });
}

// ------------------------------------------------------------
// PERSONEN LADEN
// ------------------------------------------------------------
async function loadPersons() {
  const wrap = document.getElementById("persons");

  try {
    const res = await fetch("data/workstart_index.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Index nicht ladbar");

    const index = await res.json();
    wrap.innerHTML = "";

    index.persons.forEach((p, i) => {
      const btn = document.createElement("button");
      btn.textContent = `${p.vorname} ${p.nachname}`;
      btn.dataset.key = p.key;

      btn.onclick = () => {
        setActivePerson(btn, p);
      };

      // Erste Person automatisch aktiv
      if (i === 0) {
        btn.classList.add("active");
        currentPerson = p;
      }

      wrap.appendChild(btn);
    });

    if (currentPerson) loadGraph();

  } catch (err) {
    console.error(err);
    wrap.innerHTML = `<div class="error">Personen konnten nicht geladen werden</div>`;
  }
}

// ------------------------------------------------------------
// PERSON AKTIV SETZEN
// ------------------------------------------------------------
function setActivePerson(btn, person) {
  document.querySelectorAll("#persons button")
    .forEach(b => b.classList.remove("active"));

  btn.classList.add("active");
  currentPerson = person;
  loadGraph();
}

// ------------------------------------------------------------
// GRAPH LADEN
// ------------------------------------------------------------
async function loadGraph() {
  if (!currentPerson) return;

  try {
    const file = `data/${currentPerson.file}`;
    const res = await fetch(file, { cache: "no-store" });
    if (!res.ok) throw new Error("Workstart-Datei nicht ladbar");

    const data = await res.json();
    renderWorkstartChart(data.entries || [], currentHours);

    updateStatusTime();

  } catch (err) {
    console.error(err);
  }
}

// ------------------------------------------------------------
// STATUS
// ------------------------------------------------------------
function updateStatusTime() {
  const el = document.getElementById("status");
  if (!el) return;

  el.textContent = new Date().toLocaleTimeString("de-DE");
}