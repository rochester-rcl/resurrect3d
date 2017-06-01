/* @flow */

// Constants
import * as ActionConstants from '../constants/actions';

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
