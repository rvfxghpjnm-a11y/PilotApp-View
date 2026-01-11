// js/router.js
// =====================================================
// VIEW-ROUTER (STABIL)
// =====================================================

import { getState, setView } from "./state.js";

const content = document.getElementById("content");
const viewButtons = document.querySelectorAll("[data-view]");

async function loadView(view) {
  setView(view);

  viewButtons.forEach(b =>
    b.classList.toggle("active", b.dataset.view === view)
  );

  content.innerHTML = `<div class="placeholder">Ansicht wird geladen …</div>`;

  try {
    const res = await fetch(`views/${view}.html`, { cache: "no-store" });
    const html = await res.text();
    content.innerHTML = html;
  } catch (e) {
    content.innerHTML = `<div class="error">Fehler beim Laden der Ansicht</div>`;
    console.error(e);
  }
}

// Button-Handler
viewButtons.forEach(btn => {
  btn.addEventListener("click", () => loadView(btn.dataset.view));
});

// Initial
document.addEventListener("DOMContentLoaded", () => {
  const { view } = getState();
  loadView(view);
});