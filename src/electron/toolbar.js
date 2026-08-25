// Gets the modal
const settings = document.getElementById("settings");

// Gets the button that opens the settings
const settings_open = document.getElementById("settings_button");

// Gets the <span> element that closes the modal
const close_settings = document.getElementById("close_settings");

// Gets the <range> element that controls on display hand size
const hand_slider = document.getElementById("hand_slider");
// Displays hand slider value
var hand_slider_value = hand_slider.value;
const hand_slider_value_display = document.getElementById("hand_slider_value");
hand_slider_value_display.innerText = hand_slider_value;

// Gets the <range> element that controls mouse sensitivity
const mouse_slider = document.getElementById("mouse_slider");

const save_button = document.getElementById("settings_save_button");

try {
  window.store.get("mouseSensitivity").then((value) => {
    console.log("Mouse sensitivity:", value);
  });
} catch (err) {
  console.log(err);
}

// Displays hand slider value
var mouse_slider_value = mouse_slider.value;
const mouse_slider_value_display =
  document.getElementById("mouse_slider_value");
mouse_slider_value_display.innerText = hand_slider_value;

// When the user clicks on the button, open the modal
settings_open.onclick = function () {
  if (window.getComputedStyle(settings).display == "none") {
    console.log("true");
    settings.style.display = "block";
  } else if (window.getComputedStyle(settings).display == "block") {
    console.log("false");
    settings.style.display = "none";
  }

  //Restores user saved settings
  try {
    window.store.get("mouseSensitivity").then((value) => {
      mouse_slider.value = value;
      mouse_slider_value_display.innerText = value;
    });
    window.store.get("handSize").then((value) => {
      hand_slider.value = value;
      hand_slider_value_display.innerText = value;
    });
  } catch (err) {
    console.log(err);
  }
};

// When the user clicks on <span> (x), close the modal
close_settings.onclick = function () {
  settings.style.display = "none";
};

//Saves new user settings
save_button.onclick = () => {
  try {
    window.store.set("mouseSensitivity", parseFloat(mouse_slider.value));
    window.store.set("handSize", parseFloat(hand_slider.value));
  } catch (err) {
    console.log(err);
  }
};

// Make the DIV element draggable:
dragElement(document.getElementById("settings"));

function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(event) {
    event.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = event.clientX;
    pos4 = event.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(event) {
    event.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - event.clientX;
    pos2 = pos4 - event.clientY;
    pos3 = event.clientX;
    pos4 = event.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
//Check if camera activated
let camera_activated = false;
// Get the button that activates camera mode
const camera_button = document.getElementById("camera_button");

//Check if camera activated
let kinect_activated = false;
// Get the button that activates camera mode
const kinect_button = document.getElementById("kinect_button");

kinect_button.addEventListener("click", () => {
  if (kinect_activated == false) {
    kinect_button.className = "button_activated";
    camera_activated = false;
    camera_button.className = "button";
    kinect_activated = true;
  }
});

camera_button.addEventListener("click", () => {
  if (camera_activated == false) {
    camera_activated = true;
    camera_button.className = "button_activated";
    kinect_activated = false;
    kinect_button.className = "button";
  }
});

hand_slider.oninput = () => {
  hand_slider_value = hand_slider.value;
  hand_slider_value_display.innerText = hand_slider_value;
};

mouse_slider.oninput = () => {
  mouse_slider_value = mouse_slider.value;
  mouse_slider_value_display.innerText = mouse_slider_value;
};
