// js/state.js
// ============================================================
// PILOTAPP STATE – FINAL
// ============================================================

export const state = {
  persons: [],
  currentPerson: null,
  currentView: "short",
  lastRefresh: null
};

// ------------------------------------------------------------
// STATE SETTER
// ------------------------------------------------------------

export function setPerson(personKey) {
  state.currentPerson = personKey;
  localStorage.setItem("pilotapp_person", personKey);
}

export function setView(view) {
  state.currentView = view;
  localStorage.setItem("pilotapp_view", view);
}

// ------------------------------------------------------------
// INIT STATE (LÄDT PERSONEN!!)
// ------------------------------------------------------------

export async function initState() {
  // 1️⃣ Personenindex laden
  const res = await fetch("data/workstart_index.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("workstart_index.json nicht ladbar");
  }

  const index = await res.json();
  state.persons = index.persons || [];

  // 2️⃣ View aus Storage
  const savedView = localStorage.getItem("pilotapp_view");
  if (savedView) {
    state.currentView = savedView;
  }

  // 3️⃣ Person aus Storage oder erste verfügbare
  const savedPerson = localStorage.getItem("pilotapp_person");
  if (savedPerson && state.persons.some(p => p.key === savedPerson)) {
    state.currentPerson = savedPerson;
  } else if (state.persons.length > 0) {
    state.currentPerson = state.persons[0].key;
  }

  // 4️⃣ Refresh-Zeit
  state.lastRefresh = new Date();
}