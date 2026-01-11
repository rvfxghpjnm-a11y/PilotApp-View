// js/graph.js
import { state } from "./state.js";

const canvas = document.getElementById("workstartChart");
if (!canvas) {
  console.warn("Canvas nicht gefunden");
}

if (!state.currentPerson) {
  console.warn("Keine Person gesetzt – Graph abgebrochen");
  return;
}

const ctx = canvas.getContext("2d");

async function loadData(hours = 24) {
  const file = `data/workstart_history_${state.currentPerson}.json`;

  const res = await fetch(file);
  if (!res.ok) {
    console.warn("Workstart JSON nicht gefunden:", file);
    return [];
  }

  const json = await res.json();
  const now = Date.now();
  const cutoff = now - hours * 3600 * 1000;

  return json.entries.filter(e =>
    new Date(e.ts).getTime() >= cutoff
  );
}

let chart;

async function render(hours = 24) {
  const data = await loadData(hours);

  const labels = data.map(e =>
    new Date(e.ts).toLocaleTimeString()
  );
  const values = data.map(e => e.pos);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: state.currentPerson.replace("_", " "),
        data: values,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { reverse: true }
      }
    }
  });
}

render();

document.querySelectorAll(".time-buttons button").forEach(btn => {
  btn.onclick = () => {
    document
      .querySelectorAll(".time-buttons button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    render(Number(btn.dataset.hours));
  };
});