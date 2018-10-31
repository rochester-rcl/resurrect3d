/* @flow */
// TODO This should really be in a Worker
import * as _THREE from "three";
import * as nj from "numjs";
import { ZERO_TOL, computeMaxOnCircle } from './normals';

const THREE = _THREE;
const MAX_LINES = 6;
// default in Node ReadStream
const CHUNK_SIZE = 665536;
const MAX_SQUARE_VAL = 8192;
const formatOffsets = {
  PTM_FORMAT_LRGB: 9
};

const fixNormal = (vec: THREE.Vector3): void => {
  if (isNaN(vec.x)) {
    if (vec.x === -Infinity) {
      vec.setX(-1.0);
    } else {
      vec.setX(1.0);
    }
  }
  if (isNaN(vec.y)) {
    if (vec.x === -Infinity) {
      vec.setY(-1.0);
    } else {
      vec.setY(1.0);
    }
  }
  if (isNaN(vec.z)) {
    if (vec.x === -Infinity) {
      vec.setZ(0.0);
    } else {
      vec.setZ(1.0);
    }
  }
}

const checkNormal = (vec: THREE.Vector3): bool => {
  if (isNaN(vec.x)) return false;
  if (isNaN(vec.y)) return false;
  if (isNaN(vec.z)) return false;
  return true;
}

// Can port over the much more robust python code

const getNormal = (coefficients) => {
  if (coefficients.includes(0)) return new THREE.Vector3(0.0, 0.0, 1.0);
  const coeffs = coefficients.map((val) => val / 255);
  const [a0, a1, a2, a3, a4, a5] = coeffs;
  let u, v, z, d;
  if (Math.abs(4 * a1 * a0 - a2 * a2) < ZERO_TOL) {
    u = 0.0;
    v = 0.0;
  } else {
    if (Math.abs(a2) < ZERO_TOL) {
      u = -a3 / (2.0 * a0);
      v = -a4 / (2.0 * a1);
    } else {
      u = (a2 * a4 - 2 * a1 * a3) / (4 * a0 * a1 - a2 ** 2);
      v = (a2 * a3 - 2 * a0 * a4) / (4 * a0 * a1 - a2 ** 2);
    }
  }
  if (coefficients.slice(0, coefficients.length-1).every((coeff) => Math.abs(coeff) < ZERO_TOL)) {
    u = 0.0;
    v = 0.0;
    z = 0.0;
  } else {
    let maxfound;
    let length2d = u * u + v * v;
    if (4 * a0 * a1 - a2 * a2 > ZERO_TOL && a0 < -ZERO_TOL) {
      maxfound = 1;
    } else {
      maxfound = 0;
    }
    if (length2d > 1 - ZERO_TOL || maxfound === 0) {
      let stat;
      [u, v, stat] = computeMaxOnCircle(coeffs, u, v);
      if (stat === -1) {
        length2d = Math.sqrt(length2d);
        if (length2d > ZERO_TOL) {
          u /= length2d;
          v /= length2d;
        }
      }
    }
    d = 1.0 - u * u - v * v;
    if (d < 0.0) {
      z = 0.0;
    } else {
      z = Math.sqrt(d);
    }
  }
  const vec = new THREE.Vector3(u, v, z).normalize();
  return vec;
};

const formatHeader = (ascii: string) => {
  const headerArray = ascii.split("\n").slice(1, 6);
  return {
    format: headerArray[0],
    w: Number(headerArray[1]),
    h: Number(headerArray[2]),
    scale: headerArray[3]
      .split(" ")
      .slice(0, -1)
      .map(val => Number(val)),
    bias: headerArray[4]
      .split(" ")
      .slice(0, -1)
      .map(val => Number(val)),
    byteLength: ascii
      .split("\n")
      .slice(0, 6)
      .join("").length
  };
};

const readHeader = (ptmData: ArrayBuffer): Object => {
  // header byte size may vary so we may as well load in a large chunk
  const ascii = new TextDecoder("iso-8859-2").decode(
    ptmData.slice(0, CHUNK_SIZE)
  );
  const header = formatHeader(ascii);
  return header;
};

