/* @flow */
// Redux Saga
import { put, takeEvery, take, call, fork } from "redux-saga/effects";

import { eventChannel, END } from "redux-saga";

import React from "react";

// Action Constants
import * as ActionConstants from "../constants/actions";

// THREE
import * as THREE from "three";

// constants
import { WORKER_PROGRESS, GZIP_EXT } from "../constants/application";
import {
  USER_LOGGED_IN,
  LOGIN_ERROR,
  USER_AUTHENTICATED,
  AUTHENTICATE_ATTEMPTED,
  LOGOUT_USER,
  USER_LOGGED_OUT,
  USER_DELETED
} from "../constants/actions";

import threeViewerBackendFactory from "./backends/threeViewerBackendFactory";

import ThreeViewerAbstractBackend from "./backends/ThreeViewerAbstractBackend";

// workers
import ModelLoaderWorker from "../utils/workers/ModelLoaderWorker/modelloader.worker";
import DeflateWorker from "../utils/workers/deflate.worker";

// serialization
import { deserializeThreeTypes } from "../utils/serialization";

// Converter
import { convertObjToThreeWithProgress } from "../utils/converter/objToThree";
import convertPtmToThree from "../utils/converter/ptmToThree";

// other utils
import { getExtension } from "../utils/mesh";

// other sagas
import AnnotationSaga from "./AnnotationSaga";

const backend = threeViewerBackendFactory();

const genericAPIRouteMessage =
  "Attempting to access an API route that has not been registered in " +
  backend.constructor.name;

const computeProgress = (request: ProgressEvent): string => {
  return parseFloat(request.loaded / 1000000).toFixed(2) + " MB";
};

const sleep = (duration: Number): Promise => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), duration);
  });
};

function arrayToObject (array) {

  return array.reduce((obj, item) => {
     obj[item._id] = item
     return obj
   }, {});
}


function* getThreeAssetSaga(
  getThreeAssetAction: Object
): Generator<any, any, any> {
  try {
    const asset = yield backend.getThreeAsset(getThreeAssetAction.id);
    const { viewerSettings } = asset;
    if (viewerSettings !== undefined) {
      asset.viewerSettings = deserializeThreeTypes(viewerSettings);
    }
    const threeFile = yield backend.getThreeFileURL(asset.threeFile);
    const ext = getExtension(asset.threeFile);
    let id;
    if (backend.isOmekaBackend) {
      id = getThreeAssetAction.id;
      const metadata = yield backend.getMetadata(asset.itemUrl);
      if (metadata) {
        yield put({
          type: ActionConstants.THREE_METADATA_LOADED,
          metadata: metadata
        });
      }
    } else {
      // node backend
      id = asset._id;
    }
    yield put({
      type: ActionConstants.LOAD_MESH,
      payload: threeFile,
      ext: ext,
      fileId: asset.threeFile,
      id: id,
      embedded: getThreeAssetAction.embedded
    });
    yield put({ type: ActionConstants.THREE_ASSET_LOADED, threeAsset: asset });
  } catch (error) {
    // TODO add THREE_ASSET_ERROR
    console.log(error);
  }
}

function* saveSettingsSaga(
  saveSettingsAction: Object
): Generator<any, any, any> {
  try {
    const { id, settings } = saveSettingsAction;
    const result = yield backend.saveViewerSettings(id, settings);
    if (result.viewerSettings) {
      yield put({ type: ActionConstants.VIEWER_SETTINGS_SAVED });
      yield sleep(2000);
      yield put({ type: ActionConstants.RESET_SAVE_STATUS });
    }
  } catch (error) {
    console.log(error);
    yield put({ type: ActionConstants.VIEWER_SETTINGS_ERROR });
    yield sleep(2000);
    yield put({ type: ActionConstants.RESET_SAVE_STATUS });
  }
}

