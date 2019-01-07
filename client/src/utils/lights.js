import * as THREE from 'three';

// utils
import { labelSprite } from './image';

export default class ThreePointLights {
  DEFAULT_INTENSITY = 0.25;
  constructor() {
    this.key = new THREE.SpotLight(0xffffff, this.DEFAULT_INTENSITY, 0, Math.PI/2, 1.0, 2.0);
    this.back = new THREE.SpotLight(0xffffff, this.DEFAULT_INTENSITY, 0, Math.PI/2, 1.0, 2.0);
    this.flood = new THREE.PointLight(0xffffff, this.DEFAULT_INTENSITY, 0, 2);
    this._lights = [this.key, this.back, this.flood];
    this._helpers = this._initHelpers();
    this.key.castShadow = true;
    this.back.castShadow = true;
    this.toggleHelpers();
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
    helpers.push(new THREE.PointLightHelper(this.flood));
    helpers.push(new THREE.CameraHelper(this.key.shadow.camera));
    helpers.push(new THREE.CameraHelper(this.back.shadow.camera));
    return helpers;
  }

  addTo(obj: THREE.Object3D): void {
    obj.add(...this._lights);
  }

  addHelpers(obj: THREE.Object3D, scaleFactor: Number): void {
    const labelHelpers = (helper) => {
      helper.scale.multiplyScalar((scaleFactor));
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
    const max = pos.max.clone();
    const min = pos.min.clone();
    this.key.position.set(max.x, max.y / 2, min.z);
    this.key.position.multiplyScalar(100);
    this.back.position.set(min.x / 2, max.y / 2, max.z / 2);
    this.back.position.multiplyScalar(100);
    this.flood.position.set(max.x, max.y / 2, max.z);
    this.flood.position.multiplyScalar(100);
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
