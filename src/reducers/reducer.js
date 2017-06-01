/* @flow */

// Actions
import * as ActionConstants from '../constants/actions';

const defaultState = {

  mesh: {
    loaded: false,
    progress: 0,
    object3D: null
  },

  texture: {
    loaded: false,
    progress: 0,
    image: null,
  }

}

export default function appReducer(state: Object = defaultState, action: Object): Object {

  switch (action.type) {

    case ActionConstants.MESH_LOADED:

      return {
        ...state,
        mesh: {
          loaded: true,
          progress: 'Complete',
          object3D: action.payload.val
        }
      };

    case ActionConstants.UPDATE_MESH_LOAD_PROGRESS:

      return {
        ...state,
        mesh: { ...state.mesh, progress: action.payload.val }
      }

    case ActionConstants.UPDATE_TEXTURE_LOAD_PROGRESS:

      return {
        ...state,
        texture: { ...state.texture, progress: action.payload.val }
      }

    case ActionConstants.TEXTURE_LOADED:

      return {
        ...state,
        texture: {
          loaded: true,
          progress: 'Complete',
          image: action.payload.val
        }
      }

    default:
      return state;
  }

}