function getActionType(payload: Object): string {
  switch (payload.eventType) {
    case "progress":
      if (payload.loaderType === "texture")
        return ActionConstants.UPDATE_TEXTURE_LOAD_PROGRESS;
      if (payload.loaderType === "converter")
        return ActionConstants.UPDATE_CONVERSION_PROGRESS;
      return ActionConstants.UPDATE_MESH_LOAD_PROGRESS;

    case "loaded":
      if (payload.loaderType === "texture")
        return ActionConstants.TEXTURE_LOADED;
      if (payload.loaderType === "converter")
        return ActionConstants.CONVERSION_COMPLETE;
      if (payload.loaderType === "localtexture")
        return ActionConstants.LOCAL_TEXTURE_ASSET_LOADED;
      // put in logic for converter
      return ActionConstants.MESH_LOADED;

    default:
      if (payload.loaderType === "texture")
        return ActionConstants.TEXTURE_LOAD_ERROR;
      if (payload.loaderType === "converter")
        return ActionConstants.CONVERSION_ERROR;
      return ActionConstants.MESH_LOAD_ERROR;
  }
}

function createWorkerProgressChannel(worker: Object, loaderType: string) {
  return eventChannel(emit => {
    worker.onmessage = (event: MessageEvent) => {
      const { data } = event;
      if (data.type === WORKER_PROGRESS) {
        emit({
          eventType: "progress",
          val: data.payload,
          loaderType: loaderType
        });
      } else {
        emit({
          eventType: "loaded",
          val: data.payload,
          loaderType: loaderType
        });
        emit(END);
      }
    };
    const unsubscribe = () => {
      worker.onmessage = null;
    };
    return unsubscribe;
  });
}
// TODO how to handle type checking for polymorphic function that could take an ObjectLoader or TextLoader class
function createLoadProgressChannel(
  loader: Object,
  loaderType: string,
  url
): void {
  return eventChannel(emit => {
    loader.load(
      url,
      (payload: Object) => {
        // We're going to use this as a skybox texture so ...
        payload.mapping = THREE.EquirectangularReflectionMapping;
        payload.magFilter = THREE.LinearFilter;
        payload.minFilter = THREE.LinearMipMapLinearFilter;
        emit({
          eventType: "loaded",
          val: payload,
          loaderType: loaderType
        });
        emit(END);
      },
      (progress: ProgressEvent) => {
        let update = computeProgress(progress);
        emit({
          eventType: "progress",
          val: update,
          loaderType: loaderType
        });
      },
      (error: Error) => {
        emit({
          eventType: "error",
          val: error,
          loaderType: loaderType
        });
      }
    );

    const unsubscribe = () => {
      loader.onLoad = null;
    };
    return unsubscribe;
  });
}

function* parseJSONMesh(meshData: Object) {
  const loader = new THREE.ObjectLoader();
  const object3D = loader.parse(meshData);
  yield put({
    type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS,
    payload: { val: "Building Scene", percent: null }
  });
  yield put({
    type: ActionConstants.MESH_LOADED,
    payload: { val: object3D }
  });
}

function* loadJSONMesh(loadMeshAction) {
  const { payload, id, fileId, embedded } = loadMeshAction;
  let result = embedded ? false : yield ThreeViewerAbstractBackend.checkCache(id, fileId);
  let data;
  if (result) {
    yield put({
      type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS,
      payload: { val: "Loading Mesh From Cache", percent: null }
    });
    data = result.data.model.raw;
  } else {
    yield put({
      type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS,
      payload: { val: "Fetching Mesh From Server", percent: null }
    });
    data = yield ThreeViewerAbstractBackend.fetchJSONAssetSaga(
      id,
      payload,
      fileId,
      !embedded
    );
  }
  yield put({
    type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS,
    payload: { val: "Parsing Mesh Data", percent: null }
  });
  yield parseJSONMesh(data);
}

// TODO set up caching for JSON Asset

