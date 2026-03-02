// Camera permissions and device management utilities.
// Exposes: requestStream(deviceId?), enumerateVideoInputs(), stopStream(stream|videoEl)
//import { animationManager } from "./animationManager";

//________________________________________________________________
/* ENUMERATE DEVICCES */
export async function enumerateVideoInputs() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === "videoinput");
}

//________________________________________________________________
/* START VIDEO STREAM */
export async function requestStream(videoEl, deviceId, callback) {
  // deviceId optional: if provided, request exactly that device; else prompt default
  //____________________________________
  // DEVICE SETTINGS
  const constraints = {
    video: {
      deviceId: { exact: deviceId },
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 60 },
      facingMode: "user",
      resizeMode: "crop-and-scale",
    },
    audio: false,
  };
  //____________________________________
  // START DEVICE
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoEl) {
      stopStream(videoEl); // ensure previous is closed
      videoEl.srcObject = stream;
      /* await videoEl.play(); */ //<-- not needed
      videoEl.addEventListener("loadeddata", (event) => {
        // checks if video element is ready
        if (event.target.readyState === 4) {
          callback(); // <-- callback function for detection
        }
      });
    }
  } catch (error) {
    // Map common errors to user-friendly messages
    if (
      error &&
      (error.name === "NotAllowedError" || error.name === "SecurityError")
    ) {
      throw new Error("Camera access denied by user or system.");
    } else if (error && error.name === "NotFoundError") {
      throw new Error("No camera device found.");
    } else {
      throw new Error("Failed to access webcam. Check device and permissions.");
    }
  }
}

//________________________________________________________________
/* STOP VIDEO STREAM */
export function stopStream(target) {
  const stream = target && target.srcObject ? target.srcObject : target;
  if (stream && stream.getTracks) {
    stream.getTracks().forEach((t) => t.stop());
  }
  if (target && target.srcObject) target.srcObject = null;
}
