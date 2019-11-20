/* @flow */
import * as ActionConstants from '../constants/actions';

const defaultState = {
  conversionComplete: false,
  conversionStarted: false,
  error: false,
  file: null,
  progress: { label: 'performing conversion (this will take a while).', percent: null }
}

export default function ConverterReducer(state: Object = defaultState, action: Object): Object {
  switch(action.type) {

    case ActionConstants.CONVERSION_STARTED:
      return {
        ...state,
        ...{ conversionStarted: true }
      }

    case ActionConstants.UPDATE_CONVERSION_PROGRESS:
      return {
        ...state,
        progress: { label: action.payload.val, percent: action.payload.percent }
      }

    case ActionConstants.CONVERSION_COMPLETE:
      return {
        ...state,
        ...{ conversionComplete: true, file: action.file }
      }

    case ActionConstants.CONVERSION_ERROR:
      return {
        ...state,
        error: true,
        progress: { label: action.message, percent: 100 }
      }

    case ActionConstants.RESTART_CONVERTER:
      return {
        ...defaultState,
      }

    default:
      return { ...state };
  }
}
