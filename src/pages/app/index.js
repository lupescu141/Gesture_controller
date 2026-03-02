import "../overlay.css";
import { draw } from "./canvas/canvas2D";
import { DrawingUtils } from "@mediapipe/tasks-vision";
import { requestStream, enumerateVideoInputs } from "./media/camera";
import { initGestureRecognizer } from "./media/mediapipe";
import { animationManager } from "./media/animationManager";
/* import { OneEuroFilter } from "./clasess/JitterFilter"; */

// Entry bootstrapping of the renderer app.
async function main() {
  //________________________________________________________________
  /* -- DOM ELEMENTS -- */
  const status = document.getElementById("status");
  const canvas = document.getElementById("canvas");
  const video = document.getElementById("video");

  const deviceContainer = document.getElementById("camera-select");
  const deviceSelect = document.getElementById("devices");
  let gestureRecognizer = (await initGestureRecognizer()).gestureRecognizer;

  if (!canvas || !video) {
    console.error("Canvas or video element not found in DOM");
    if (status) status.textContent = "Error: canvas/video element not found.";
    return;
  }
  //________________________________________________________________
  /* GET MONITOR SIZE */
  const monitor = {
    width: window.screen.width,
    height: window.screen.height,
  };

  //________________________________________________________________
  /* -- FOR GESTURE CONTROL INFO BOX -- */
  const infoBox = document.getElementById("mark");
  const rect = infoBox.getBoundingClientRect();
  const rectX = rect.x;
  const rectY = rect.y;
  const rectBottom = rect.bottom;
  const rectRight = rect.right;

  //________________________________________________________________
  /* -- 2D CANVAS -- */
  const canvasCtx = canvas.getContext("2d");
  const drawingUtils = new DrawingUtils(canvasCtx);
  canvas.style.transform = "rotateY(180deg)"; // mirror 2D canvas

  //________________________________________________________________
  /* -- ENUMERATE VIDEO INPUT DEVICES -- */
  //    Then executes a prompt for video detection --> requestStream
  const inputs = await enumerateVideoInputs().then(async (_inputs) => {
    if (_inputs.length === 0) {
      // if no devices found Will return empty array withot executing
      return [];
    }
    try {
      await requestStream(video, _inputs[0].deviceId, detect); // triggers permission prompt and starts detection
    } catch (e) {
      console.error(e);
    }
    return _inputs; // returns _inputs for const inputs
  });

  //________________________________________________________________
  /* -- CAMERA DROPDOWN -- */
  //    if camera devices have been found camera selection dropdown menu will be enamble
  if (inputs.length > 1) {
    deviceContainer.style.display = "block";
    deviceSelect.innerHTML = "";
    inputs.forEach((d, i) => {
      const opt = document.createElement("option");
      opt.value = d.deviceId;
      opt.text = d.label || `Camera ${i + 1}`;
      deviceSelect.appendChild(opt);
    });
    deviceSelect.addEventListener("change", async () => {
      try {
        console.log(
          `Switching to: ${
            deviceSelect.options[deviceSelect.selectedIndex].text
          }`,
        );
        await requestStream(video, deviceSelect.value, detect);
      } catch (e) {
        console.error(e.message + "Failed to switch camera");
      }
    });
  }

  //________________________________________________________________
  /* -- JITTER FILTER -- */

  /* WORK IN PROGRESS */
  /*   let frequency = 60; // Hz
  let mincutoff = 0.2; // Hz
  let beta = 0.007;
  let dcutoff = 1.0;

  function FilterLM(filtered, landmark, ts) {
    for (const i in results.landmarks[0]) {
      const filter_x = new OneEuroFilter(frequency, mincutoff, beta, dcutoff);
      const filter_y = new OneEuroFilter(frequency, mincutoff, beta, dcutoff);
      const x = filter_x.filter(landmark.x, ts);
      const y = filter_y.filter(landmark.y, ts);
      const filteredResult = { x, y };
      filtered.landmarks[0].push(filteredResult);
    }
  } */

  //________________________________________________________________
  /* -- DETECT FROM VIDEO -- */
  let lastVideoTime = -1;
  function detect() {
    try {
      if (video.currentTime !== lastVideoTime) {
        const ts = performance.now();
        const results = gestureRecognizer.recognizeForVideo(video, ts);

        //________________________________________________________________
        // -- FILTER NOISE --
        /*     const landmark = [];
        const filtered = { landmarks: [landmark] };
        if (results.landmarks && results.landmarks.length > 0) {
          FilterLM(filtered, landmark, ts);
        } */

        //________________________________________________________________
        /* -- IPC CONNECTION -- */
        if (results.gestures && results.gestures.length > 0) {
          // send gestures to main process via IPC
          window.appBridge.sendGesture(results);
        }

        //________________________________________________________________
        // -- FOR SHOWING THE GESTURE CONTROLS INFO BOX --
        if (results.landmarks && results.landmarks.length > 0) {
          // indexfingingertip coords
          const indexFingerTip = results.landmarks[0][8];
          const indexX = monitor.width - indexFingerTip.x * monitor.width;
          const indexY = indexFingerTip.y * monitor.height;

          // infobox doms
          const controlInstructions = document.getElementById("ohjeet");

          // function to check if indexfinger is inside the box
          if (
            indexX >= rectX &&
            indexX <= rectRight &&
            indexY >= rectY &&
            indexY <= rectBottom
          ) {
            controlInstructions.style.display = "block";
          } else {
            controlInstructions.style.display = "none";
          }
        }

        //________________________________________________________________
        // -- DRAW RESULT ON CANVAS --
        draw(results, canvas, canvasCtx, drawingUtils);
        //________________________________________________________________
        // -- lastVideoTime NEW VALUE --
        lastVideoTime = video.currentTime;
      }
    } catch (e) {
      console.error(e.message + "Detection error");
    } finally {
      // requestAnimationFrame(detect);
      animationManager.registerTask(detect);
    }
  }
}

main();
