/* @flow */
export function panLeft(distance: Number, matrix: typeof THREE.Vector3): typeof THREE.Vector3 {

  let dstX = new THREE.Vector3();
  dstX.setFromMatrixColumn(matrix, 0);
  dstX.multiplyScalar(-distance);
  return dstX;

}

export function panUp(distance: Number, matrix: typeof THREE.Vector3): typeof THREE.Vector3 {

  let dstY = new THREE.Vector3();
  dstY.setFromMatrixColumn(matrix, 1);
  dstY.multiplyScalar(distance);
  return dstY;

}

export function rotateLeft(): typeof THREE.Vector3 {


}

export function rotateUp(): typeof THREE.Vector3 {

  
}
