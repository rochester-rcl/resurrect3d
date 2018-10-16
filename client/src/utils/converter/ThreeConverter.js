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

// TODO all available options should live in a const
// TODO should move whatever processing we can to a worker
export default class ThreeConverter {
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
      this.textureLoader = new THREE.TextureLoader();
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

  readBinary(dataFile: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const { result } = reader;
        resolve(result);
      }
      reader.onerror = error => reject(error);
      reader.readAsArrayBuffer(dataFile);
    });
  }

  loadTexture(url: string, onLoad, onErr): Promise {
    return new Promise((resolve, reject) =>{
      const tex = this.textureLoader;
      const _onLoad = (_tex) => {
        if (onLoad !== undefined) onLoad(_tex);
        resolve(_tex);
      }
      const _onErr = (err) => {
        if (onErr !== undefined) onErr(err);
        reject(err);
      }
      tex.load(url, _onLoad, undefined, _onErr);
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

  convert() {
    // needs implementation in derived classes
    this.converted = true;
  }

  export() {
    return this.mesh.toJSON();
  }
}