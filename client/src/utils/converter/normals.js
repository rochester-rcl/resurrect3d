/* @flow */

import * as THREE from "three";

// image processing
import * as nj from "numjs";
import * as cwise from "cwise";
import * as ops from 'ndarray-ops';

// geometry
import { smoothFaceNormals, getChildren } from './geometry';

export function createNormalMap(mesh: THREE.Group | THREE.Mesh): Promise {
  return new Promise((resolve, reject) => {
    try {
      const children = getChildren(mesh);
      const zScale = 300;
      children.forEach(child => {
        child.geometry = smoothFaceNormals(child.geometry);
        const data = nj.images.read(child.material.map.image);
        const grad = sobel(data);
        const [h, w, ...rest] = grad.shape;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const u = grad.get(y, x, 0);
            const v = grad.get(y, x, 1);
            const norm = new THREE.Vector3(u, v, zScale).normalize().toArray();
            for (let i = 0; i < norm.length; i++) {
              data.set(y, x, i, toUint8(norm[i]));
            }
          }
        }
        const outCanvas = document.createElement('canvas');
        outCanvas.width = w;
        outCanvas.height = h;
        nj.images.save(data, outCanvas);
        child.material.normalMap = new THREE.TextureLoader().load(outCanvas.toDataURL());
      });
      resolve(mesh);
    } catch (error) {
      reject(error);
    }
  });
}

export function toUint8(val: Number): Number {
  return parseInt((val + 1.0) * (255.0 / 2.0), 10);
}

// sigma = 10
const gaussianKernel = nj.array([
  [0.110741, 0.111296, 0.110741],
  [0.111296, 0.111853, 0.111296],
  [0.110741, 0.111296, 0.110741]
], 'float32');

// Actually need a sobel function that handles vertical and horizontal operators so slightly rewriting nj.images.sobel

const sobelKernel = [
  "array",
  "array",
  { offset: [-1, -1], array: 1 }, // a
  { offset: [-1, 0], array: 1 }, // b
  { offset: [-1, 1], array: 1 }, // c
  { offset: [0, -1], array: 1 }, // d
  // {offset:[ 9,  0], array:1}, // useless since available already and always multiplied by zero
  { offset: [0, 1], array: 1 }, // f
  { offset: [1, -1], array: 1 }, // g
  { offset: [1, 0], array: 1 }, // h
  { offset: [1, 1], array: 1 } // i
];

function _sobelY(s, img, a, b, c, d, f, g, h, i): void {
  s = a + 2 * b + c - g - 2 * h - i;
}

function _sobelX(s, img, a, b, c, d, f, g, h, i): void {
  s = a - c + 2 * d - 2 * f + g - i;
}

// borrowed from https://github.com/nicolaspanel/numjs/blob/8bc3d8b5159a4a5aa69800de88fabe3fe35cc6b7/src/utils.js
function shapeSize(shape: Array<Number>): Number {
  let s = 1;
  for (let i = 0; i < shape.length; i++) {
    s *= shape[i];
  }
  return s;
}

const sobelX = cwise({
  args: [...sobelKernel],
  body: function doSobelBody(s, img, a, b, c, d, f, g, h, i) {
    s = a - c + 2 * d - 2 * f + g - i;
  }
});

const sobelY = cwise({
  args: [...sobelKernel],
  body: function doSobelBody(s, img, a, b, c, d, f, g, h, i) {
    s = a + 2 * b + c - g - 2 * h - i;
  }
});

const convolve3x3 = cwise({
  args: [
    'array', // c
    'array', // xe
    'scalar', // fa
    'scalar', // fb
    'scalar', // fc
    'scalar', // fd
    'scalar', // fe
    'scalar', // ff
    'scalar', // fg
    'scalar', // fh
    'scalar', // fi
    {offset: [-1, -1], array: 1}, // xa
    {offset: [-1, 0], array: 1}, // xb
    {offset: [-1, 1], array: 1}, // xc
    {offset: [0, -1], array: 1}, // xd
    // {offset:[ 9,  0], array:1}, // useless since available already
    {offset: [0, 1], array: 1}, // xf
    {offset: [1, -1], array: 1}, // xg
    {offset: [1, 0], array: 1}, // xh
    {offset: [1, 1], array: 1} // xi
  ],
  body: function (c, xe, fa, fb, fc, fd, fe, ff, fg, fh, fi, xa, xb, xc, xd, xf, xg, xh, xi) {
    c = xa * fi + xb * fh + xc * fg + xd * ff + xe * fe + xf * fd + xg * fc + xh * fb + xi * fa;
  }
});

function gaussianBlur(arr) {
  const gk = gaussianKernel.selection;
  const out = new nj.NdArray(new Float32Array(shapeSize(arr.shape)), arr.shape);
  convolve3x3(out.selection, arr.selection, gk.get(0,0), gk.get(0, 1), gk.get(0, 2), gk.get(1,0), gk.get(1,1), gk.get(1,2), gk.get(2,0), gk.get(2,1), gk.get(2,2));
  return out;
}

export function sobel(img: nj.NDArray): Object {
  let gray = nj.images.rgb2gray(img);
  gray = gaussianBlur(gray);
  const iShape = gray.shape;
  const iH = iShape[0];
  const iW = iShape[1];
  let out = new nj.NdArray(new Float32Array(iH * iW * 2), [iH, iW, 2]);
  sobelX(out.selection.pick(null, null, 0), gray.selection);
  sobelY(out.selection.pick(null, null, 1), gray.selection);
  return out;
}
