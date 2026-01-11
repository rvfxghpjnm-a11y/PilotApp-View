window.AppState = {
  person: localStorage.getItem("person") || "konietzka_stefan",
  view: localStorage.getItem("view") || "short",
  graphHours: Number(localStorage.getItem("graphHours") || 24)
};

window.saveState = () => {
  localStorage.setItem("person", AppState.person);
  localStorage.setItem("view", AppState.view);
  localStorage.setItem("graphHours", AppState.graphHours);
};