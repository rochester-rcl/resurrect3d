export const GROUP = 'GROUP';
export const COMPONENT = 'COMPONENT';
export const CM = 'CM';
export const MM = 'MM';
export const IN = 'IN';
export const DEFAULT_GRADIENT_COLORS = {
  inner: "rgb(105, 105, 105)",
  outer: "rgb(35, 35, 35)",
}
export const MIN_SCALE = 0;
export const MAX_SCALE = 2.5;

// Touch controls
export const PINCH_END = 'pinchend';
export const PINCH_START = 'pinchstart';
export const ZOOM_IN = 'zoomin';
export const ZOOM_OUT = 'zoomout';
// distance between touches before a pan becomes a zoom
// 1/4 of the canvas in any direction
export const ZOOM_PINCH_DISTANCE_SIZE = 0.25;

// RENDERING
export const DEFAULT_CLEAR_COLOR = 0x666666;

// Webgl detector https://github.com/mrdoob/three.js/blob/master/examples/js/Detector.js

// IIFE for webgl support
export const WEBGL_SUPPORT = (() => {
  try {
    let testCanvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
  } catch(error) {
    return false;
  }
})();

// loose detection of tablet or smartphone purely for hiding / showing menu labels.
export const DISPLAY_DEVICE = {
  ANDROID_SMARTPHONE: () => navigator.userAgent.match(/Android/i) && matchMedia('only screen and (max-width: 1024px)'),
  ANDROID_TABLET: () => navigator.userAgent.match(/Android/i) && matchMedia('only screen and (max-width: 768px)'),
  IPHONE: () => navigator.userAgent.match(/iPhone/i),
  IPAD: () => navigator.userAgent.match(/iPad/i),
  SMARTPHONE: () => DISPLAY_DEVICE.ANDROID_SMARTPHONE() || DISPLAY_DEVICE.IPHONE(),
  TABLET: () => DISPLAY_DEVICE.ANDROID_TABLET() || DISPLAY_DEVICE.IPAD(),
}

export const CONVERSIONS = {
  CM_TO_IN: (measurement: number) => measurement * 0.393701,
  IN_TO_CM: (measurement: number) => measurement * 2.54,
  MM_TO_CM: (measurement: number) => measurement * 10,
  CM_TO_MM: (measurement: number) => measurement * 0.1,
}
