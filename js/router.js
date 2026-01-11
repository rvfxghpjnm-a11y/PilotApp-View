window.AppRouter = {
  async load(view) {
    AppState.view = view;
    saveState();

    const res = await fetch(`views/${view}.html`);
    document.getElementById("content").innerHTML = await res.text();

    document.getElementById("refreshTime").textContent =
      new Date().toLocaleTimeString();
  }
};

(async () => {
  const persons = ["konietzka_stefan", "crotogino_philipp"];
  const pb = document.getElementById("personButtons");

  persons.forEach(p => {
    const b = document.createElement("button");
    b.textContent = p.replace("_", " ");
    b.onclick = () => {
      AppState.person = p;
      saveState();
      AppRouter.load(AppState.view);
    };
    pb.appendChild(b);
  });

  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.onclick = () => AppRouter.load(btn.dataset.view);
  });

  document.getElementById("refreshBtn").onclick =
    () => AppRouter.load(AppState.view);

  AppRouter.load(AppState.view);
})();