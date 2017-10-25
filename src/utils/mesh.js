/* @flow */

// THREEJS
import * as THREE from 'three';

export function volumeFromBounds(bbox: typeof THREE.Box3): Object {

  let { min, max } = bbox;
  let shape = {};
  shape.h = max.y - min.y;
  shape.w = max.x - min.x;
  shape.l = max.z - min.z;
  shape.volume = shape.l * shape.w * shape.h;
  return shape;

}

export function fitBoxes(bbox1: typeof THREE.Box3, bbox2: typeof THREE.Box3, factor: number): number {

  let shape1 = volumeFromBounds(bbox1);
  let shape2 = volumeFromBounds(bbox2);
  let size1 = Math.floor(shape1.h * shape1.w);
  let size2 = Math.floor(shape2.h * shape2.w);
  let fit = size1 % (size2 / factor);
  return fit;

}

type Materials = THREE.MeshStandardMaterial | THREE.MeshPhongMaterial | THREE.MeshLambertMaterial;

export function mapMaterials(materials: Array<Materials> , callback): Array<Materials> {
  if (materials.constructor === Array) return materials.map(material => callback(material));
  return callback(materials);
}
