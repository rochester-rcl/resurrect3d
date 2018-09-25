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

// super obnoxious pattern.
const THREE = _THREE;
// TODO have this emit progress events !!!!!!!!!!!!!!!

// Move these functions to a new file

// returns reference to mesh children


// TODO all available options should live in a const
class ThreeConverter {
  OPTIONS_MAP = {
    center: centerGeometry,
    createNormalMap: createNormalMap,
  };
  constructor(mesh: File, maps: Object, options: Object) {
    this.meshFile = mesh;
    this.mapFiles = maps;
    this.options = options;
    this.loadersInitialized = false;
    this.converted = false;
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
      };
      reader.onerror = error => reject(error);
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
      };
      reader.onerror = error => reject(error);
      reader.readAsText(dataFile);
    });
  }

  handleOptions(): Promise {
    return new Promise((resolve, reject) => {
      if (this.converted === false) {
        reject(
          "this.convert method needs to be called before handling any options"
        );
      }
      const tasks = [];
      for (let key in this.options) {
        let option = this.options[key];
        if (option === true) {
          if (this.OPTIONS_MAP[key] !== undefined) {
            tasks.push(this.OPTIONS_MAP[key](this.mesh));
          }
        }
      }
      if (tasks.length > 0) {
        Promise.all(tasks).then(results => resolve(results.pop()));
      } else {
        resolve(this.mesh);
      }
    });
  }

  readMeshBinary() {
    // TODO not sure which binary formats we'll actually support. STL? FBX?
  }

  convert() {
    // needs implementation in derived classes
    this.converted = true;
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
        console.log(_map.uuid, image.uuid);
        return _map.uuid === image.uuid
      });
      if (map !== undefined) {
        image.url = map.dataURL;
      }
    });
  }

  loadTexture(url: string, onLoad, onErr): Promise {
    return new Promise((resolve, reject) =>{
      const tex = new THREE.TextureLoader();
      const _onLoad = (_tex) => {
        onLoad(_tex);
        resolve(_tex);
      }
      const _onErr = (err) => {
        onErr(err);
        reject(err);
      }
      tex.load(url, _onLoad, undefined, _onErr);
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
