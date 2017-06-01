/* @flow */

// Redux Saga
import { put, takeEvery, take, call } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';

// Action Constants
import * as ActionConstants from '../constants/actions';

// THREE
import * as THREE from 'three';

function computeProgress(request: typeof ProgressEvent): string {

  let progress;
  if (request.lengthComputable) {
    progress = Math.floor(request.loaded / request.total) + ' %';
  } else {
    progress = parseFloat(request.loaded / 1000000).toFixed(2) + ' MB';
  }
  return progress;

}

function getActionType(payload: Object): string {

  switch(payload.eventType) {
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
        emit({ eventType: 'loaded', val: payload, loaderType: loaderType });
        emit(END);
      },
      (progress: typeof ProgressEvent) => {
        let update = computeProgress(progress);
        emit({ eventType: 'progress', val: update, loaderType: loaderType });
      },
      (error: typeof Error) => {
        emit({ eventType: 'error', val: error, loaderType: loaderType });
      })

    const unsubscribe = () => {
      loader.onLoad = null;
    }
    return unsubscribe;
    
  });

}

export function* loadMeshSaga(loadMeshAction: Object): Generator<any, any, any> {

  // load the mesh
  try {
    const meshLoader = new THREE.ObjectLoader();
    const meshLoaderChannel = yield call(createLoadProgressChannel, meshLoader, 'mesh', loadMeshAction.url);
    while (true) {
      const payload = yield take(meshLoaderChannel);
      yield put({ type: getActionType(payload), payload });
    }
  } catch(error) {
    console.log(error);
  }

}

export function* loadTextureSaga(loadTextureAction: Object): Generator<any, any, any> {

  // load the texture
  try {
    const textureLoader = new THREE.TextureLoader();
    const textureLoaderChannel = yield call(createLoadProgressChannel, textureLoader, 'texture', loadTextureAction.url);
    while (true) {
      const payload = yield take(textureLoaderChannel)
      yield put({ type: getActionType(payload), payload });
    }
  } catch(error) {
    console.log(error);
  }

}

export function* watchForLoadMesh(): Generator<any, any, any> {

  yield takeEvery(ActionConstants.LOAD_MESH, loadMeshSaga);

}

export function* watchForLoadTexture(): Generator<any, any, any> {

  yield takeEvery(ActionConstants.LOAD_TEXTURE, loadTextureSaga);

}

export default function* rootSaga(): Generator<any, any, any> {

  yield[
    watchForLoadMesh(),
    watchForLoadTexture(),
  ];

}
