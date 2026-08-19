const { contextBridge, ipcRenderer } = require("electron");
console.log("preload.js loaded");

// Expose a minimal, safe API surface to the renderer if needed.
contextBridge.exposeInMainWorld("appBridge", {
  getInfo: () => ({ name: "Digital Twin", version: "1.0.0" }),

  // SENFING GESTURES TO MAIN.JS
  //  gesturet
  sendGesture: (gesture) => {
    console.log("sendGesture called with gesture:", gesture);
    ipcRenderer.send("gestures-channel", gesture);
  },
  // Return the runtime resources path (useful in packaged apps)
  getResourcesPath: () => {
    try {
      return process.resourcesPath || "";
    } catch {
      return "";
    }
  },
});

//Exposing method to store data via electron-store.
contextBridge.exposeInMainWorld("store", {
  set: (key, value) => ipcRenderer.invoke("store-set", key, value),
  get: (key) => ipcRenderer.invoke("store-get", key),
  delete: (key) => ipcRenderer.invoke("store-delete", key),
});
