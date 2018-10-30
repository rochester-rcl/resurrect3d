/* @flow */
import * as THREE from "three";
import ThreeObjConverter from "./ThreeObjConverter";
import createConverterProgressChannel from './createConverterProgressChannel';
import ConverterProgress from './ConverterProgress';
import { put, take } from 'redux-saga/effects';

export default function convertObjToThree(threeData: Object): Promise {
  return new Promise((resolve, reject) => {
    const { mesh, material, maps, options } = threeData;
    const converter = new ThreeObjConverter(mesh, material, maps, options);
    converter
      .init()
      .then((_converter) => _converter.convert())
      .then((threeObj) => {
        resolve({ threeFile: threeObj })
      })
      .catch((error) => console.warn(error));
  });
}

export function* convertObjToThreeWithProgress(threeData: Object): Generator<any, any, any> {
  const { mesh, material, maps, options } = threeData;
  const progress = new ConverterProgress();
  const converterChannel = createConverterProgressChannel(progress);
  const converter = new ThreeObjConverter(mesh, material, maps, options, progress);
  converter.init().then(_converter => _converter.convert()).catch((error) => console.warn(error));
  while(true) {
    const payload = yield take(converterChannel);
    if (payload.type === progress.EVENT_TYPES.DONE) {
      return { threeFile: payload.file }
    } else {
      yield put(payload);
    }
  }
}
