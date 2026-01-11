// js/state.js
export const state = {
  persons: [],
  currentPerson: null,
  currentView: "short",
  lastRefresh: null
};

export function setPerson(person) {
  state.currentPerson = person;
  localStorage.setItem("pilotapp_person", person);
}

export function setView(view) {
  state.currentView = view;
  localStorage.setItem("pilotapp_view", view);
}

export function restoreState() {
  const p = localStorage.getItem("pilotapp_person");
  const v = localStorage.getItem("pilotapp_view");

  if (p) state.currentPerson = p;
  if (v) state.currentView = v;
}