/* @flow */
import * as THREE from 'three';

import { DEFAULT_DAMPING_FACTOR } from '../constants/application';

export function panLeft(distance: number, matrix: typeof THREE.Vector3, dampingFactor: Number = DEFAULT_DAMPING_FACTOR): typeof THREE.Vector3 {

  let dstX = new THREE.Vector3();
  dstX.setFromMatrixColumn(matrix, 0);
  dstX.multiplyScalar(-distance * dampingFactor);
  return dstX;

}

export function panUp(distance: number, matrix: typeof THREE.Vector3, dampingFactor: Number = DEFAULT_DAMPING_FACTOR): typeof THREE.Vector3 {

  let dstY = new THREE.Vector3();
  dstY.setFromMatrixColumn(matrix, 1);
  dstY.multiplyScalar(distance * dampingFactor);
  return dstY;

}

export function rotateLeft(): typeof THREE.Vector3 {


}

export function rotateUp(): typeof THREE.Vector3 {


}
