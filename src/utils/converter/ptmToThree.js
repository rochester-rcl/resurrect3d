/* @flow */
import * as THREE from "three";
import ThreePtmConverter from "./ThreePtmConverter";

export default function convertPtmToThree(threeData: Object): Promise {
  return new Promise((resolve, reject) => {
    const { ptm, options } = threeData;
    const converter = new ThreePtmConverter(ptm, options);
    converter
      .init()
      .then(_converter => _converter.convert())
      .then(threeObj => {
        console.log(threeObj);
        resolve({ threeFile: threeObj })
      });
  });
}