function* loadGzippedMesh(loadMeshAction) {
  const { payload, id, fileId, embedded } = loadMeshAction;
  let progressChannel;
  const result = embedded
    ? false
    : yield ThreeViewerAbstractBackend.checkCache(id, fileId);
  if (result) {
    yield put({
      type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS,
      payload: { val: "Loading Mesh From Cache", percent: null }
    });
    progressChannel = yield ThreeViewerAbstractBackend.gunzipAssetSaga(
      result.data.model.raw,
      createWorkerProgressChannel
    );
  } else {
    yield put({
      type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS,
      payload: { val: "Fetching Mesh From Server", percent: null }
    });
    progressChannel = yield ThreeViewerAbstractBackend.fetchGZippedAssetSaga(
      id,
      payload,
      fileId,
      createWorkerProgressChannel,
      !embedded
    );
  }
  while (true) {
    const payload = yield take(progressChannel);
    if (payload.eventType === "loaded") {
      yield put({
        type: ActionConstants.UPDATE_MESH_LOAD_PROGRESS,
        payload: { val: "Building Scene", percent: null }
      });
      /*
        This isn't too much of a bottleneck - it's unfortunate that ObjectLoader relies on <img> tags as we could off-load
        to a worker. I supposed we could parse geometry in a worker and do images on the main thread if we need to.

        Some day we can use https://caniuse.com/#feat=offscreencanvas
      */
      yield parseJSONMesh(payload.val);
      progressChannel.close();
    } else {
      yield put({
        type: getActionType(payload),
        payload: {
          val: "Decompressing Mesh Data",
          percent: payload.val
        }
      });
    }
  }
}

export function* loadMeshSaga(
  loadMeshAction: Object
): Generator<any, any, any> {
  try {
    if (loadMeshAction.ext === GZIP_EXT) {
      yield loadGzippedMesh(loadMeshAction);
    } else {
      yield loadJSONMesh(loadMeshAction);
    }
  } catch (error) {
    console.log(error);
  }
}

export function* loadTextureSaga(
  loadTextureAction: Object
): Generator<any, any, any> {
  // load the texture
  try {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = "anonymous";
    const textureLoaderChannel = yield call(
      createLoadProgressChannel,
      textureLoader,
      "texture",
      loadTextureAction.url
    );
    while (true) {
      const payload = yield take(textureLoaderChannel);
      yield put({
        type: getActionType(payload),
        payload
      });
    }
  } catch (error) {
    console.log(error);
  }
}
// TODO make loaderType constants
function* loadLocalTextureSaga(action) {
  try {
    const textureLoader = new THREE.TextureLoader();
    // set up image here
    textureLoader.crossOrigin = "anonymous";
    const textureLoaderChannel = yield call(createLoadProgressChannel, textureLoader, "localtexture", action.asset);
    while (true) {
      const payload = yield take(textureLoaderChannel);
      yield put({
        type: getActionType(payload),
        payload: payload,
        key: action.key
      });
    }
  } catch(error) {
    console.log(error);
  }
}

/***************** ADMIN ADDITIONS ********************************************/

function* addUserSaga(userAction: Object): Generator<any, any, any> {
  try {
    if (backend.hasAdminBackend) {
      const user = yield backend.adminBackend.addUser(userAction.userInfo);
      if (user.id !== undefined) {
        const { token, id, ...rest } = user;
        yield put({ type: ActionConstants.USER_ADDED, info: rest });
      }
    } else {
      console.warn(genericAPIRouteMessage);
    }
  } catch (error) {
    console.log(error);
  }
}

function* deleteUserSaga(userAction: Object): Generator<any, any, any> {
  try {
    if (backend.hasAdminBackend) {
      const deleted = yield backend.adminBackend.deleteUser(userAction.id);
      yield put({ type: ActionConstants.USER_DELETED, info: deleted });
      yield sleep(5000);
      yield put({ type: ActionConstants.USER_LOGGED_OUT });
    } else {
      console.warn(genericAPIRouteMessage);
    }
  } catch (error) {
    console.log(error);
  }
}

