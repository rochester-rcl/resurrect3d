/* @flow */

// Constants
import * as ActionConstants from "../constants/actions";

export function getThreeAssetAction(assetId: Number, url: string, embedded = false): Object {
  return {
    type: ActionConstants.GET_THREE_ASSET,
    id: assetId,
    url: url,
    embedded: embedded,
  };
}

export function loadMeshAction(url: string): Object {
  return {
    type: ActionConstants.LOAD_MESH,
    url: url
  };
}

export function loadTextureAction(url: string): Object {
  return {
    type: ActionConstants.LOAD_TEXTURE,
    url: url
  };
}

export function loadLocalTextureAsset(asset, key) {
  return {
    type: ActionConstants.LOAD_LOCAL_TEXTURE_ASSET,
    asset: asset,
    key: key
  }
}

// Load a null texture to short-circuit progress loader
export function noSkyboxTexture(): Object {
  return {
    type: ActionConstants.TEXTURE_LOADED,
    payload: { val: null }
  };
}

export function saveViewerSettings(id: Number, settings: Object): Object {
  return {
    type: ActionConstants.SAVE_VIEWER_SETTINGS,
    settings: settings,
    id: id
  };
}

export function loadViewerSettings(id: Number): Object {
  return {
    type: ActionConstants.LOAD_VIEWER_SETTINGS,
    id: id
  };
}

export function startConversion(inputData: Object): Object {
  return {
    type: ActionConstants.START_CONVERSION,
    inputData: inputData
  };
}

export function restartConverter(): Object {
  return {
    type: ActionConstants.RESTART_CONVERTER
  };
}
