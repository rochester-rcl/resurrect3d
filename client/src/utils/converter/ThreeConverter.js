/* @flow */
import * as THREE from 'three';
import OBJLoader from 'three-obj-loader';
import MTLLoader from 'three-mtl-loader';

class ThreeConverter {
  constructor(mesh: File, maps: Object, options: Object) {
    this.meshFile = mesh;
    this.maps = maps;
    this.options = options;
  }

  readMaps() {
    const toFetch = [];
    for (let key in this.maps) {
      let val = this.maps[key];
      if (val.file !== undefined) {
        toFetch.push(this.readMap(key, val.file));
      }
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
      reader.readAsDataURL(new Blob([map]));
    });
  }
  // can be used for MTL, OBJ, any ASCII file , doesn't have to be geometry data
  readASCII() {
    // has to be ASCII for now, can add readMeshBinary
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const { result } = reader;
        resolve(result);
      }
      reader.onerror = (error) => reject(error);
      reader.readAsText(new Blob([this.meshFile]));
    })
  }

  readMeshBinary() {
    // TODO not sure which binary formats we'll actually support. STL? FBX?
  }

  convert() {
    // needs implementation in derived classes
  }

}

export default class ThreeObjConverter extends ThreeConverter {
  constructor(mesh: File, materials: File, maps: Object, options: Object) {
    super(mesh, maps, options);
    this.mtlFile = materials;
  }

  loadObj(meshData: string) {
    const objLoader = new OBJLoader();
    this.mesh = objLoader.parse(meshData);
  }

  loadMTL(mtlData: string) {
    const mtlLoader = new MTLLoader();
    this.materials = mtlLoader.parse(mtlData);
    console.log(this.materials);
  }

  convert(): void {
    // do mesh first
    this.readASCII(this.meshFile).then((meshData) => {
      this.loadObj(meshData);
      this.readASCII(this.mtlFile).then((mtlData) => {
        this.loadMTL(mtlData);
        this.readMaps().then((maps) => console.log(maps));
      });
    })
  }
}
