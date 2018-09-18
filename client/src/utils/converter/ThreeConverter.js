/* @flow */
import * as _THREE from 'three';

// LOADERS
import initLoaders from '../loaders/InitLoaders';

// Constants
import {THREE_MESH, THREE_GROUP, THREE_DIFFUSE_MAP} from '../../constants/application';

// Pako
import pako from 'pako';

// super obnoxious pattern.
const THREE = _THREE;

class ThreeConverter {
  constructor(mesh: File, maps: Object, options: Object) {
    this.meshFile = mesh;
    this.mapFiles = maps;
    this.options = options;
    this.loadersInitialized = false;
  }

  init(): Promise {
    return new Promise((resolve, reject) => {
      initLoaders(THREE).then(() => {
        this.loadersInitialized = true;
        resolve(this);
      });
    });
  }

  readMaps() {
    const toFetch = [];
    for (let key in this.mapFiles) {
      let val = this.mapFiles[key];
      toFetch.push(this.readMap(key, val));
    }
    return Promise.all(toFetch);
  }

  readMap(type: string, map: File): Promise {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const { result } = reader;
        resolve({ type: type, dataURL: result });
      }
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(map);
    });
  }
  // can be used for MTL, OBJ, any ASCII file , doesn't have to be geometry data
  readASCII(dataFile: File) {
    // has to be ASCII for now, can add readMeshBinary
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const { result } = reader;
        resolve(result);
      }
      reader.onerror = (error) => reject(error);
      reader.readAsText(dataFile);
    })
  }

  readMeshBinary() {
    // TODO not sure which binary formats we'll actually support. STL? FBX?
  }

  convert() {
    // needs implementation in derived classes
  }

  export() {
    return this.mesh.toJSON();
  }

}

export default class ThreeObjConverter extends ThreeConverter {
  constructor(mesh: File, materials: File, maps: Object, options: Object) {
    super(mesh, maps, options);
    this.mtlFile = materials;
    this.loadObj = this.loadObj.bind(this);
    this.loadMtl = this.loadMtl.bind(this);
    this.setUpMaterials = this.setUpMaterials.bind(this);
  }

  loadObj(material: THREE.MeshStandardMaterial) {
    return new Promise((resolve, reject) => {
      if (this.loadersInitialized === false) {
        reject('ThreeConverter.init must be called before you can convert this mesh.');
      } else {
        if (this.meshFile !== null) {
          this.readASCII(this.meshFile).then((meshData) => {
            const objLoader = new THREE.OBJLoader();
            objLoader.setPath('');
            if (material !== undefined) objLoader.setMaterials(material);
            this.mesh = objLoader.parse(meshData);
            this.setUpMaterials();
            resolve(this.mesh);
          })
        } else {
          resolve(new THREE.Mesh());
        }
      }
    });
  }

  rectifyTextureURL(_materials: THREE.MTLLoader.MaterialCreator, maps: Array<Object>) {
    const diffuse = maps.find((map) => map.type === THREE_DIFFUSE_MAP);
    for (let key in _materials.materialsInfo) {
      let val = _materials.materialsInfo[key];
      if (val.map_kd !== undefined) {
        if (diffuse) {
          val.map_kd = diffuse.dataURL;
        }
      }
    }
  }

  // TODO so far only working with ONE MAP - will have to think about how to do it otherwise, UUIDs will work
  setUpMaterials(): Object {
    let children;
    if (this.mesh.constructor.name === THREE_MESH) {
      children = [this.mesh];
    } else {
      children = this.mesh.children;
    }
    children.forEach((child) => {
      child.material = Object.assign(new THREE.MeshStandardMaterial(), child.material);
      for (let key in this.maps) {
        let map = this.maps[key];
        // because diffuse is handled in the loader via map_kd
        if (map.type !== THREE_DIFFUSE_MAP) {
          child.material[map.type] = new THREE.TextureLoader().load(map.dataURL);
        }
      }
    });
  }

  loadMtl() {
    return new Promise((resolve, reject) => {
      if (this.loadersInitialized === false) {
        reject('ThreeConverter.init must be called before you can convert this material.');
      } else {
        if (this.mtlFile !== null) {
          this.readASCII(this.mtlFile).then((mtlData) => {
            const mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath('');
            this.materials = mtlLoader.parse(mtlData);
            this.readMaps(this.mapFiles).then((maps) => {
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
    // do mesh first
    return this.loadMtl().then(this.loadObj);
  }
}
