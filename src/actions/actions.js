/* @flow */

// Constants
import * as ActionConstants from '../constants/actions';

export function getThreeAssetAction(assetId: Number, url: string): Object {
  return {
    type: ActionConstants.GET_THREE_ASSET,
    id: assetId,
    url: url,
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

// Load a null texture to short-circuit progress loader
export function noSkyboxTexture(): Object {
  return {
    type: ActionConstants.TEXTURE_LOADED,
    payload: { val: null }
  }
}
