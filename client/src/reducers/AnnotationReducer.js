/* @flow */
import * as ActionConstants from "../constants/actions";

const defaultState = {
  annotations: [],
  threeViewId: null,
  localStateNeedsUpdate: false
};

const AnnotationReducer = (state = defaultState, action) => {
  switch (action.type) {
    case ActionConstants.ANNOTATIONS_LOADED:
      return {
        ...state,
        annotations: action.annotations,
        localStateNeedsUpdate: true
      };

    case ActionConstants.ANNOTATION_SAVED:
      const { annotations } = state;
      const cloned = annotations.slice(0);
      cloned.push(action.annotation);
      return {
        ...state,
        annotations: cloned,
        localStateNeedsUpdate: true
      };
    
    case ActionConstants.RESET_ANNOTATIONS_UPDATE_STATUS:
      return {
        ...state,
        localStateNeedsUpdate: false
      }

    default:
      return { ...state };
  }
};

export default AnnotationReducer;
