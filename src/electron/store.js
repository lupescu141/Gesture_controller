import Store from "electron-store";

const schema = {
  mouseSensitivity: {
    type: "number",
    maximum: 2,
    minimum: 0.1,
    default: 1,
  },
  handSize: {
    type: "number",
    maximum: 2,
    minimum: 0.1,
    default: 1,
  },
};

const store = new Store({ schema });

console.log(store.get("mouseSensitivity"));
//=> 50

export { store };
