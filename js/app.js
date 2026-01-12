import { renderWorkstartChart } from "./graph.js";

let currentPerson = null;
let currentHours = 24;

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
loadPersons();

document.querySelectorAll("button[data-hours]").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("button[data-hours]")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentHours = Number(btn.dataset.hours);
    if (currentPerson) loadGraph();
  };
});

// ------------------------------------------------------------
// PERSONEN
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
        loadGraph();
      };

      if (i === 0) {
        btn.classList.add("active");
        currentPerson = p;
      }

      wrap.appendChild(btn);
    });

    if (currentPerson) loadGraph();

  } catch (err) {
    wrap.innerHTML = `<div class="error">Personen konnten nicht geladen werden</div>`;
    console.error(err);
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