function* verifyUserSaga(verifyAction: Object): Generator<any, any, any> {
  try {
    if (backend.hasAdminBackend) {
      const verified = yield backend.adminBackend.verifyUser(
        verifyAction.token
      );
      yield put({ type: ActionConstants.USER_VERIFIED, info: verified });
    } else {
      console.warn(genericAPIRouteMessage);
    }
  } catch (error) {
    console.log(error);
  }
}

function* loginSaga(loginAction: Object): Generator<any, any, any> {
  try {
    if (backend.hasAdminBackend) {
      const user = yield backend.adminBackend.login(loginAction.loginInfo);
      if (user.error) {
        yield put({
          type: LOGIN_ERROR
        });
      } else {
        yield put({
          type: USER_LOGGED_IN,
          user: { ...user, loginError: false }
        });
      }
    } else {
      console.warn(genericAPIRouteMessage);
    }
  } catch (error) {
    console.log(error);
  }
}

function* logoutSaga(): Generator<any, any, any> {
  try {
    if (backend.hasAdminBackend) {
      const status = yield backend.adminBackend.logout();
      if (status.loggedOut === true) {
        yield put({ type: USER_LOGGED_OUT });
      }
    } else {
      console.warn(genericAPIRouteMessage);
    }
  } catch (error) {
    console.log(error);
  }
}

export function* authenticateSaga(): Generator<any, any, any> {
  try {
    const status = yield backend.authenticate();
    yield put({ type: USER_AUTHENTICATED, loggedIn: status.authenticated });
    yield put({ type: AUTHENTICATE_ATTEMPTED, value: true });
  } catch (error) {
    console.log(error);
  }
}

export function* addThreeViewSaga(addThreeViewAction: Object): Generator<any, any, any> {
  try {
    if (backend.hasAdminBackend) {
      const result = yield call(backend.adminBackend.addView, addThreeViewAction.viewData);
      yield put({
        type: ActionConstants.VIEW_ADDED,
      });
      const results = yield call(backend.adminBackend.getViews);
      const objConvertedResults = yield call(arrayToObject, results.views);
      yield put({
        type: ActionConstants.VIEWS_LOADED,
        views: objConvertedResults
      });
      // TODO add this to "views"
    } else {
      console.warn(genericAPIRouteMessage);
    }
  } catch (error) {
    console.log(error);
  }

}

export function* getThreeViewsSaga(getThreeViewsAction: Object): Generator<any, any, any> {
  try {
    if (backend.hasAdminBackend) {
      const results = yield call(backend.adminBackend.getViews);
      const objConvertedResults = yield call(arrayToObject, results.views);
      yield put({
        type: ActionConstants.VIEWS_LOADED,
        views: objConvertedResults
      });
    } else {
      console.warn(genericAPIRouteMessage);
    }
  } catch (error) {
    console.log(error);
  }
}

export function* getThreeViewSaga(getThreeViewAction: Object): Generator<any, any, any> {
  try {
    if (backend.hasAdminBackend) {
      const result = yield call(backend.adminBackend.getView, getThreeViewAction.id);
      yield put({
        type: ActionConstants.VIEW_LOADED,
        view: result
      });
    } else {
      console.warn(genericAPIRouteMessage);
    }
  } catch (error) {
    console.log(error);
  }
}

export function* updateThreeViewSaga(updateThreeViewAction: Object): Generator<any, any, any> {
  try {
    if (backend.hasAdminBackend) {
      const result = yield call(backend.adminBackend.updateView, updateThreeViewAction.viewData);
    } else {
      console.warn(genericAPIRouteMessage);
    }
  } catch (error) {
    console.log(error);
  }
}

export function* deleteThreeViewSaga(deleteThreeViewAction: Object): Generator<any, any, any> {
  try {
    if (backend.hasAdminBackend) {
      const result = yield call(backend.adminBackend.deleteView, deleteThreeViewAction.id);
      
      const results = yield call(backend.adminBackend.getViews);
      const objConvertedResults = yield call(arrayToObject, results.views);

      yield put({
        type: ActionConstants.VIEWS_LOADED,
        views: objConvertedResults
      });
    } else {
      console.warn(genericAPIRouteMessage);
    }
  } catch (error) {
    console.log(error);
  }
}

