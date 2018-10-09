/* @flow */
import * as _THREE from "three";


// ptm reader
import readPtm from "./ptm";

// Abstract Base Class
import ThreeConverter from './ThreeConverter';

const THREE = _THREE;

export default class ThreePtmConverter extends ThreeConverter {
  OPTIONS_MAP = {
    createMesh: () => console.log('hi'),
    compress: () => console.log('bye'),
  }
  constructor(ptm: File, options: Object) {
    super(undefined, undefined, options);
    this.ptmFile = ptm;
  }

  loadPtm(): Promise {
    return new Promise((resolve, reject) => {
      this.readBinary(this.ptmFile)
        .then((ptmData) => {
          readPtm(ptmData).then(ptm => resolve(ptm))
        })
        .catch(error => reject(error));
    });
  }
  // ptm data needs both diffuse and normalMap properties
  createMesh(ptmData: Object): Promise {
    return new Promise((resolve, reject) => {
      const { normalMap, diffuse } = ptmData;
      if (normalMap === undefined || diffuse === undefined) reject('Normal Map and / or Diffuse Map were not properly read from the ptm file');
      this.normalMapURL = normalMap;
      this.diffuseURL = diffuse;
      this.material = new THREE.MeshStandardMaterial({ transparent: true, alphaTest: 0.5 });
      const textureTasks = [];
      textureTasks.push(this.loadTexture(diffuse).then((tex) => {
        this.material.map = tex;
        this.diffuse = tex;
      }));
      textureTasks.push(this.loadTexture(normalMap).then((tex) => {
        this.material.normalMap = tex;
        this.normalMap = tex;
      }));
      Promise.all(textureTasks).then(() => {
        this.mesh = this.makePlane();
        resolve(this.mesh);
      });
    });
  }

  makePlane(): THREE.Mesh {
    // use defaults for now
    const plane = new THREE.PlaneGeometry(1, 1, 1);
    return new THREE.Mesh(plane, this.material);
  }
  // TODO need to break options into pre and post export options but this works for now
  convert() {
    return new Promise((resolve, reject) => {
      this.loadPtm().then((ptm) => this.createMesh(ptm).then((mesh) => {
        super.convert();
        const exported = mesh.toJSON();
        if (!this.options.compress) {
          // need to put this in as an option but let's see if it works first
          exported.images = exported.images.map((image) => {
            if (image.uuid === this.normalMap.image.uuid) image.url = this.normalMapURL;
            if (image.uuid === this.diffuse.image.uuid) image.url = this.diffuseURL;
            return image
          });
        }
        resolve(exported);
      }));
    });
  }
}
