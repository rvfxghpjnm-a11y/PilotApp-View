function initGraph() {
  const el = document.getElementById("graph");
  if (!el) return;

  el.innerHTML = "<p>📈 Graph wird geladen …</p>";

  // Test-Visualisierung (ersetzt später durch echte Daten)
  setTimeout(() => {
    el.innerHTML = "<canvas id='graphCanvas'></canvas>";
    const ctx = document.getElementById("graphCanvas").getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["3h", "6h", "12h", "24h"],
        datasets: [{
          label: "Position",
          data: [12, 18, 25, 40],
          borderWidth: 2
        }]
      }
    });
  }, 300);
}