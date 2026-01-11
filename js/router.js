// js/router.js
import { state, setPerson, setView, restoreState } from "./state.js";

const content = document.getElementById("content");
const personButtons = document.getElementById("personButtons");
const viewButtons = document.querySelectorAll("[data-view]");
const refreshBtn = document.getElementById("refreshBtn");
const refreshTime = document.getElementById("refreshTime");

restoreState();

async function loadPersons() {
  // HIER feste Liste – später dynamisch
  state.persons = [
    "konietzka_stefan",
    "crotogino_philipp"
  ];

  if (!state.currentPerson) {
    setPerson(state.persons[0]);
  }

  renderPersonButtons();
}

function renderPersonButtons() {
  personButtons.innerHTML = "";

  state.persons.forEach(p => {
    const btn = document.createElement("button");
    btn.textContent = p.replace("_", " ");
    btn.className = p === state.currentPerson ? "active" : "";
    btn.onclick = () => {
      setPerson(p);
      renderPersonButtons();
      loadView(state.currentView);
    };
    personButtons.appendChild(btn);
  });
}

async function loadView(view) {
  if (!state.currentPerson) return;

  setView(view);

  const res = await fetch(`views/${view}.html`);
  content.innerHTML = await res.text();

  highlightViewButtons();
}

function highlightViewButtons() {
  viewButtons.forEach(b => {
    b.classList.toggle(
      "active",
      b.dataset.view === state.currentView
    );
  });
}

viewButtons.forEach(btn => {
  btn.onclick = () => loadView(btn.dataset.view);
});

refreshBtn.onclick = () => {
  loadView(state.currentView);
  refreshTime.textContent = new Date().toLocaleTimeString();
};

await loadPersons();
await loadView(state.currentView);