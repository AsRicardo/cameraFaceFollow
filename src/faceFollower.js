//import * as tf from 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js';
//import * as blazeface from 'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@latest/dist/blazeface.min.js';
//import * as tf from '@tensorflow/tfjs';

export class FaceFollower {
  constructor(els) {
    this.video = els.video;
    this.overlay = els.overlay;
    this.outCanvas = els.outCanvas;
    this.startBtn = els.startBtn;
    this.stopBtn = els.stopBtn;
    this.zoomInput = els.zoom;
    this.smoothInput = els.smooth;

    this.octx = this.overlay.getContext('2d');
    this.outCtx = this.outCanvas.getContext('2d');

    this.stream = null;
    this.model = null;
    this.running = false;

    this.viewport = { x:0, y:0, w: 480, h: 360 };
    this.current = { x:0, y:0 };
    this.lastFaceCenter = { x: 0, y: 0 };

    //tf.setBackend('webgl').catch(()=>tf.setBackend('cpu'));
  }

  async start() {
    if (this.running) return;
    this.stream = await navigator.mediaDevices.getUserMedia({ video: { width:1280, height:720, facingMode:'user' }, audio:false });
    this.video.srcObject = this.stream;
    await this.video.play();

    this.overlay.width = this.video.videoWidth;
    this.overlay.height = this.video.videoHeight;
    this.outCanvas.width = this.overlay.width;
    this.outCanvas.height = this.overlay.height;
    this.viewport.w = this.outCanvas.width;
    this.viewport.h = this.outCanvas.height;

    if (!this.model) {
      this.model = await blazeface.load();
    }

    this.current.x = Math.max(0, (this.video.videoWidth - this.viewport.w) / 2);
    this.current.y = Math.max(0, (this.video.videoHeight - this.viewport.h) / 2);

    this.running = true;
    this.startBtn.disabled = true;
    this.stopBtn.disabled = false;

    requestAnimationFrame(this._loop.bind(this));
  }

  stop() {
    this.running = false;
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  getSmooth() { return parseFloat(this.smoothInput.value); }

  async _loop() {
    if (!this.running) return;

    const predictions = await this.model.estimateFaces(this.video, false);

    const zoom = parseFloat(this.zoomInput.value);

    let faceCenter = null;
    let faceBox = null;
    if (predictions && predictions.length > 0) {
      const best = predictions[0];
      const [x1, y1] = best.topLeft;
      const [x2, y2] = best.bottomRight;
      faceBox = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
      faceCenter = { x: x1 + faceBox.w/2, y: y1 + faceBox.h/2 };
      if ((faceCenter.x - this.lastFaceCenter.x)**2 + (faceCenter.y - this.lastFaceCenter.y)**2 < 1000) {
        faceCenter = this.lastFaceCenter;
      } else {
        this.lastFaceCenter = faceCenter;
      }
    }

    let desiredCenter = { x: this.current.x + this.viewport.w/2, y: this.current.y + this.viewport.h/2 };
    if (faceCenter) desiredCenter = faceCenter;

    const cropW = this.clamp(this.viewport.w / zoom, 100, this.video.videoWidth);
    const cropH = this.clamp(this.viewport.h / zoom, 100, this.video.videoHeight);
    let targetX = desiredCenter.x - cropW/2;
    let targetY = desiredCenter.y - cropH/2;
    targetX = this.clamp(targetX, 0, this.video.videoWidth - cropW);
    targetY = this.clamp(targetY, 0, this.video.videoHeight - cropH);

    // targetPosition = currentPosition + (targetPosition - currentPosition) * (1 - smooth)
    // Just update the current viewport position when face is detected
    const smooth = this.getSmooth();
    this.current.x = this.current.x * (1 - (1 - smooth)) + targetX * (1 - smooth);
    this.current.y = this.current.y * (1 - (1 - smooth)) + targetY * (1 - smooth);

    this.octx.clearRect(0,0,this.overlay.width,this.overlay.height);
    if (faceBox) {
      this.octx.strokeStyle = 'lime';
      this.octx.lineWidth = 2;
      this.octx.strokeRect(faceBox.x, faceBox.y, faceBox.w, faceBox.h);
    }
    this.octx.strokeStyle = 'cyan';
    this.octx.lineWidth = 2;
    this.octx.strokeRect(this.current.x, this.current.y, cropW, cropH);

    this.outCtx.clearRect(0,0,this.outCanvas.width,this.outCanvas.height);
    this.outCtx.drawImage(this.video, this.current.x, this.current.y, cropW, cropH, 0, 0, this.outCanvas.width, this.outCanvas.height);

    requestAnimationFrame(this._loop.bind(this));
  }
}
