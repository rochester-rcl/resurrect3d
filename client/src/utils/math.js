/*@flow*/
import { CM, MM, IN, CONVERSIONS } from '../constants/application';

import * as THREE from 'three';

export function cmToInches(measurement) {
  return measurement * 0.393701;
}

export function cmToMM(measurement) {
  return measurement * 0.1;
}

export function inchesToCM(measurement) {
  return measurement * 2.54;
}

export function convertUnits(from, to, measurement) {
  from = from.toUpperCase();
  if (from === to) return measurement;
  let conversion = from + '_TO_' + to;
  let cback = CONVERSIONS[conversion];
  return (cback !== undefined) ? cback(measurement) : measurement;
}

function sleep(duration) {
  return new Promise((resolve, reject) => setTimeout(() => resolve(), duration));
}

export function animateLerp(from, to, duration, steps) {  //from, to vectors
  let tasks = [];
  for (let i = 0; i < steps; i++) {
    let alpha = i / steps;
    tasks.push(sleep(duration).then(
      () => {
        from.lerpVectors(from, to, alpha)
      }
    ));
  }
  return Promise.all(tasks);
}

export function lerpArrays(start, end, alpha)
{
  return start.map((val, index) => THREE.Math.lerp(val, end[index], alpha));
}
