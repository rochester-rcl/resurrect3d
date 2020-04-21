/* @flow */

import initMTLLoader from './MTLLoader';
import initOBJLoader from './OBJLoader';
import initVRMLLoader from './VRMLLoader';

export default function initLoaders(threeInstance: Object): Promise {
  const tasks = [
    initOBJLoader(threeInstance),
    initMTLLoader(threeInstance),
    initVRMLLoader(threeInstance),
  ];
  return Promise.all(tasks);
}
