import { renderWorkstartChart } from "./graph.js";

console.log("APP.JS LOADED");

// ------------------------------------------------------------
// STATE
// ------------------------------------------------------------
let currentPerson = null;
let currentHours = 24;
let currentView = "short";

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
init();

function init() {
  bindViewButtons();
  bindHourButtons();
  loadPersons();
}

// ------------------------------------------------------------
// VIEW BUTTONS (Short / Long / Graph)
// ------------------------------------------------------------
function bindViewButtons() {
  document.querySelectorAll("button[data-view]").forEach(btn => {
    btn.onclick = () => {
      document
        .querySelectorAll("button[data-view]")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      currentView = btn.dataset.view;

      renderView();
    };
  });
}

// ------------------------------------------------------------
// HOUR BUTTONS (Graph)
// ------------------------------------------------------------
function bindHourButtons() {
  document.querySelectorAll("button[data-hours]").forEach(btn => {
    btn.onclick = () => {
      document
        .querySelectorAll("button[data-hours]")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      currentHours = Number(btn.dataset.hours);

      if (currentView === "graph" && currentPerson) {
        loadGraph();
      }
    };
  });
}

// ------------------------------------------------------------
// PERSONEN LADEN
// ------------------------------------------------------------
async function loadPersons() {
  try {
    const res = await fetch("data/workstart_index.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Index nicht ladbar");

    const index = await res.json();
    const wrap = document.getElementById("persons");
    wrap.innerHTML = "";

    index.persons.forEach((p, i) => {
      const btn = document.createElement("button");
      btn.textContent = `${p.vorname} ${p.nachname}`;

      btn.onclick = () => {
        document
          .querySelectorAll("#persons button")
          .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");
        currentPerson = p;
        renderView();
      };

      if (i === 0) {
        btn.classList.add("active");
        currentPerson = p;
      }

      wrap.appendChild(btn);
    });

    renderView();

  } catch (err) {
    console.error(err);
    document.getElementById("persons").innerHTML =
      `<div class="error">Personen konnten nicht geladen werden</div>`;
  }
}

// ------------------------------------------------------------
// VIEW RENDERING
// ------------------------------------------------------------
function renderView() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  if (!currentPerson) return;

  if (currentView === "short") {
    content.innerHTML = `<div class="placeholder">Short View (kommt gleich)</div>`;
  }

  if (currentView === "long") {
    content.innerHTML = `<div class="placeholder">Long View (kommt gleich)</div>`;
  }

  if (currentView === "graph") {
    const canvas = document.createElement("canvas");
    canvas.id = "chart";
    content.appendChild(canvas);
    loadGraph();
  }
}

// ------------------------------------------------------------
// GRAPH LADEN
// ------------------------------------------------------------
async function loadGraph() {
  try {
    const file = `data/${currentPerson.file}`;
    const res = await fetch(file, { cache: "no-store" });
    if (!res.ok) throw new Error("Workstart-Datei nicht ladbar");

    const data = await res.json();
    renderWorkstartChart(data.entries || [], currentHours);

    document.getElementById("status").textContent =
      new Date().toLocaleTimeString("de-DE");

  } catch (err) {
    console.error(err);
  }
}