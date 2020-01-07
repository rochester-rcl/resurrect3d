/* @flow */
import * as THREE from 'three';

import { DEFAULT_DAMPING_FACTOR } from '../constants/application';

export function panLeft(distance, matrix, dampingFactor = DEFAULT_DAMPING_FACTOR) {	//Matrix THREE.Vector3

  let dstX = new THREE.Vector3();
  dstX.setFromMatrixColumn(matrix, 0);
  dstX.multiplyScalar(-distance * dampingFactor);
  return dstX;

}

export function panUp(distance, matrix, dampingFactor = DEFAULT_DAMPING_FACTOR) {

  let dstY = new THREE.Vector3();
  dstY.setFromMatrixColumn(matrix, 1);
  dstY.multiplyScalar(distance * dampingFactor);
  return dstY;

}

export function rotateLeft() {


}

export function rotateUp() {


}
