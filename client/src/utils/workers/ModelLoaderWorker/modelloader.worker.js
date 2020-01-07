import 'babel-polyfill';

import * as THREE from 'three';

const computeProgress = (request) => {  //: ProgressEvent
  return parseFloat(request.loaded / 1000000).toFixed(2) + ' MB';
}

const handlePayload = (payload) => {
  // We're going to use this as a skybox texture so ...
  payload.mapping = THREE.EquirectangularReflectionMapping;
  payload.magFilter = THREE.LinearFilter;
  payload.minFilter = THREE.LinearMipMapLinearFilter;
  postMessage({
    status: true,
    modelLoader: {
      eventType: 'loaded',
      val: payload,
      loaderType: self.loaderType  // eslint-disable-line no-restricted-globals
    }
  });
}

const handleUpdate = (progress) => {  //: ProgressEvent
  const update = computeProgress(progress);
  postMessage({
    status: true,
    modelLoader: {
      eventType: 'progress',
      val: update,
      loaderType: self.loaderType  // eslint-disable-line no-restricted-globals
    }
  });
}

const handleError = (error) => {
  postMessage({
    status: false,
    modelLoader: {
      eventType: 'error',
      val: error,
      loaderType: self.loaderType  // eslint-disable-line no-restricted-globals
    }
  })
}

self.onmessage = (event) => {  // eslint-disable-line no-restricted-globals  //MessageEvent
  const { type, url } = event.data;
  if (type === undefined || url === undefined) postMessage({status: false, error: 'Invalid data passed to ModelLoaderWorker'});
  self.loaderType = type;  // eslint-disable-line no-restricted-globals
  const loader = new THREE.ObjectLoader();
  console.log(loader.parseGeometries);
  loader.load(url, handlePayload, handleUpdate, handleError);
}
