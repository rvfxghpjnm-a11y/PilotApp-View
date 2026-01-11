// js/router.js
// ============================================================
// PILOTAPP ROUTER – FINAL
// ============================================================

import { state, setPerson, setView, initState } from "./state.js";

// ------------------------------------------------------------
// DOM
// ------------------------------------------------------------

const contentEl = document.getElementById("content");
const personButtonsEl = document.getElementById("personButtons");
const viewButtons = document.querySelectorAll(".view-buttons button");
const refreshBtn = document.getElementById("refreshBtn");
const refreshTimeEl = document.getElementById("refreshTime");

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  await initState();
  renderPersons();
  renderViews();
  loadCurrentView();
  updateRefreshTime();
});

// ------------------------------------------------------------
// PERSON BUTTONS
// ------------------------------------------------------------

function renderPersons() {
  personButtonsEl.innerHTML = "";

  state.persons.forEach(p => {
    const btn = document.createElement("button");
    btn.textContent = `${p.vorname} ${p.nachname}`;
    btn.dataset.person = p.key;

    if (p.key === state.currentPerson) {
      btn.classList.add("active");
    }

    btn.onclick = () => {
      setPerson(p.key);
      renderPersons();
      loadCurrentView();
    };

    personButtonsEl.appendChild(btn);
  });
}

// ------------------------------------------------------------
// VIEW BUTTONS
// ------------------------------------------------------------

function renderViews() {
  viewButtons.forEach(btn => {
    const view = btn.dataset.view;

    if (view === state.currentView) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }

    btn.onclick = () => {
      setView(view);
      renderViews();
      loadCurrentView();
    };
  });
}

// ------------------------------------------------------------
// VIEW LOADER
// ------------------------------------------------------------

async function loadCurrentView() {
  if (!state.currentPerson) {
    contentEl.innerHTML = "<p>Keine Person ausgewählt</p>";
    return;
  }

  const view = state.currentView;
  const url = `views/${view}.html`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("View nicht ladbar");

    const html = await res.text();
    contentEl.innerHTML = html;

    // Graph braucht Person-Key global
    if (view === "graph") {
      window.PILOTAPP_PERSON = state.currentPerson;
    }

  } catch (err) {
    contentEl.innerHTML = `<p>Fehler beim Laden von ${view}</p>`;
    console.error(err);
  }
}

// ------------------------------------------------------------
// REFRESH
// ------------------------------------------------------------

refreshBtn.onclick = async () => {
  await initState();
  renderPersons();
  renderViews();
  loadCurrentView();
  updateRefreshTime();
};

function updateRefreshTime() {
  const now = new Date();
  refreshTimeEl.textContent = now.toLocaleTimeString("de-DE");
}