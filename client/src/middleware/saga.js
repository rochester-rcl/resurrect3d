/* @flow */
// Redux Saga
import {
  put,
  takeEvery,
  take,
  call
} from 'redux-saga/effects';

import {
  eventChannel,
  END
} from 'redux-saga';

import React from 'react';

// Action Constants
import * as ActionConstants from '../constants/actions';

// THREE
import * as THREE from 'three';

// API
import endpoint from '../constants/api-endpoints';

import ThreeViewerNodeBackend from './backends/ThreeViewerNodeBackend';
import ThreeViewerAdminBackend from './backends/ThreeViewerAdminBackend';

const nodeBackend = new ThreeViewerNodeBackend();

const adminBackend = new ThreeViewerAdminBackend();

function computeProgress(request: ProgressEvent): string {
  return parseFloat(request.loaded / 1000000).toFixed(2) + ' MB';
}

function* getThreeAssetSaga(getThreeAssetAction: Object): Generator < any, any, any > {
  try {
    let apiURL = getThreeAssetAction.url + nodeBackend.endpoint + '/' + getThreeAssetAction.id;
    console.log(apiURL);
    let asset = yield nodeBackend.getThreeAsset(apiURL, { method: 'GET', credentials: 'same-origin' });
    console.log(asset);
    yield put({ type: ActionConstants.THREE_ASSET_LOADED, threeAsset: asset });
  } catch (error) {
    console.log(error);
  }
}

function getActionType(payload: Object): string {
  switch (payload.eventType) {
    case 'progress':
      if (payload.loaderType === 'texture') return ActionConstants.UPDATE_TEXTURE_LOAD_PROGRESS;
      return ActionConstants.UPDATE_MESH_LOAD_PROGRESS;

    case 'loaded':
      if (payload.loaderType === 'texture') return ActionConstants.TEXTURE_LOADED;
      return ActionConstants.MESH_LOADED;

    default:
      if (payload.loaderType === 'texture') return ActionConstants.TEXTURE_LOAD_ERROR;
      return ActionConstants.MESH_LOAD_ERROR;
  }
}

// TODO how to handle type checking for polymorphic function that could take an ObjectLoader or TextLoader class
function createLoadProgressChannel(loader: Object, loaderType: string, url): void {

  return eventChannel((emit) => {

    loader.load(url,
      (payload: Object) => {
        // We're going to use this as a skybox texture so ...
        payload.mapping = THREE.EquirectangularReflectionMapping;
        payload.magFilter = THREE.LinearFilter;
        payload.minFilter = THREE.LinearMipMapLinearFilter;
        emit({
          eventType: 'loaded',
          val: payload,
          loaderType: loaderType
        });
        emit(END);
      },
      (progress: ProgressEvent) => {
        let update = computeProgress(progress);
        emit({
          eventType: 'progress',
          val: update,
          loaderType: loaderType
        });
      },
      (error: Error) => {
        emit({
          eventType: 'error',
          val: error,
          loaderType: loaderType
        });
      })

    const unsubscribe = () => {
      loader.onLoad = null;
    }
    return unsubscribe;

  });

}

export function* loadMeshSaga(loadMeshAction: Object): Generator < any, any, any > {

  // load the mesh
  try {
    let url;
    let ext = loadMeshAction.url.split('.').pop();
    if (ext === 'gz' || ext === 'gzip') {
      yield put({ type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS, payload: { val: "Fetching" } });
      let dataURL = yield ThreeViewerNodeBackend.loadGZippedAsset(loadMeshAction.url);
      yield put({ type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS, payload: { val: "Decompressing" } });
      url = dataURL;
    } else {
      url = loadMeshAction.url;
    }
    const meshLoader = new THREE.ObjectLoader();
    const meshLoaderChannel = yield call(createLoadProgressChannel, meshLoader, 'mesh', url);
    while (true) {
      const payload = yield take(meshLoaderChannel);
      yield put({
        type: getActionType(payload),
        payload
      });
    }
  } catch (error) {
    console.log(error);
  }

}

export function* loadTextureSaga(loadTextureAction: Object): Generator < any, any, any > {

  // load the texture
  try {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    const textureLoaderChannel = yield call(createLoadProgressChannel, textureLoader, 'texture', loadTextureAction.url);
    while (true) {
      const payload = yield take(textureLoaderChannel)
      yield put({
        type: getActionType(payload),
        payload
      });
    }
  } catch (error) {
    console.log(error);
  }
}

/***************** ADMIN ADDITIONS ********************************************/

export function* addThreeViewSaga(addThreeViewAction: Object): Generator<any, any, any> {
  try {
    const result = yield adminBackend.addView(addThreeViewAction.viewData);
  } catch(error) {
    console.log(error);
  }
}

export function* getThreeViewsSaga(getThreeViewsAction: Object): Generator<any, any, any> {
  try {
    const results = yield adminBackend.getViews();
    console.log(results);
    yield put({
      type: ActionConstants.VIEWS_LOADED,
      views: results,
    });
  } catch(error) {
    console.log(error);
  }
}

export function* getThreeViewSaga(getThreeViewAction: Object): Generator<any, any, any> {
  try {
    const result = yield adminBackend.getView(getThreeViewAction.id);
    yield put({
      type: ActionConstants.VIEW_LOADED,
      view: result
    });
  } catch(error) {
    console.log(error);
  }
}

/*************************** Observers ****************************************/
export function* watchForGetThreeAsset(): Generator < any, any, any > {
  yield takeEvery(ActionConstants.GET_THREE_ASSET, getThreeAssetSaga);
}

export function* watchForLoadMesh(): Generator < any, any, any > {
  yield takeEvery(ActionConstants.LOAD_MESH, loadMeshSaga);
}

export function* watchForLoadTexture(): Generator < any, any, any > {
  yield takeEvery(ActionConstants.LOAD_TEXTURE, loadTextureSaga);
}

export function* watchForAddThreeView(): Generator <any, any, any> {
  yield takeEvery(ActionConstants.ADD_VIEW, addThreeViewSaga);
}

export function* watchForGetThreeViews(): Generator <any, any, any> {
  yield takeEvery(ActionConstants.GET_VIEWS, getThreeViewsSaga);
}

export function* watchForGetThreeView(): Generator <any, any, any> {
  yield takeEvery(ActionConstants.GET_VIEW, getThreeViewSaga);
}

export default function* rootSaga(): Generator < any, any, any > {
  yield [
    watchForGetThreeAsset(),
    watchForLoadMesh(),
    watchForLoadTexture(),
    watchForAddThreeView(),
    watchForGetThreeViews(),
    watchForGetThreeView(),
  ];
}
