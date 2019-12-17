// BUILD_ENVS
export const BUILD_ENV_OMEKA = "BUILD_ENV_OMEKA";
export const BUILD_ENV_NODE = "BUILD_ENV_NODE";
export const BUILD_ENV =
  process.env.REACT_APP_BUILD_ENV === "OMEKA"
    ? BUILD_ENV_OMEKA
    : BUILD_ENV_NODE;

// Units
export const GROUP = "GROUP";
export const COMPONENT = "COMPONENT";
export const CM = "CM";
export const MM = "MM";
export const IN = "IN";
export const FT = "FT";

export const UNITS = [MM, CM, IN, FT];

export const DEFAULT_GRADIENT_COLORS = {
  inner: "rgb(145, 145, 145)",
  outer: "rgb(35, 35, 35)"
};
export const MIN_SCALE = 0;
export const MAX_SCALE = 2.5;

// Controls
export const DEFAULT_DAMPING_FACTOR: Number = 0.7;

// Touch controls
export const PINCH_END = "pinchend";
export const PINCH_START = "pinchstart";
export const ZOOM_IN = "zoomin";
export const ZOOM_OUT = "zoomout";
// distance between touches before a pan becomes a zoom
// 1/4 of the canvas in any direction
export const ZOOM_PINCH_DISTANCE_SIZE = 0.25;

// RENDERING
export const DEFAULT_CLEAR_COLOR = 0x666666;

// Webgl detector https://github.com/mrdoob/three.js/blob/master/examples/js/Detector.js

// IIFE for webgl support
export const WEBGL_SUPPORT = (() => {
  try {
    let testCanvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (testCanvas.getContext("webgl") ||
        testCanvas.getContext("experimental-webgl"))
    );
  } catch (error) {
    return false;
  }
})();

// loose detection of tablet or smartphone purely for hiding / showing menu labels.
export const DISPLAY_DEVICE = {
  ANDROID_SMARTPHONE: () =>
    navigator.userAgent.match(/Android/i) &&
    matchMedia("only screen and (max-width: 1024px)"),
  ANDROID_TABLET: () =>
    navigator.userAgent.match(/Android/i) &&
    matchMedia("only screen and (max-width: 768px)"),
  IPHONE: () => navigator.userAgent.match(/iPhone/i),
  IPAD: () => navigator.userAgent.match(/iPad/i),
  SMARTPHONE: () =>
    DISPLAY_DEVICE.ANDROID_SMARTPHONE() || DISPLAY_DEVICE.IPHONE(),
  TABLET: () => DISPLAY_DEVICE.ANDROID_TABLET() || DISPLAY_DEVICE.IPAD(),
  DESKTOP: () => !DISPLAY_DEVICE.TABLET() || DISPLAY_DEVICE.SMARTPHONE()
};

export const CONVERSIONS = {
  MM_TO_CM: (measurement: Number) => measurement / 10,
  MM_TO_IN: (measurement: Number) => measurement / 25.4,
  MM_TO_FT: (measurement: Number) => measurement / 304.8,
  CM_TO_IN: (measurement: Number) => measurement / 2.54,
  CM_TO_MM: (measurement: Number) => measurement * 10,
  CM_TO_FT: (measurement: Number) => measurement / 30.48,
  IN_TO_FT: (measurement: Number) => measurement / 12,
  IN_TO_CM: (measurement: Number) => measurement * 2.54,
  IN_TO_MM: (measurement: Number) => measurement * 25.4,
  FT_TO_IN: (measurement: Number) => measurement * 12,
  FT_TO_CM: (measurement: Number) => measurement * 30.48,
  FT_TO_MM: (measurement: Number) => measurement * 304.8
};

// Mesh exports
export const MAP_TYPES = {
  DIFFUSE_MAP: 0,
  NORMAL_MAP: 1,
  ROUGHNESS_MAP: 2,
  METALNESS_MAP: 3
  // etc
};

export const OBJ_EXT = ".obj";
export const STL_EXT = ".stl";
export const MTL_EXT = ".mtl";
export const ZIP_EXT = ".zip";
export const GZIP_EXT = ".gz";
export const JSON_EXT = ".js";
export const GZIP_MIME = "application/gzip";
export const JSON_MIME = "application/json";
// Cache
export const THREE_MODEL_CACHE_GET = 0;
export const THREE_MODEL_CACHE_SAVE = 1;
export const THREE_MODEL_CACHE_DB = "ThreeModelCache";
export const THREE_MODEL_CACHE_INDEX = "ThreeModelCacheIndex";
export const THREE_MODEL_CACHE_INDEX_ITEMS = ["id"];

// Mesh Loading Progress
export const PROGRESS_COMPLETE = "PROGRESS_COMPLETE";

// Worker stuff
export const WORKER_PROGRESS = "WORKER_PROGRESS";
export const WORKER_DATA = "WORKER_DATA";
export const GZIP_CHUNK_SIZE = 512 * 1024;

// Shorthand for THREE types
export const THREE_COLOR = "Color";
export const THREE_VECTOR2 = "Vector2";
export const THREE_VECTOR3 = "Vector3";
export const THREE_GROUP = "Group";
export const THREE_MESH = "Mesh";
export const THREE_DIFFUSE_MAP = "map";
export const THREE_TYPES = new Set([
  THREE_COLOR,
  THREE_VECTOR2,
  THREE_VECTOR3,
  THREE_GROUP,
  THREE_MESH
]);
export const THREE_MESH_STANDARD_MATERIAL = "MeshStandardMaterial";

// Converter
export const CONVERSION_TYPE_MESH = "CONVERSION_TYPE_MESH";
export const CONVERSION_TYPE_RTI = "CONVERSION_TYPE_RTI";
export const VALID_IMAGE_FORMATS = ".jpg,.png,.bmp,.gif,.jpeg";
export const VALID_MESH_FORMATS = ".obj";
export const VALID_RTI_FORMATS = ".ptm";
export const VALID_MATERIAL_FORMATS = ".mtl";
export const CHECKBOX = "checkbox";
export const MAP = "map";
export const FILE = "file";
export const DATA_URL_JPEG = "data:image/jpeg;base64,";
export const DATA_URL_PNG = "data:image/jpeg;base64,";

// Shader stuff
export const SIMPLEX_2D = "SIMPLEX_2D";

// WebVR
export const WEBVR_DEVICE_NOT_FOUND: string = "WEBVR DEVICE NOT FOUND";
export const WEBVR_NOT_SUPPORTED: string = "WEBVR NOT SUPPORTED";
export const WEBVR_ENTER: string = "ENTER VR";
export const WEBVR_EXIT: string = "EXIT VR";

export const WEBVR_SUPPORT = {
  NOT_SUPPORTED: 0,
  DEVICE_NOT_FOUND: 1,
  DEVICE_FOUND: 2
};

// Annotations
export const ANNOTATION_SAVE_STATUS = {
  SAVED: "SAVED",
  UPDATED: "UPDATED",
  NEEDS_UPDATE: "NEEDS_UPDATE",
  UNSAVED: "UNSAVED"
};

export const ANNOTATION_SETTINGS_OPTIONS = {
  CAMERA_POSITION: "cameraPosition",
  LIGHT_SETTINGS: "lightSettings"
}

export const KEYCODES = {
  LEFT: 37,
  RIGHT: 39,
  ESCAPE: 27
}