const AppState = {
  person: null,
  view: "short",

  load() {
    const saved = localStorage.getItem("pilotapp_state");
    if (saved) {
      Object.assign(this, JSON.parse(saved));
    }
  },

  save() {
    localStorage.setItem(
      "pilotapp_state",
      JSON.stringify({
        person: this.person,
        view: this.view
      })
    );
  },

  setPerson(p) {
    this.person = p;
    this.save();
    updatePersonButtons();
    Router.loadView(this.view);
  },

  setView(v) {
    this.view = v;
    this.save();
    updateViewButtons();
    Router.loadView(v);
  }
};

window.addEventListener("load", () => {
  AppState.load();
});