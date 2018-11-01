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

// lodash
import lodash from 'lodash';

// Abstract Base Class
import ThreeConverter from './ThreeConverter';
// super obnoxious pattern.
const THREE = _THREE;

export default class ThreeObjConverter extends ThreeConverter {
  OPTIONS_MAP: {
    center: centerGeometry,
    createNormalMap: createNormalMap,
  }
  constructor(mesh: File, materials: File, maps: Object, options: Object, progress: ConverterProgress) {
    super(mesh, maps, options, progress);
    this.mtlFile = materials;
    this.loadObj = this.loadObj.bind(this);
    this.loadObjCallback = this.loadObjCallback.bind(this);
    this.loadMtl = this.loadMtl.bind(this);
    this.loadMTLCallback = this.loadMTLCallback.bind(this);
    this.handleOptionsCallback = this.handleOptionsCallback.bind(this);
    this.convertWithMaterials = this.convertWithMaterials.bind(this);
    this.convertNoMaterials = this.convertNoMaterials.bind(this);
    this.setUpMaterials = this.setUpMaterials.bind(this);
    this.rectifyDataURLs = this.rectifyDataURLs.bind(this);
    this.loadedMaps = {};
  }

  loadObj(material: THREE.MeshStandardMaterial) {
    return new Promise((resolve, reject) => {
      try {
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
            }).catch(error => reject(error));
          } else {
            resolve(new THREE.Mesh());
          }
        }
      } catch(error) {
        reject(error);
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
      let mapKey = Object.keys(this.loadedMaps).find((key) => {
        const _map = this.loadedMaps[key];
        return _map.image.uuid === image.uuid
      });
      const map = this.loadedMaps[mapKey];
      if (map !== undefined) {
        image.url = map.image.currentSrc;
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
          this.loadedMaps[map.type] = tex;
        });
        tasks.push(task);
      }
    });
    return Promise.all(tasks);
  }

  loadMtl() {
    return new Promise((resolve, reject) => {
      try {
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
              if (!lodash.isEmpty(this.mapFiles)) {
                this.readMaps(this.mapFiles).then(maps => {
                  this.maps = maps;
                  this.rectifyTextureURL(this.materials, this.maps);
                  resolve(this.materials);
                });
              } else {
                resolve(this.materials);
              }
            }).catch(error => reject(error));
          } else {
            resolve(new THREE.MeshStandardMaterial());
          }
        }
      } catch(error) {
        console.log(error);
        reject(error);
      }
    });
  }

  loadMTLCallback(material) {
    this.emitProgress('Reading Geometry Data', 50);
    return this.loadObj(material);
  }

  loadObjCallback(mesh) {
    super.convert();
    this.emitProgress('Applying Post-Processing Options', 75)
    return this.handleOptions();
  }

  handleOptionsCallback(mesh) {
    const exported = mesh.toJSON();
    if (!this.options.compress && this.maps !== undefined) {
      this.rectifyDataURLs(exported);
    }
    this.emitDone(exported);
  }

  convertWithMaterials() {
    return this.loadMtl()
      .then(this.loadMTLCallback)
      .then(this.loadObjCallback)
      .then(this.handleOptionsCallback)
      .then((exported) => Promise.resolve(exported))
      .catch((error) => this.handleError(error));
  }

  convertNoMaterials() {
    return this.loadObj()
      .then(this.loadObjCallback)
      .then(this.handleOptionsCallback)
      .then((exported) => Promise.resolve(exported))
      .catch((error) => this.handleError(error));
  }

  convert(): Promise {
    this.emitProgress('Reading Material Data', 25);
    if (this.mtlFile !== null) {
      return this.convertWithMaterials();
    }
    return this.convertNoMaterials();
  }
}
