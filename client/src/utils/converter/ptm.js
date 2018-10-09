/* @flow */
// TODO This should really be in a Worker
import * as _THREE from "three";
import * as nj from "numjs";

const THREE = _THREE;
const MAX_LINES = 6;
// default in Node ReadStream
const CHUNK_SIZE = 665536;

const formatOffsets = {
  PTM_FORMAT_LRGB: 9
};

const getNormal = coefficients => {
  const [a0, a1, a2, a3, a4, a5] = coefficients;
  const u = (a2 * a4 - 2 * a1 * a3) / (4 * a0 * a1 - a2 ** 2);
  const v = (a2 * a3 - 2 * a0 * a4) / (4 * a0 * a1 - a2 ** 2);
  return new THREE.Vector3(u, v, Math.sqrt(1 - u ** 2 - v ** 2)).normalize();
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

const pad = (arr: nj.NdArray, squareSize: Number): nj.NdArray => {
  const [h, w, ...rest] = arr.shape;
  const padded = nj.zeros([squareSize, squareSize, 4]); // adding alpha
  const offsetTop = Math.floor((squareSize - h) / 2);
  const offsetLeft = Math.floor((squareSize - w) / 2);
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      for (let k = 0; k < 4; k++) {
        if (k !== 3) {
          const val = arr.get(i, j, k);
          padded.set(i + offsetTop, j + offsetLeft, k, val);
        } else {
          padded.set(i + offsetTop, j + offsetLeft, k, 255);
        }
      }
    }
  }
  return padded;
};

// Instantiating more than 4 NdArrays at a higher resolution leads to a segfault!
export default function readPtm(ptmData: ArrayBuffer | Uint8Array): Promise {
  return new Promise((resolve, reject) => {
    const header = readHeader(ptmData);
    const { w, h, format, scale, bias, byteLength } = header;
    const offset = w * h * formatOffsets[format];
    const chars = new Uint8Array(ptmData.slice(byteLength));
    const nPixels = w * h;
    const normalMap = new Uint8Array(h * w * 3);
    const diffuse = new Uint8Array(h * w * 3);
    const outCanvas = document.createElement("canvas");
    const getDataURL = (data: nj.NdArray) => {
      nj.images.save(data, outCanvas);
      return outCanvas.toDataURL();
    };
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        const pixel = i * w + j;
        const coefficient = [];
        const cIndex = pixel * 6;
        for (let k = 0; k < 6; k++) {
          coefficient[k] = ((chars[cIndex + k] - bias[k]) * scale[k]) / 255.0;
        }
        const normal = getNormal(coefficient)
          .toArray()
          .map(val => parseInt((val + 1) * (255 / 2), 10));
        for (let c = 0; c < 3; c++) {
          const index = ((h - 1 - i) * w + j) * 3;
          normalMap[index + c] = normal[c];
          diffuse[index + c] = chars[nPixels * 6 + pixel * 3 + c];
        }
      }
    }
    const squareVal = ceilPowerOfTwo(Math.max(h, w));
    outCanvas.width = squareVal;
    outCanvas.height = squareVal;
    /* clean up some garbage - can also see if there's a way to swap
    underlying buffer for the NdArray, probably not */
    let rgbArray = new nj.NdArray(diffuse, [h, w, 3]);
    const rgbURL = getDataURL(pad(rgbArray, squareVal));
    rgbArray = null;
    let normalArray = new nj.NdArray(normalMap, [h, w, 3]);
    const normURL = getDataURL(pad(normalArray, squareVal));
    normalArray = null;
    resolve({
      normalMap: normURL,
      diffuse: rgbURL
    });
  });
}
