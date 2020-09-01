/* @flow */
import * as THREE from "three";
import ThreeVRMLConverter from "./ThreeVRMLConverter";
import createConverterProgressChannel from './createConverterProgressChannel';
import ConverterProgress from './ConverterProgress';
import { put, take } from 'redux-saga/effects';

export default function convertVRMLToThree(threeData: Object): Promise {
  return new Promise((resolve, reject) => {
    const { mesh, maps, options } = threeData;
    const converter = new ThreeVRMLConverter(mesh, maps, options);
    converter
      .init()
      .then((_converter) => _converter.convert())
      .then((threeObj) => {
        resolve({ threeFile: threeObj })
      })
      .catch((error) => console.warn(error));
  });
}

export function* convertVRMLToThreeWithProgress(threeData: Object): Generator<any, any, any> {
  const { mesh, maps, options } = threeData;
  const progress = new ConverterProgress();
  const converterChannel = createConverterProgressChannel(progress);
  const converter = new ThreeVRMLConverter(mesh, maps, options, progress);
  converter.init().then(_converter => _converter.convert()).catch((error) => console.warn(error));
  while(true) {
    const payload = yield take(converterChannel);
    if (payload.type === progress.EVENT_TYPES.DONE) {
      return payload.file;
    } else {
      yield put(payload);
    }
  }
}
