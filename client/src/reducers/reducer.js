/* @flow */

// redux
import { combineReducers } from 'redux';

// Actions
import * as ActionConstants from '../constants/actions';

// Application Constants
import { PROGRESS_COMPLETE } from '../constants/application';

// Utils
import { LinearGradientShader } from '../utils/image';

// Reducers
import ViewReducer from './ViewReducer';
import ConverterReducer from './ConverterReducer';
import UserReducer from './UserReducer';
import AnnotationReducer from "./AnnotationReducer";
const defaultState = {

  mesh: {
    loaded: false,
    progress: {
      label: 'Loading Mesh',
      percent: null,
    },
    object3D: null
  },

  texture: {
    loaded: false,
    progress: {
      label: 'Loading Texture',
      percent: null,
    },
    image: null,
  },

  metadata: [],

  threeAsset: {

  },
  saveStatus: null,
  localAssets: { textures: {}, meshes: {} }
}

function uiReducer(state: Object = defaultState, action: Object): Object {

  switch (action.type) {

    case ActionConstants.MESH_LOADED:
      return {
        ...state,
        mesh: {
          loaded: true,
          progress: PROGRESS_COMPLETE,
          object3D: action.payload.val
        }
      };

    case ActionConstants.UPDATE_MESH_LOAD_PROGRESS:
      return {
        ...state,
        mesh: { ...state.mesh, progress: { label: action.payload.val, percent: action.payload.percent } }
      }

    case ActionConstants.UPDATE_TEXTURE_LOAD_PROGRESS:
      return {
        ...state,
        texture: { ...state.texture, progress: { label: action.payload.val, percent: action.payload.percent } }
      }

    case ActionConstants.TEXTURE_LOADED:
      return {
        ...state,
        texture: {
          ...state.texture,
          loaded: true,
          progress: PROGRESS_COMPLETE,
          image: action.payload.val
        }
      }
    
    case ActionConstants.LOCAL_TEXTURE_ASSET_LOADED:
      const copiedAssets = {...state.localAssets};
      copiedAssets.textures[action.key] = action.payload.val;
      return {
        ...state,
        localAssets: copiedAssets
      }

    case ActionConstants.THREE_ASSET_LOADED:
      return {
        ...state,
        threeAsset: action.threeAsset,
      }

    case ActionConstants.THREE_METADATA_LOADED:
      return {
        ...state,
        metadata: action.metadata,
      }

    case ActionConstants.VIEWER_SETTINGS_SAVED:
      return {
        ...state,
        saveStatus: true,
      }

    case ActionConstants.VIEWER_SETTINGS_ERROR:
      return {
        ...state,
        saveStatus: false,
      }

    case ActionConstants.RESET_SAVE_STATUS:
      return {
        ...state,
        saveStatus: null,
      }

    default:
      return state;
  }

}

const appReducer = combineReducers({
    views: ViewReducer,
    ui: uiReducer,
    user: UserReducer,
    converter: ConverterReducer,
    annotationData: AnnotationReducer
  });

export default appReducer;
