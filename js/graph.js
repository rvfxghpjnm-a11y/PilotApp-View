// js/graph.js
// =====================================================
// WORKSTART GRAPH (STABIL)
// =====================================================

import { getState } from "./state.js";

let chart = null;

async function loadData(hours) {
  const { person } = getState();
  const url = `data/workstart_history_${person}.json`;

  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();

  const now = Date.now();
  const limit = now - hours * 3600 * 1000;

  return json.entries
    .filter(e => new Date(e.ts).getTime() >= limit)
    .map(e => ({
      x: new Date(e.ts),
      y: e.pos,
    }));
}

async function draw(hours) {
  const data = await loadData(hours);
  const ctx = document.getElementById("workstartChart");

  if (!ctx) return;

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [{
        label: "Position",
        data,
        borderWidth: 2,
        tension: 0.2
      }]
    },
    options: {
      parsing: false,
      scales: {
        x: {
          type: "time",
          time: { unit: "hour" }
        },
        y: {
          reverse: true,
          title: { display: true, text: "Position" }
        }
      }
    }
  });
}

// Buttons
document.querySelectorAll(".time-buttons button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".time-buttons button")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    draw(Number(btn.dataset.hours));
  });
});

// Initial
draw(24);