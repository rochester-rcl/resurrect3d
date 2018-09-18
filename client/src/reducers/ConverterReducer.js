/* @flow */
import * as ActionConstants from '../constants/actions';

const defaultState = {
  conversionComplete: false,
  conversionStarted: false,
  file: null,
}

export default function ConverterReducer(state: Object = defaultState, action: Object): Object {
  switch(action.type) {
    case ActionConstants.CONVERSION_STARTED:
      return {
        ...state,
        ...{ conversionStarted: true }
      }

    case ActionConstants.CONVERSION_COMPLETE:
      console.log(action);
      return {
        ...state,
        ...{ conversionComplete: true, file: action.file }
      }

    default:
      return { ...state };
  }
}
