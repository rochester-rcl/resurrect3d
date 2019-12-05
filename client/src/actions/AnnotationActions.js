import {
  LOAD_ANNOTATIONS,
  SAVE_ANNOTATION,
  UPDATE_ANNOTATION,
  DELETE_ANNOTATION,
  RESET_ANNOTATIONS_UPDATE_STATUS,
  ANNOTATION_FOCUS_CHANGED,
  ANNOTATIONS_MERGED,
  UPDATE_ANNOTATIONS_ORDER
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
  };
}

export function updateAnnotationsMergedStatus(ids) {
  return {
    type: ANNOTATIONS_MERGED,
    ids: ids
  }
}

export function updateAnnotationsOrder(ids) {
  return {
    type: UPDATE_ANNOTATIONS_ORDER,
    ids: ids
  }
}

export function resetLocalStateUpdateStatus() {
  return {
    type: RESET_ANNOTATIONS_UPDATE_STATUS
  };
}

export function changeAnnotationFocus(val) {
  return {
    type: ANNOTATION_FOCUS_CHANGED,
    val: val
  };
}
