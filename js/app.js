import { renderWorkstartChart } from "./graph.js";

console.log("APP.JS LOADED");

// ------------------------------------------------------------
// STATE
// ------------------------------------------------------------
let currentPerson = null;
let currentHours = 24;
let currentView = "short";
let lastEntries = [];

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
// VIEW BUTTONS (Short | Long | Graph)
// ------------------------------------------------------------
function bindViewButtons() {
  document.querySelectorAll("button[data-view]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("button[data-view]")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentView = btn.dataset.view;
      renderCurrentView();
    };
  });
}

// ------------------------------------------------------------
// HOUR BUTTONS (nur Graph relevant)
// ------------------------------------------------------------
function bindHourButtons() {
  document.querySelectorAll("button[data-hours]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("button[data-hours]")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentHours = Number(btn.dataset.hours);
      if (currentView === "graph") renderCurrentView();
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
        document.querySelectorAll("#persons button")
          .forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentPerson = p;
        loadPersonData();
      };

      if (i === 0) {
        btn.classList.add("active");
        currentPerson = p;
      }

      wrap.appendChild(btn);
    });

    if (currentPerson) loadPersonData();

  } catch (err) {
    console.error(err);
    document.getElementById("persons").innerHTML =
      `<div class="error">Personen konnten nicht geladen werden</div>`;
  }
}

// ------------------------------------------------------------
// PERSONENDATEN LADEN
// ------------------------------------------------------------
async function loadPersonData() {
  try {
    const res = await fetch(`data/${currentPerson.file}`, { cache: "no-store" });
    if (!res.ok) throw new Error("History nicht ladbar");

    const data = await res.json();
    lastEntries = data.entries || [];

    document.getElementById("status").textContent =
      new Date().toLocaleTimeString("de-DE");

    renderCurrentView();

  } catch (err) {
    console.error(err);
  }
}

// ------------------------------------------------------------
// VIEW RENDER
// ------------------------------------------------------------
function renderCurrentView() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  if (!lastEntries.length) {
    content.innerHTML = "<div class='error'>Keine Daten</div>";
    return;
  }

  if (currentView === "short") {
    renderShortView(content);
  }

  if (currentView === "graph") {
    const canvas = document.createElement("canvas");
    canvas.id = "chart";
    content.appendChild(canvas);
    renderWorkstartChart(lastEntries, currentHours);
  }

  if (currentView === "long") {
    content.innerHTML =
      "<div class='error'>Long View kommt im nächsten Schritt</div>";
  }
}

// ------------------------------------------------------------
// SHORT VIEW
// ------------------------------------------------------------
function renderShortView(container) {
  const latest = lastEntries[lastEntries.length - 1];

  const box = document.createElement("div");
  box.className = "short-view";

  box.innerHTML = `
    <div><b>Position:</b> ${latest.pos ?? "-"}</div>
    <div><b>Meldung:</b> ${fmt(latest.from_meldung)}</div>
    <div><b>Meldung alt:</b> ${fmt(latest.from_meldung_alt)}</div>
    <div><b>Calc /2:</b> ${fmt(latest.calc_div2)}</div>
    <div><b>Calc /3:</b> ${fmt(latest.calc_div3)}</div>
  `;

  container.appendChild(box);
}

// ------------------------------------------------------------
// HELFER
// ------------------------------------------------------------
function fmt(v) {
  if (!v) return "–";
  return v.replace(" ", " ");
}