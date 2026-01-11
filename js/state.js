// js/state.js
// =====================================================
// ZENTRALER APP-STATE (STABIL)
// =====================================================

const AppState = {
  person: localStorage.getItem("person") || "konietzka_stefan",
  view: localStorage.getItem("view") || "short",
};

export function setPerson(p) {
  AppState.person = p;
  localStorage.setItem("person", p);
}

export function setView(v) {
  AppState.view = v;
  localStorage.setItem("view", v);
}

export function getState() {
  return { ...AppState };
}