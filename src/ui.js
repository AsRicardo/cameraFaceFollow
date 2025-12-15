export function initUI() {
  // nothing for now - DOM is static in index.html, but we can set sizes when needed
}

export function getElements() {
  return {
    video: document.getElementById('camVideo'),
    overlay: document.getElementById('overlay'),
    outCanvas: document.getElementById('outCanvas'),
    startBtn: document.getElementById('startBtn'),
    stopBtn: document.getElementById('stopBtn'),
    zoom: document.getElementById('zoom'),
    smooth: document.getElementById('smooth')
  };
}
