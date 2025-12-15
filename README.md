# cameraFaceFollow
Crop the camera frame so that the framing range follows the movement of the face, ensuring that the face remains centered in the output image. The step-by-step algorithm makes the background movement smoother, reducing issues such as jitter and shaking.

Simple web project that opens the camera, detects faces (BlazeFace via TensorFlow.js), and renders three views:

- Origin: original camera video.
- Output: output canvas that crops the camera frame and smoothly follows the face.
- Overlay: face bbox + viewport rectangle.

Run a local server (http://localhost) to use getUserMedia.

Open the `index.html` in a local server (e.g. `npx http-server` or use VS Code Live Server).

## Local Usage
1. Run the following cmds in terminal (under the project folder):
-- npm install
-- npm start

2. Then open website http://localhost:3000
(The port is defined in package.json)
