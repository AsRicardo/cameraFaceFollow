import { initUI, getElements } from './ui.js';
import { FaceFollower } from './faceFollower.js';

initUI();

const els = getElements();

const follower = new FaceFollower(els);

els.startBtn.addEventListener('click', () => follower.start());
els.stopBtn.addEventListener('click', () => follower.stop());

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (follower.running) follower.stop(); else follower.start();
  }
});
