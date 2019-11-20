import {
  LOAD_ANNOTATIONS,
  SAVE_ANNOTATION,
  UPDATE_ANNOTATION,
  DELETE_ANNOTATION
} from "../constants/actions";

export function loadAnnotations(threeViewId) {
  return {
    type: LOAD_ANNOTATIONS,
    threeViewId: threeViewId
  };
}

export function saveAnnotation(annotation, threeViewId) {
  return {
    type: SAVE_ANNOTATION,
    annotation: annotation,
    threeViewId: threeViewId
  };
}

export function deleteAnnotation(id, threeViewId) {
  return {
    type: DELETE_ANNOTATION,
    id: id,
    threeViewId: threeViewId
  }
}
