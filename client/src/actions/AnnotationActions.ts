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

export function loadAnnotations(threeViewId: number): Object {
  return {
    type: LOAD_ANNOTATIONS,
    threeViewId: threeViewId
  };
}

export function saveAnnotation(annotation: Object, threeViewId: number): Object {
  return {
    type: SAVE_ANNOTATION,
    annotation: annotation,
    threeViewId: threeViewId
  };
}

export function deleteAnnotation(id: number, threeViewId: number): Object {
  return {
    type: DELETE_ANNOTATION,
    id: id,
    threeViewId: threeViewId
  };
}

export function updateAnnotationsMergedStatus(ids: Array<number>): Object {
  return {
    type: ANNOTATIONS_MERGED,
    ids: ids
  }
}

export function updateAnnotationsOrder(ids: Array<number>): Object {
  return {
    type: UPDATE_ANNOTATIONS_ORDER,
    ids: ids
  }
}

export function resetLocalStateUpdateStatus(): Object {
  return {
    type: RESET_ANNOTATIONS_UPDATE_STATUS
  };
}

export function changeAnnotationFocus(val: number): Object {
  return {
    type: ANNOTATION_FOCUS_CHANGED,
    val: val
  };
}
