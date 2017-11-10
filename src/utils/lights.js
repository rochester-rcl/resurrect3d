import * as THREE from 'three';

// utils
import { labelSprite } from './image';

export default class ThreePointLights {
  DEFAULT_OPTIONS = { color: 0xffffff, intensity: 1, distance: 0, angle: Math.PI/2, decay: 2, penumbra: 0 }
  constructor(options: Object) {
    let opts = options ? options : this.DEFAULT_OPTIONS;
    this.key = new THREE.SpotLight();
    this.back = new THREE.SpotLight(...opts);
    this.flood = new THREE.SpotLight(...opts);
    this._lights = [this.key, this.back, this.flood];
    this._helpers = this._initHelpers();
    //this.toggleHelpers()
    this._group = new THREE.Group();
    this._group.add(...this._lights);
    this._group.add(...this._helpers);
  }

  traverse(callback): void {
    for (let i = 0; i < this._lights.length; i++) {
      if (callback) callback(this._lights[i]);
    }
  }

  traverseHelpers(callback): void {
    for (let i = 0; i < this._lights.length; i++) {
      if (callback) callback(this._lights[i]);
    }
  }

  _initHelpers(): void {
    let helpers = [];
    helpers.push(new THREE.SpotLightHelper(this.key));
    helpers.push(new THREE.SpotLightHelper(this.back));
    helpers.push(new THREE.SpotLightHelper(this.flood));
    return helpers;
  }

  addTo(obj: THREE.Object3D): void {
    obj.add(...this._lights);
  }

  addHelpers(obj: THREE.Object3D, scaleFactor: Number): void {
    const labelHelpers = (helper) => {
      helper.scale.multiplyScalar((scaleFactor / 4000));
      console.log(scaleFactor / 10000);
    }
    this.traverseHelpers(labelHelpers);
    obj.add(...this._helpers);
  }

  toggleHelpers(): void {
    for (let i=0; i < this._helpers.length; i++) {
      let helper = this._helpers[i];
      helper.visible = !helper.visible;
    }
  }

  toggleVisibility(): void {
    const visible = (light) => {
      light.visible = !light.visible;
    }
    this.traverse(visible);
  }
  // moves everything
  setPosition(pos: THREE.Vector3): void {
    this._group.position.copy(pos);
  }
  // moves lights around Box3
  setLightPositions(pos: THREE.Box3): void {
    let max = pos.max.clone();
    let min = pos.min.clone();
    this.key.position.set(min.x, max.y, max.z);
    this.back.position.set(max.x / 2, max.y, min.z);
    this.flood.position.set(max.x, max.y, max.z);
  }

  setTarget(target: Object3D): void {
    const addTarget = (light) => {
      light.target = target;
    }
    this.traverse(addTarget);
  }

  positions(): Object {
    return {
      key: this.key.position,
      back: this.back.position,
      flood: this.flood.position,
    }
  }

}
