/* @flow */

import * as THREE from "three";

// Constants
import {
  THREE_MESH,
  THREE_GROUP,
  THREE_DIFFUSE_MAP,
  THREE_MESH_STANDARD_MATERIAL
} from "../../constants/application";

export function getChildren(mesh: THREE.Group | THREE.Mesh): Array<THREE.Mesh> {
  let children;
  if (mesh.constructor.name === THREE_MESH) {
    children = [mesh];
  } else {
    children = mesh.children;
  }
  return children;
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

export function smoothFaceNormals(bg: THREE.BufferGeometry): THREE.BufferGeometry {
  const geom = new THREE.Geometry().fromBufferGeometry(bg);
	geom.mergeVertices();
	geom.computeVertexNormals();
	geom.computeFaceNormals();
	return new THREE.BufferGeometry().fromGeometry(geom);
}
