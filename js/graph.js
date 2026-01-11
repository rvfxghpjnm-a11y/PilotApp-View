(() => {
  const canvas = document.getElementById("workstartChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let chart;
  let hoursWindow = 24;

  async function loadData() {
    const state = JSON.parse(localStorage.getItem("pilotapp_state") || "{}");
    if (!state.person) return;

    const file = `data/workstart_history_${state.person}.json`;

    const res = await fetch(file, { cache: "no-store" });
    if (!res.ok) return;

    const json = await res.json();
    render(json.entries || []);
  }

  function render(entries) {
    const now = Date.now();
    const limit = hoursWindow * 60 * 60 * 1000;

    const points = entries
      .map(e => ({
        x: new Date(e.ts_calc).getTime(),
        y: e.pos
      }))
      .filter(p => now - p.x <= limit)
      .sort((a, b) => a.x - b.x);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [{
          label: "Position",
          data: points,
          borderColor: "#1e88e5",
          backgroundColor: "rgba(30,136,229,0.15)",
          tension: 0.3,
          fill: true,
          pointRadius: 2
        }]
      },
      options: {
        responsive: true,
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

  document.querySelectorAll(".time-buttons button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".time-buttons button")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      hoursWindow = Number(btn.dataset.hours);
      loadData();
    });
  });

  loadData();
})();