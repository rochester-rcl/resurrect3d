/* @flow */

// Three
import * as THREE from 'three';

// Abstract Base Class
class ImageGenerator {

  constructor(width: number, height: number, outerColor: string, innerColor: string) {

    this.width = width;
    this.height = height;
    this.color1 = outerColor;
    this.color2 = innerColor;

  }

  toBase64(): string {

    return this.element.toDataURL();

  }

  toTexture(): typeof THREE.Texture {

    return new THREE.TextureLoader().load(this.toBase64());

  }

}

export class RadialGradient extends ImageGenerator {

  constructor(width: number, height: number, outerColor: string, innerColor: string) {

    super(width, height, outerColor, innerColor);
    this.element = this.createGradient();

  }

  createGradient(): HTMLCanvasElement {

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

}

export class LabelSprite extends ImageGenerator {

  constructor(width: number, height: number, color: string, text: string) {

    super(width, height, color, color);
    this.text = text;
    this.element = this.createLabel();

  }

  createLabel() {

    let imgCanvas = document.createElement('canvas');
    imgCanvas.width = this.width;
    imgCanvas.height = this.height;
    let ctx = imgCanvas.getContext('2d');
    ctx.font = "18px Lato";
    ctx.textAlign = "center";
    ctx.fillStyle = this.color1;
    ctx.fillText(this.text, imgCanvas.width / 2, imgCanvas.height / 2);

    return imgCanvas;

  }

  toSprite(): typeof THREE.Sprite {

    let spriteMap = new THREE.TextureLoader().load(this.toBase64());;
    let spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
    return new THREE.Sprite(spriteMaterial);

  }

}
