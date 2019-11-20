/* @flow */
import * as ActionConstants from '../constants/actions';

const defaultState = {
 annotations: [],
 threeViewId: null
}

export default function AnnotationReducer(state = defaultState, action) {
  switch(action.type) {

    case ActionConstants.LOAD_ANNOTATIONS:
      return {
        ...state,
        ...{ annotations: action.annotations }
      }

    case ActionConstants.ANNOTATION_SAVED:
      return {
        ...state,
      }

    default:
      return { ...state };
  }
}
