/* @flow */
import * as _THREE from "three";

// LOADERS
import initLoaders from "../loaders/InitLoaders";

// Constants
import {
  THREE_MESH,
  THREE_GROUP,
  THREE_DIFFUSE_MAP,
  THREE_MESH_STANDARD_MATERIAL
} from "../../constants/application";

// Pako
import pako from "pako";

// postrprocessing options

import { getChildren, centerGeometry } from './geometry';

import { createNormalMap } from './normals';

// Abstract Base Class
import ThreeConverter from './ThreeConverter';
// super obnoxious pattern.
const THREE = _THREE;

export default class ThreeObjConverter extends ThreeConverter {
  constructor(mesh: File, materials: File, maps: Object, options: Object) {
    super(mesh, maps, options);
    this.mtlFile = materials;
    this.loadObj = this.loadObj.bind(this);
    this.loadMtl = this.loadMtl.bind(this);
    this.setUpMaterials = this.setUpMaterials.bind(this);
    this.rectifyDataURLs = this.rectifyDataURLs.bind(this);
  }

  loadObj(material: THREE.MeshStandardMaterial) {
    return new Promise((resolve, reject) => {
      if (this.loadersInitialized === false) {
        reject(
          "ThreeConverter.init must be called before you can convert this mesh."
        );
      } else {
        if (this.meshFile !== null) {
          this.readASCII(this.meshFile).then(meshData => {
            const objLoader = new THREE.OBJLoader();
            objLoader.setPath("");
            if (material !== undefined) objLoader.setMaterials(material);
            this.mesh = objLoader.parse(meshData);
            this.setUpMaterials().then(() => resolve(this.mesh));
          });
        } else {
          resolve(new THREE.Mesh());
        }
      }
    });
  }

  rectifyTextureURL(
    _materials: THREE.MTLLoader.MaterialCreator,
    maps: Array<Object>
  ) {
    const diffuse = maps.find(map => map.type === THREE_DIFFUSE_MAP);
    for (let key in _materials.materialsInfo) {
      let val = _materials.materialsInfo[key];
      if (val.map_kd !== undefined) {
        if (diffuse) {
          val.map_kd = diffuse.dataURL;
        }
      }
    }
  }

  rectifyDataURLs(serialized: object) {
    serialized.images.forEach((image) => {
      let map = this.maps.find((_map) => {
        return _map.uuid === image.uuid
      });
      if (map !== undefined) {
        image.url = map.dataURL;
      }
    });
  }

  // TODO so far only working with ONE MAP - will have to think about how to do it otherwise, UUIDs will work
  setUpMaterials(): Promise {
    const tasks = [];
    let children;
    if (this.mesh.constructor.name === THREE_MESH) {
      children = [this.mesh];
    } else {
      children = this.mesh.children;
    }
    children.forEach(child => {
      const material = new THREE.MeshStandardMaterial();
      for (let key in child.material) {
        if (material[key] !== undefined) {
          material[key] = child.material[key];
        }
      }
      material.type = THREE_MESH_STANDARD_MATERIAL;
      child.material = material;
      for (let key in this.maps) {
        let map = this.maps[key];
        // because diffuse is handled in the loader via map_kd
        let task = this.loadTexture(map.dataURL, (tex) => {
          child.material[map.type] = tex;
          tex.image.uuid = THREE.Math.generateUUID();
          map.uuid = tex.image.uuid;
        });
        tasks.push(task);
      }
    });
    return Promise.all(tasks);
  }

  loadMtl() {
    return new Promise((resolve, reject) => {
      if (this.loadersInitialized === false) {
        reject(
          "ThreeConverter.init must be called before you can convert this material."
        );
      } else {
        if (this.mtlFile !== null) {
          this.readASCII(this.mtlFile).then(mtlData => {
            const mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath("");
            this.materials = mtlLoader.parse(mtlData);
            this.readMaps(this.mapFiles).then(maps => {
              this.maps = maps;
              this.rectifyTextureURL(this.materials, this.maps);
              resolve(this.materials);
            });
          });
        } else {
          resolve(new THREE.MeshStandardMaterial());
        }
      }
    });
  }

  convert(): void {
    return this.loadMtl().then(material =>
      this.loadObj(material).then(() => {
        super.convert();
        return this.handleOptions().then((mesh) => {
          const exported = mesh.toJSON();
          this.rectifyDataURLs(exported);
          return Promise.resolve(exported)
        });
      })
    );
  }
}
