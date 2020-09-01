import {
  LOAD_ANNOTATIONS,
  SAVE_ANNOTATION,
  UPDATE_LOCAL_ANNOTATION,
  DELETE_ANNOTATION,
  RESET_ANNOTATIONS_UPDATE_STATUS,
  ANNOTATION_FOCUS_CHANGED,
  ANNOTATIONS_MERGED,
  UPDATE_ANNOTATIONS_ORDER,
  UPDATE_LOCAL_ANNOTATIONS,
  HIDE_ANNOTATIONS,
  SHOW_ANNOTATIONS,
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

export function updateLocalAnnotations(annotations, indices) {
  return {
    type: UPDATE_LOCAL_ANNOTATIONS,
    indices: indices,
    annotations: annotations
  }
}

export function updateLocalAnnotation(annotation, index) {
  return {
    type: UPDATE_LOCAL_ANNOTATION,
    index: index,
    annotation: annotation
  }
}

export function hideAnnotations() {
  return {
    type: HIDE_ANNOTATIONS
  }
}

export function showAnnotations() {
  return {
    type: SHOW_ANNOTATIONS
  }
}
