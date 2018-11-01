/* @flow */

// THREEJS
import * as THREE from 'three';

// utils
import { base64ImageToBlob } from './image';

// constants
import { MAP_TYPES } from '../constants/application';

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

export function exportMap(material: Materials): Array<Object> {
  let images = [];
  if (material.map !== null) {
    if (material.map.image !== undefined) {
      let imageData = base64ImageToBlob(material.map.image.currentSrc, 1024);
      images.push({ rawData: imageData.rawData, ext: imageData.ext, type: MAP_TYPES.DIFFUSE_MAP });
    }
  }
  if (material.normalMap !== null) {
    if (material.normalMap.image !== undefined) {
      let imageData = base64ImageToBlob(material.normalMap.image.currentSrc, 1024);
      images.push({ rawData: imageData.rawData, ext: imageData.ext, type: MAP_TYPES.NORMAL_MAP });
    }
  }
  return images;
}

export function getExtension(path: string): string {
  return '.' + path.split('.').pop();
}
