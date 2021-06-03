/* @flow */

import * as THREE from "three";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Constants
import {
  THREE_MESH,
  THREE_SCENE,
  THREE_GROUP,
  THREE_DIFFUSE_MAP,
  THREE_MESH_STANDARD_MATERIAL
} from "../../constants/application";
// TODO replace all walk and children functions with traverse
import initSimplifyModifier from "./SimplifyModifier";
const simplify = initSimplifyModifier(THREE);

export function getChildren(mesh: THREE.Group | THREE.Mesh): Array<THREE.Mesh> {
  const children = [];
  mesh.traverse(child => {
    if (child.constructor.name === THREE_MESH) {
      children.push(child);
    }
  });
  return children;
}

export function toYUp(mesh) {
  return new Promise((resolve, reject) => {
    try {
      mesh.rotation.x = -(Math.PI / 2);
      mesh.updateMatrix();
      resolve(mesh);
    } catch (error) {
      reject(error);
    }
  });
}

export function centerGeometry(mesh: THREE.Group | THREE.Mesh): Promise {
  return new Promise((resolve, reject) => {
    const box = new THREE.Box3().setFromObject(mesh);
    let offset = new THREE.Vector3();
    box.getCenter(offset);
    offset = offset.negate().toArray();
    const children = getChildren(mesh);
    children.forEach(child => {
      child.geometry.translate(...offset);
    });
    resolve(mesh);
  });
}

// re-compute vertex and face normals here

export function smoothFaceNormals(
  bg: THREE.BufferGeometry
): THREE.BufferGeometry {
  const merged = BufferGeometryUtils.mergeVertices(bg);
  merged.computeVertexNormals();
  merged.computeFaceNormals();
  return bg;
}

// This is impractical. It's way too slow.
export function simplifyMesh(mesh) {
  return new Promise((resolve, reject) => {
    try {
      const children = getChildren(mesh);
      mesh.children = children.map(doSimplify);
      resolve(mesh);
    } catch (error) {
      reject(error);
    }
  });
}

function doSimplify(mesh) {
  const simplified = mesh.clone();
  const count = Math.floor(simplified.geometry.attributes.position.count * 0.1);
  simplified.geometry = simplify(simplified.geometry, count);
  return simplified;
}
