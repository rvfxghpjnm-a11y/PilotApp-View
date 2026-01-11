// js/state.js
// ============================================================
// PILOTAPP STATE – FINAL
// ============================================================

export const state = {
  persons: [],          // [{ key, vorname, nachname, file }]
  currentPerson: null,  // key, z.B. "crotogino_philipp"
  currentView: "short", // short | long | graph
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
// STATE RESTORE (localStorage)
// ------------------------------------------------------------

export function restoreState() {
  const p = localStorage.getItem("pilotapp_person");
  const v = localStorage.getItem("pilotapp_view");

  if (p) state.currentPerson = p;
  if (v) state.currentView = v;
}

// ------------------------------------------------------------
// LOAD PERSON INDEX (Quelle der Wahrheit)
// ------------------------------------------------------------

export async function loadPersons() {
  try {
    const res = await fetch("data/workstart_index.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Index nicht ladbar");

    const data = await res.json();
    if (!Array.isArray(data.persons)) throw new Error("Index ungültig");

    state.persons = data.persons;

    // Fallback: erste Person automatisch wählen
    if (!state.currentPerson && state.persons.length > 0) {
      state.currentPerson = state.persons[0].key;
    }

  } catch (err) {
    console.error("[STATE] Fehler beim Laden der Personen:", err);
    state.persons = [];
  }
}

// ------------------------------------------------------------
// INIT (einziger Einstiegspunkt)
// ------------------------------------------------------------

export async function initState() {
  restoreState();
  await loadPersons();

  state.lastRefresh = new Date().toISOString();
}