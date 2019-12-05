/* @flow */
import * as ActionConstants from "../constants/actions";

const defaultState = {
  annotations: [],
  threeViewId: null,
  localStateNeedsUpdate: false,
  focused: false
};

const addOrUpdate = (annotations, annotation) => {
  const { _id } = annotation;
  annotation.needsMerge = true;
  const index = annotations.findIndex(a => a._id === _id);
  if (index > -1) {
    annotations[index] = annotation;
  } else {
    annotations.push(annotation);
  }
  return annotations;
};

const reorderAnnotations = (annotations, ids) => {
  if (annotations.length !== ids.length) throw new Error("Unable to reorder annotations, old and new orders have a different length.");
  const reordered = annotations.sort((a, b) => ids.indexOf(a._id) - ids.indexOf(b._id));
  return reordered;
};

const AnnotationReducer = (state = defaultState, action) => {
  switch (action.type) {
    case ActionConstants.ANNOTATIONS_LOADED:
      return {
        ...state,
        annotations: action.annotations.map(a => {
          a.needsMerge = true;
          return a;
        }),
        localStateNeedsUpdate: true
      };

    case ActionConstants.ANNOTATION_SAVED:
      const cloned = addOrUpdate(state.annotations.slice(0), action.annotation);
      return {
        ...state,
        annotations: cloned,
        localStateNeedsUpdate: true
      };

    case ActionConstants.UPDATE_ANNOTATIONS_ORDER:
      const reordered = reorderAnnotations(
        state.annotations.slice(0),
        action.ids
      );
      return {
        ...state,
        annotations: reordered
      };

    case ActionConstants.ANNOTATIONS_MERGED:
      return {
        ...state,
        annotations: state.annotations.map(a => {
          if (action.ids.includes(a._id)) {
            a.needsMerge = false;
          }
          return a;
        })
      };

    case ActionConstants.RESET_ANNOTATIONS_UPDATE_STATUS:
      return {
        ...state,
        localStateNeedsUpdate: false
      };

    case ActionConstants.ANNOTATION_FOCUS_CHANGED:
      return {
        ...state,
        focused: action.val
      };

    default:
      return { ...state };
  }
};

export default AnnotationReducer;
