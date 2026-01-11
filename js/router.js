const Router = {
  async loadView(view) {
    const main = document.getElementById("content");
    const res = await fetch(`views/${view}.html`);
    main.innerHTML = await res.text();

    if (view === "graph" && typeof initGraph === "function") {
      initGraph();
    }

    updateViewButtons();
  }
};

function updateViewButtons() {
  document.querySelectorAll(".view-buttons button").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.view === AppState.view
    );
  });
}

function updatePersonButtons() {
  document.querySelectorAll("#personButtons button").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.person === AppState.person
    );
  });
}

document.addEventListener("click", e => {
  const viewBtn = e.target.closest("[data-view]");
  if (viewBtn) {
    AppState.setView(viewBtn.dataset.view);
  }

  const personBtn = e.target.closest("[data-person]");
  if (personBtn) {
    AppState.setPerson(personBtn.dataset.person);
  }
});