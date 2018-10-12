/* @flow */
import * as THREE from "three";
import ThreeObjConverter from "./ThreeObjConverter";
export default function convertObjToThree(threeData: Object): Promise {
  return new Promise((resolve, reject) => {
    const { mesh, material, maps, options } = threeData;
    const converter = new ThreeObjConverter(mesh, material, maps, options);
    converter
      .init()
      .then(_converter => _converter.convert())
      .then(threeObj => {
        resolve({ threeFile: threeObj })
      });
  });
}
