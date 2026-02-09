const { BrowserWindow } = require("electron");

const window_show = (win) => {
  if (!(win instanceof BrowserWindow)) {
    throw new TypeError("Parameter must be a BrowserWindow instance.");
  } else {
    console.log("window show triggered");
    win.show();
  }
};

export { window_show };
