import { renderWorkstartChart } from "./graph.js";

let currentPerson = null;
let currentView = "short";
let currentHours = 24;

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
loadPersons();
bindViewButtons();
bindTimeButtons();

// ------------------------------------------------------------
// VIEW BUTTONS
// ------------------------------------------------------------
function bindViewButtons() {
  document.querySelectorAll("button[data-view]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("button[data-view]")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentView = btn.dataset.view;
      loadView();
    };
  });
}

// ------------------------------------------------------------
// TIME BUTTONS (GRAPH)
// ------------------------------------------------------------
function bindTimeButtons() {
  document.querySelectorAll("button[data-hours]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("button[data-hours]")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentHours = Number(btn.dataset.hours);
      if (currentView === "graph") loadView();
    };
  });
}

// ------------------------------------------------------------
// PERSONEN
// ------------------------------------------------------------
async function loadPersons() {
  const res = await fetch("data/workstart_index.json", { cache: "no-store" });
  const index = await res.json();

  const wrap = document.getElementById("persons");
  wrap.innerHTML = "";

  index.persons.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.textContent = `${p.vorname} ${p.nachname}`;
    btn.onclick = () => {
      document.querySelectorAll("#persons button")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentPerson = p;
      loadView();
    };

    if (i === 0) {
      btn.classList.add("active");
      currentPerson = p;
    }

    wrap.appendChild(btn);
  });

  loadView();
}

// ------------------------------------------------------------
// VIEW LOADER
// ------------------------------------------------------------
async function loadView() {
  if (!currentPerson) return;

  window.PILOTAPP_PERSON = currentPerson;

  const content = document.getElementById("content");
  content.innerHTML = "";

  if (currentView === "graph") {
    const res = await fetch(`data/${currentPerson.file}`, { cache: "no-store" });
    const data = await res.json();
    content.innerHTML = `<canvas id="chart"></canvas>`;
    renderWorkstartChart(data.entries || [], currentHours);
    return;
  }

  const res = await fetch(`views/${currentView}.html`, { cache: "no-store" });
  content.innerHTML = await res.text();
}