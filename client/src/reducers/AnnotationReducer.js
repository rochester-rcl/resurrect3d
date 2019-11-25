/* @flow */
import * as ActionConstants from "../constants/actions";

const defaultState = {
  annotations: [],
  threeViewId: null,
  localStateNeedsUpdate: false
};

const addOrUpdate = (annotations, annotation) => {
  console.log(annotations, annotation);
  const { _id } = annotation;
  const index = annotations.findIndex((a) => a._id === _id);
  if (index > -1) {
    annotations[index] = annotation;
  } else {
    annotations.push(annotation);
  }
  return annotations;
}

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
      const cloned = addOrUpdate(annotations.slice(0), action.annotation);
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
