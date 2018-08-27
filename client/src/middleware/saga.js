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
import {} from '../constants/api-endpoints';

// constants
import { WORKER_PROGRESS } from '../constants/application';

import ThreeViewerNodeBackend from './backends/ThreeViewerNodeBackend';
import ThreeViewerAdminBackend from './backends/ThreeViewerAdminBackend';

// workers
import ModelLoaderWorker from '../utils/workers/ModelLoaderWorker/modelloader.worker';

const nodeBackend = new ThreeViewerNodeBackend();

const adminBackend = new ThreeViewerAdminBackend();

const computeProgress = (request: ProgressEvent): string => {
  return parseFloat(request.loaded / 1000000).toFixed(2) + ' MB';
}

function* getThreeAssetSaga(getThreeAssetAction: Object): Generator < any, any, any > {
  try {
    const asset = yield nodeBackend.getThreeAsset(getThreeAssetAction.id);
    const threeFile = yield nodeBackend.getThreeFile(asset.threeFile);
    const ext = asset.threeFile.split('.').pop();
    yield put({ type: ActionConstants.LOAD_MESH, url: threeFile, ext: ext, id: asset._id });
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

function createWorkerProgressChannel(worker: Object, loaderType: string) {
  return eventChannel((emit) => {
    worker.onmessage = (event: MessageEvent) => {
      const { data } = event;
      if (data.type === WORKER_PROGRESS) {
        emit({
          eventType: 'progress',
          val: data.payload,
          loaderType: loaderType
        });
      } else {
        emit({
          eventType: 'loaded',
          val: data.payload,
          loaderType: loaderType,
        });
        emit(END);
      }
    }
    const unsubscribe = () => {
      worker.onmessage = null;
    }
    return unsubscribe;
  });
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

// In this version EVERYTHING NEEDS TO BE GZIPPED
export function* loadMeshSaga(loadMeshAction: Object): Generator <any, any, any> {
  try {
    const { url, id } = loadMeshAction;
    let progressChannel;
    const result = yield ThreeViewerNodeBackend.checkCache(loadMeshAction.id);
    if (result) {
      progressChannel = yield ThreeViewerNodeBackend.gunzipAssetSaga(result.data.model.raw, createWorkerProgressChannel);
    } else {
      yield put({ type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS, payload: { val: "Fetching Mesh From Server", percent: null }});
      progressChannel = yield ThreeViewerNodeBackend.fetchGZippedAssetSaga(id, url, createWorkerProgressChannel);
    }
    while (true) {
      const payload = yield take(progressChannel);
      if (payload.eventType === 'loaded') {
        yield put({ type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS, payload: { val: "Building Scene", percent: null }});
        /*
          This isn't too much of a bottleneck - it's unfortunate that ObjectLoader relies on <img> tags as we could off-load
          to a worker. I supposed we could parse geometry in a worker and do images on the main thread if we need to.
          
          Some day we can use https://caniuse.com/#feat=offscreencanvas
        */

        const loader = new THREE.ObjectLoader();
        const object3D = loader.parse(payload.val);
        yield put({ type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS, payload: { val: "Building Scene", percent: null }});
        yield put({ type: ActionConstants.MESH_LOADED, payload: { val: object3D }});
        progressChannel.close();
      } else {
        yield put({
          type: getActionType(payload),
          payload: { val: "Decompressing Mesh Data",
          percent: payload.val,
        }
        });
      }
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
    // TODO add this to "views"
  } catch(error) {
    console.log(error);
  }
}

export function* getThreeViewsSaga(getThreeViewsAction: Object): Generator<any, any, any> {
  try {
    const results = yield adminBackend.getViews();
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

export function* updateThreeViewSaga(updateThreeViewAction: Object): Generator<any, any, any> {
  try {
    console.log(updateThreeViewAction.viewData);
    const result = yield adminBackend.updateView(updateThreeViewAction.viewData);
  } catch(error) {
    console.log(error);
  }
}

export function* deleteThreeViewSaga(deleteThreeViewAction: Object): Generator<any, any, any> {
  try{
    const result = yield adminBackend.deleteView(deleteThreeViewAction.id);
    console.log(result);
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

export function* watchForUpdateThreeView(): Generator <any, any, any> {
  yield takeEvery(ActionConstants.UPDATE_VIEW, updateThreeViewSaga);
}

export function* watchForDeleteThreeView(): Generator <any, any, any> {
  yield takeEvery(ActionConstants.DELETE_VIEW, deleteThreeViewSaga);
}



export default function* rootSaga(): Generator < any, any, any > {
  yield [
    watchForGetThreeAsset(),
    watchForLoadMesh(),
    watchForLoadTexture(),
    watchForAddThreeView(),
    watchForGetThreeViews(),
    watchForGetThreeView(),
    watchForUpdateThreeView(),
    watchForDeleteThreeView(),
  ];
}
