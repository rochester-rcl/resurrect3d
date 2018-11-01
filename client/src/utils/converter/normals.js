/* @flow */

import * as THREE from "three";

// image processing
import * as nj from "numjs";
import * as cwise from "cwise";
import * as ops from 'ndarray-ops'

// geometry
import { smoothFaceNormals, getChildren } from './geometry';

// TODO apparently need to implement my own image loader now? This currently doesn't work once everything has been minified / optimized.
export function createNormalMap(mesh: THREE.Group | THREE.Mesh): Promise {
  const canvas = document.createElement('canvas');
  return new Promise((resolve, reject) => {
    try {
      const children = getChildren(mesh);
      const zScale = 300;
      children.forEach(child => {
        child.geometry = smoothFaceNormals(child.geometry);
        const image = child.material.map.image;
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

//  all utils ported from https://github.com/bakulf/RTIViewer/blob/master/rtiviewer/src/util.h

export const ZERO_TOL = 1.0e-5;

export function solveCubic(c: Array, s: Array) {

    const a = c[2] / c[3];
    const b = c[1] / c[3];
    const _c = c[0] / c[3];

    const sq_a = a*a;
    const p = 1.0 / 3 * (-1.0 / 3 * sq_a + b);
    const q = 1.0 / 2 * (2.0 / 27 * a * sq_a - 1.0 / 3 * a * b + _c);

    const cb_p = p*p*p;
    const d = q*q + cb_p;
    let num;
    let u;
    let v;
    if (isZero(d)) {
        if (isZero(q)) {
            s[0] = 0;
            num = 1;
        } else {
            u = cubeRoot(-q);
            s[0] = 2 * u;
            s[1] = -u;
            num = 2;
        }
    } else if (d < 0) {
        const phi = 1.0 / 3 * Math.acos(-q / Math.sqrt(-cb_p));
        const t = 2 * Math.sqrt(-p);

        s[0] = t * Math.cos(phi);
        s[1] = -t * Math.cos(phi + Math.PI / 3);
        s[2] = -t * Math.cos(phi - Math.PI / 3);
        num = 3;
    } else {
        const sqrt_d = Math.sqrt(d);
        u = cubeRoot(sqrt_d - q);
        v = -cubeRoot(sqrt_d + q);
        s[0] = u + v;
        num = 1;
    }
    const sub = 1.0 / 3 * a;

    for (let i = 0; i < num; i++) {
      s[i] -= sub;
    }

    return [s, num];
}

export function solveQuadric(c: Array, s: Array, _n: Number) {
    const n = (_n !== undefined) ? _n : 0;

    const p = c[1] / (2 * c[2]);
    const q = c[0] / c[2];

    const d = p * p - q;

    if (isZero(d)) {
        s[0 + n] = -p;
        return [s, 1]
    } else if (d < 0) {
      return [s, 0];
    } else if (d > 0) {
      const sqrt_d = Math.sqrt(d);
      s[0 + n] = sqrt_d - p;
      s[1 + n] = -sqrt_d - p;
      return [s, 2];
    }
    return [s, -1];
}

export function solveQuartic(c: Array, _s: Array) {
    const a = c[3] / c[4];
    const b = c[2] / c[4];
    const _c = c[1] / c[4];
    const d = c[0] / c[4];
    const coeffs = new Float32Array(4);
    const sq_a = a*a;
    const p = -3.0 / 8 * sq_a + b;
    const q = 1.0 / 8 * sq_a * a - 1.0 / 2 * a * b + _c;
    const r = -3.0 / 256 * sq_a * sq_a + 1.0 / 16 * sq_a * b - 1.0 / 4 * a * _c + d;
    let u, v, rest, _num, num;
    let s = _s;
    if (isZero(r)) {
        coeffs[0] = q;
        coeffs[1] = p;
        coeffs[2] = 0.0;
        coeffs[3] = 1.0;
        [s, num] = solveCubic(coeffs, s);
        num += 1;
        s[num] = 0;
        return [s, num];
    } else {
        coeffs[0] = 1.0 / 2 * r * p - 1.0 / 8 * q * q;
        coeffs[1] = -r;
        coeffs[2] = (-1.0 / 2) * p;
        coeffs[3] = 1;
        [s, ...rest] = solveCubic(coeffs, _s);

        const z = s[0];

        u = z * z - r;
        v = 2 * z - p;

        if (isZero(u)) {
            u = 0;
        } else if (u > 0) {
            u = Math.sqrt(u);
        } else {
            return [s, 0];
        }

        if (isZero(v)) {
            v = 0;
        } else if (v > 0) {
            v = Math.sqrt(v);
        } else {
            return [s, 0];
        }

        coeffs[0] = z - u;
        coeffs[1] = (q < 0) ? -v : v;
        coeffs[2] = 1;
        [s, _num, ...rest] = solveQuadric(coeffs, s, 0);
        coeffs[0] = z + u;
        coeffs[1] = (q < 0) ? v : -v;
        coeffs[2] = 1;
        let [s, num] = solveQuadric(coeffs, s, _num);
        num += _num;
    const sub = 1.0 / 4 * a;
    for (let i = 0; i < num; i++) {
      s[i] -= sub;
    }
    return [s, num];
  }
}

export function isZero(num: Number): bool {
    const limit = 1e-9;
    if (num > -limit && num < limit) {
        return true;
    } else {
      return false;
    }
}

export function cubeRoot(num: Number): Number {
    if (num > 0) {
        return num ** (1.0 / 3.0);
    } else if (num < 0) {
      return -Math.pow(-num, 1.0 / 3.0);
    }
    return 0;
}

export function computeMaxOnCircle(a, _x, _y) {
    let max_u = -1;
    let max_v = -1;
    let x = _x;
    let y = _y;
    let zeros = new Float32Array(5);
    const db0 = a[2] - a[3];
    const db1 = 4 * a[1] - 2 * a[4] - 4 * a[0];
    const db2 = -6 * a[2];
    const db3 = -4 * a[1] - 2 * a[4] + 4 * a[0];
    const db4 = a[2] + a[3];
    let c, nroots, index, u, v;

    if (Math.abs(db0) < ZERO_TOL && Math.abs(db1) < ZERO_TOL && Math.abs(db2) < ZERO_TOL && Math.abs(db3) < ZERO_TOL && Math.abs(db4) < ZERO_TOL) {
        return [0.0, 1.0, 1];
    }

    if (db0 !== 0) {
        c = new Float32Array([db4, db3, db2, db1, db0]);
        [zeros, nroots] = solveQuartic(c, zeros);
    } else if (db1 !== 0) {
        c = new Float32Array([db4, db3, db2, db1]);
        [zeros, nroots] = solveCubic(c, zeros);
    } else {
        c = new Float32Array([db4, db3, db2]);
        [zeros, nroots] = solveQuadric(c, zeros, 0);
    }
    if (nroots <= 0) {
        return [x, y, -1];
    }

    if (nroots === 1) {
        index = 0;
    } else {
        let vals = new Float32Array(nroots);
        index = 0;
        for (let i = 0; i < nroots; i++) {
          u = 2 * zeros[i] / (1 + zeros[i] * zeros[i]);
          v = (1 - zeros[i] * zeros[i]) / (1 + zeros[i] * zeros[i]);
          vals[i] = a[0] * u * u + a[1] * v * v + a[2] * u * v + a[3] * u + a[4] * v + a[5];
          if (vals[i] > vals[index]) {
              index = i;
          }
        }
    }

    x = 2 * zeros[index] / (1 + zeros[index] * zeros[index]);
    y = (1 - zeros[index] * zeros[index]) / (1 + zeros[index]**2);

    let maxval = -1000;
    for (let k = 0; k < 20; k++) {
      let inc = (1 / 9.0) / 20 * k;
      let arg = Math.PI * (26.0 / 18.0 + inc);
      u = Math.cos(arg);
      v = Math.sin(arg);
      let polyval = a[0] * u * u + a[1] * v * v + a[2] * u * v + a[3] * u + a[4] * v + a[5];
      if (maxval < polyval) {
          maxval = polyval;
          max_u = u;
          max_v = v;
      }
    }
    u = 2 * zeros[index] / (1 + zeros[index] * zeros[index]);
    v = (1 - zeros[index] * zeros[index]) / (1 + zeros[index] * zeros[index]);
    let val1 = a[0] * u * u + a[1] * v * v + a[2] * u * v + a[3] * u + a[4] * v + a[5]
    if (maxval > val1) {
        x = max_u
        y = max_v
    }
    return [x, y, 1];
}