// Apparently this is missing from the npm version. No idea why
// https://github.com/mrdoob/three.js/blob/dev/src/math/Math.js
const ceilPowerOfTwo = (val: Number): Number => {
  return Math.pow(2, Math.ceil(Math.log(val) / Math.LN2));
};

const pad = (arr: Uint8Array, squareSize: Number, w: Number, h: Number, padded: Uint8Array): nj.NdArray => {
  const offsetTop = Math.floor((squareSize - h) / 2);
  const offsetLeft = Math.floor((squareSize - w) / 2);
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      for (let k = 0; k < 4; k++) {
        const index = (i * w + j) * 3;
        if (k !== 3) {
          const val = arr[index + k];
          padded[offsetTop + index + k] = 255;
        } else {
          padded[index + k] = 255;
        }
      }
    }
  }
  // Keeping this notation in here since it's handy and completely undocumented, but we can't use it for the bigger stuff
  /*
  padded.slice([offsetTop, offsetTop + h], [offsetLeft, offsetLeft + w], [0, 3]).assign(arr, false);
  padded.slice([offsetTop, offsetTop + h], [offsetLeft, offsetLeft + w], [3, 4]).assign(255, false);
  */
  return padded;
};

// Instantiating more than 4 NdArrays at a higher resolution leads to a segfault!
export default function readPtm(ptmData: ArrayBuffer | Uint8Array): Promise {
  return new Promise((resolve, reject) => {
    // ptm data
    const header = readHeader(ptmData);
    const { w, h, format, scale, bias, byteLength } = header;
    const offset = w * h * formatOffsets[format];
    const chars = new Uint8Array(ptmData.slice(byteLength));
    const nPixels = w * h;

    // buffers
    const normalMap = new Uint8Array(h * w * 3);
    const diffuse = new Uint8Array(h * w * 3);

    // Canvas stuff
    const ceilPowTwo = ceilPowerOfTwo(Math.max(h, w))
    const squareVal = (ceilPowTwo < MAX_SQUARE_VAL) ? ceilPowTwo : MAX_SQUARE_VAL;
    const outCanvas = document.createElement("canvas");
    outCanvas.width = squareVal;
    outCanvas.height = squareVal;
    const ctx = outCanvas.getContext('2d');
    const offsetTop = Math.floor((squareVal - h) / 2);
    const offsetLeft = Math.floor((squareVal - w) / 2);
    const rgba = new Uint8ClampedArray(h * w * 4);
    const getDataURL = (data: Uint8Array, _w: Number, _h: Number) => {
      let chan = 0;
      let achan = 0;
      for (let i = 0; i < _w * _h; i++, chan += 3, achan += 4) {
        rgba[achan] = data[chan];
        rgba[achan+1] = data[chan+1];
        rgba[achan+2] = data[chan+2];
        rgba[achan+3] = 255;
      }
      const imageData = new ImageData(rgba, _w, _h);
      ctx.putImageData(imageData, offsetLeft, offsetTop, 0, 0, _w, _h);
      return outCanvas.toDataURL();
    };

    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        const pixel = i * w + j;
        const coefficient = [];
        const cIndex = pixel * 6;
        for (let k = 0; k < 6; k++) {
          coefficient[k] = ((chars[cIndex + k] - bias[k]) * scale[k]);
        }
        const normal = getNormal(coefficient).toArray().map(val => Math.floor((val + 1) * (255 / 2), 10));
        const index = ((h - 1 - i) * w + j) * 3;
        for (let c = 0; c < 3; c++) {
          normalMap[index + c] = normal[c];
          diffuse[index + c] = chars[nPixels * 6 + pixel * 3 + c];
        }
      }
    }

    /* clean up some garbage - can also see if there's a way to swap
    underlying buffer for the NdArray, probably not */
    // const out = nj.zeros([squareVal, squareVal, 4]);
    const rgbURL = getDataURL(diffuse, w, h);
    const normURL = getDataURL(normalMap, w, h);
    resolve({
      normalMap: normURL,
      diffuse: rgbURL,
    });
  });
}
