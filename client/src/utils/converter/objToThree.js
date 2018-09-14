/* @flow */
import * as THREE from 'three';
import ThreeObjConverter from './ThreeConverter';
export default function convertObjToThree(threeData: Object): Promise {
  return new Promise((resolve, reject) => {
    const { mesh, materials, maps, options } = threeData;
    const converter = new ThreeObjConverter(mesh, materials, maps, options);
    converter.convert().then((threeObj) => resolve({ threeFile: threeObj }));
  });
}
