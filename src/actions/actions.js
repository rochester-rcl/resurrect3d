/* @flow */

// Constants
import * as ActionConstants from '../constants/actions';

export function getMeshURLAction(meshId: Number): Object {
  return {
    type: ActionConstants.GET_MESH_URL,
    id: meshId,
  }
}

export function getThreeAssetAction(assetId: Number): Object {
  return {
    type: ActionConstants.GET_THREE_ASSET,
    id: assetId,
  }
}


export function loadMeshAction(url: string): Object {
  return {
    type: ActionConstants.LOAD_MESH,
    url: url,
  }
}

export function loadTextureAction(url: string): Object {
  return {
    type: ActionConstants.LOAD_TEXTURE,
    url: url,
  }
}
