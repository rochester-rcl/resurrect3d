export const GROUP = 'GROUP';
export const COMPONENT = 'COMPONENT';
export const CM = 'cm';
export const MM = 'mm';
export const IN = 'in';
export const DEFAULT_GRADIENT_COLORS = {
  inner: "rgb(105, 105, 105)",
  outer: "rgb(35, 35, 35)",
}

// Webgl detector https://github.com/mrdoob/three.js/blob/master/examples/js/Detector.js

// IIFE for webgl support
export const WEBGL_SUPPORT = (() => {
  try {
    let testCanvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
  } catch(error) {
    return false;
  }
})()
