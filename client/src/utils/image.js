/* @flow */

// Three
import * as THREE from 'three';

// constants
import { SIMPLEX_2D } from '../constants/application';

// noise function
import { loadNoiseFunc } from './noise';

// Abstract Base Class
class ImageGenerator {

  width: number;
  height: number;
  color1: string;
  color2: string;
  element: HTMLCanvasElement;

  constructor(width: number, height: number, outerColor: string, innerColor: string) {

    this.width = width;
    this.height = height;
    this.color1 = outerColor;
    this.color2 = innerColor;

  }

  toBase64(): string {

    return this.element.toDataURL();

  }

  toTexture(): THREE.Texture {

    /* For whatever reason the THREE.Texture constructor is not working with
       a canvas object. */
    return new THREE.TextureLoader().load(this.toBase64());

  }

}

export class LinearGradientShader {
  topColor: string;
  bottomColor: string;
  uniforms: Object;
  fragmentShader: string = [
    'uniform vec3 topColor;',
    'uniform vec3 bottomColor;',
    'uniform vec2 resolution;',
    loadNoiseFunc(SIMPLEX_2D),
    'void main() {',
      'vec2 pixel = gl_FragCoord.xy / resolution.xy;',
      'float distance = distance(vec2(pixel.x, pixel.y), vec2(0.5));',
      'float noise = snoise(512.0 * pixel);',
      'vec3 color = mix(topColor, bottomColor, distance);',
      'color = mix(color, vec3(noise), 0.0175);',
      'gl_FragColor = vec4(color, 1.0);',
    '}'
  ].join('\n');

  constructor(topColor: string, bottomColor: string, width: number, height: number) {
    this.innerColor = topColor;
    this.outerColor = bottomColor;
    this.uniforms = {
      topColor: { type: 'c', value: new THREE.Color(topColor) },
      bottomColor: { type: 'c', value: new THREE.Color(bottomColor) },
      resolution: { value: new THREE.Vector2(width, height) }
    };
    this.shaderMaterial = this.generateShaderMaterial();
  }

  updateUniforms(uniformName: string, value: Number | THREE.Vector2): void {
    this.uniforms[uniformName].value = value;
  }

  generateShaderMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      fragmentShader: this.fragmentShader,
      dithering: true,
      side: THREE.DoubleSide
    });
  };
}

export class RadialGradientCanvas extends ImageGenerator {

  constructor(width: number, height: number, outerColor: string, innerColor: string) {

    super(width, height, outerColor, innerColor);
    this.element = this.createGradient();

  }

  createGradient(): HTMLCanvasElement {

    let imgCanvas = document.createElement('canvas');
    imgCanvas.width = this.width;
    imgCanvas.height = this.height;
    let ctx = imgCanvas.getContext('2d');
    if (ctx) {
      let halfWidth = this.width / 2;
      let halfHeight = this.height / 2;

      let gradient = ctx.createRadialGradient(halfWidth, halfHeight, halfWidth, halfWidth, halfHeight, 0);
      gradient.addColorStop(0, this.color1);
      gradient.addColorStop(1, this.color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0,0, this.width, this.height);
    } else {
      console.warn('getContext did not return an instance of CanvasRenderingContext2D');
    }
    return imgCanvas;
  }

  toTexture(): THREE.Texture {

    /* For whatever reason the THREE.Texture constructor is not working with
       a canvas object. */
    let texture = new THREE.TextureLoader().load(this.toBase64());
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0,0);
    texture.repeat.set(2,2);
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearMipMapLinearFilter;
    return texture;

  }

}

export class LabelSprite extends ImageGenerator {

  text: string;

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
    if (ctx) {
      ctx.font = "bold 24px Courier";
      ctx.textAlign = "center";
      ctx.fillStyle = this.color1;
      ctx.fillText(this.text, imgCanvas.width / 2, imgCanvas.height / 2);
    } else {
      console.warn('getContext did not return an instance of CanvasRenderingContext2D');
    }


    return imgCanvas;

  }

  toSprite(): typeof THREE.Sprite {

    /* For whatever reason the THREE.Texture constructor is not working with
       a canvas object. */
    let spriteMap = new THREE.TextureLoader().load(this.toBase64());
    let spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, depthWrite: false, depthTest: false, transparent: true, alphaTest: 0.5 });
    return new THREE.Sprite(spriteMaterial);

  }

}

// https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
export function base64ImageToBlob(b64String: string, chunkSize: number): Object {
  let data = b64String.split(',')
  let contentType = data[0].split(';base64')[0].slice(5);
  let ext = '.' + contentType.split('/')[1];
  chunkSize = (chunkSize !== undefined) ? chunkSize : 512;
  let chars = atob(data.slice(1).join(''));
  let bytes = [];
  for (let offset = 0; offset < chars.length; offset += chunkSize) {
    let chunk = chars.slice(offset, offset + chunkSize);
    let charCodes = new Uint8Array(chunk.length);
    for (let i = 0; i < charCodes.length; i++) {
      charCodes[i] = chunk.charCodeAt(i);
    }
    bytes.push(charCodes);
  }
  return { rawData: new Blob(bytes, {type: contentType}), ext: ext };
}

// normal map from texture