// Converter

function* compressConvertedFile(data: Object): void {
  const deflateWorker = new DeflateWorker();
  deflateWorker.postMessage(data.threeFile);
  const progressChannel = yield createWorkerProgressChannel(
    deflateWorker,
    "converter"
  );
  while (true) {
    const payload = yield take(progressChannel);
    if (payload.eventType === "loaded") {
      yield put({
        type: getActionType(payload),
        file: payload.val
      });
      progressChannel.close();
    } else {
      yield put({
        type: getActionType(payload),
        payload: {
          val: "Compressing Mesh Data",
          percent: payload.val
        }
      });
    }
  }
}

export function* runConversionSaga(
  conversionAction: Object
): Generator<any, any, any> {
  try {
    yield put({ type: ActionConstants.CONVERSION_STARTED });
    const { inputData } = conversionAction;
    let converted;
    if (inputData.mesh === undefined) {
      converted = yield convertPtmToThree(inputData);
    } else {
      converted = yield convertObjToThreeWithProgress(inputData);
    }
    const { options } = inputData;
    if (converted !== undefined) {
      if (options.zlib === true) {
        yield compressConvertedFile(converted);
      } else {
        yield put({
          type: ActionConstants.CONVERSION_COMPLETE,
          file: JSON.stringify(converted.threeFile)
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

/*************************** Observers ****************************************/
export function* watchForGetThreeAsset(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.GET_THREE_ASSET, getThreeAssetSaga);
}

export function* watchForSaveSettings(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.SAVE_VIEWER_SETTINGS, saveSettingsSaga);
}

export function* watchForLoadMesh(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.LOAD_MESH, loadMeshSaga);
}

export function* watchForLoadTexture(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.LOAD_TEXTURE, loadTextureSaga);
}

function* watchForLoadLocalTexture() {
  yield takeEvery(ActionConstants.LOAD_LOCAL_TEXTURE_ASSET, loadLocalTextureSaga);
}

export function* watchForAddUser(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.ADD_USER, addUserSaga);
}

export function* watchForVerifyUser(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.VERIFY_USER, verifyUserSaga);
}

export function* watchForDeleteUser(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.DELETE_USER, deleteUserSaga);
}

export function* watchForLogin(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.LOGIN_USER, loginSaga);
}

export function* watchForLogout(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.LOGOUT_USER, logoutSaga);
}

export function* watchForAuthenticate(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.AUTHENTICATE, authenticateSaga);
}

export function* watchForAddThreeView(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.ADD_VIEW, addThreeViewSaga);
}

export function* watchForGetThreeViews(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.GET_VIEWS, getThreeViewsSaga);
}

export function* watchForGetThreeView(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.GET_VIEW, getThreeViewSaga);
}

export function* watchForUpdateThreeView(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.UPDATE_VIEW, updateThreeViewSaga);
}

export function* watchForDeleteThreeView(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.DELETE_VIEW, deleteThreeViewSaga);
}

// Converter
export function* watchForConversion(): Generator<any, any, any> {
  yield takeEvery(ActionConstants.START_CONVERSION, runConversionSaga);
}

export default function* rootSaga(): Generator<any, any, any> {
  yield [
    watchForGetThreeAsset(),
    watchForSaveSettings(),
    watchForLoadMesh(),
    watchForLoadTexture(),
    watchForLoadLocalTexture(),
    watchForAddUser(),
    watchForVerifyUser(),
    watchForDeleteUser(),
    watchForLogin(),
    watchForLogout(),
    watchForAuthenticate(),
    watchForAddThreeView(),
    watchForGetThreeViews(),
    watchForGetThreeView(),
    watchForUpdateThreeView(),
    watchForDeleteThreeView(),
    watchForConversion(),
    fork(AnnotationSaga)
  ];
}
