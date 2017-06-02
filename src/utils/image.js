/* @flow */

// Three
import * as THREE from 'three';

export class RadialGradient {

  constructor(width: number, height: number, outerColor: string, innerColor: string) {

    this.width = width;
    this.height = height;
    this.color1 = outerColor;
    this.color2 = innerColor;
    this.element = this.createGradient();

  }

  createGradient() {

    let imgCanvas = document.createElement('canvas');
    imgCanvas.width = this.width;
    imgCanvas.height = this.height;
    let ctx = imgCanvas.getContext('2d');
    let halfWidth = this.width / 2;
    let halfHeight = this.height / 2;

    let gradient = ctx.createRadialGradient(halfWidth, halfHeight, halfWidth, halfWidth, halfHeight, 0);
    gradient.addColorStop(0, this.color1);
    gradient.addColorStop(1, this.color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0, this.width, this.height);

    return imgCanvas;

  }

  toBase64() {

    return this.element.toDataURL();

  }

  toTexture() {

    let textureLoader = new THREE.TextureLoader();
    let texture = textureLoader.load(this.toBase64());
    return texture;

  }

}
