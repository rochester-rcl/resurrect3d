/* @flow */

import initMTLLoader from './MTLLoader';
import initOBJLoader from './OBJLoader';

export default function initLoaders(threeInstance: Object): Promise {
  const tasks = [
    initOBJLoader(threeInstance),
    initMTLLoader(threeInstance)
  ];
  return Promise.all(tasks);
}
