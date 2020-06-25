import { put, takeEvery, take, call } from "redux-saga/effects";

import {
  LOAD_ANNOTATIONS,
  SAVE_ANNOTATION,
  UPDATE_ANNOTATION,
  DELETE_ANNOTATION,
  ANNOTATIONS_LOADED,
  ANNOTATION_SAVED
} from "../constants/actions";

import threeViewerBackendFactory from "./backends/threeViewerBackendFactory";

// serialization
import { deserializeThreeTypes } from "../utils/serialization";
import { ANNOTATION_SAVE_STATUS } from "../constants/application";

const backend = threeViewerBackendFactory();

function* loadAnnotationsSaga(action) {
  try {
    const result = yield backend.getAnnotations(action.threeViewId);
    if (result.length > 0) {
      yield put({
        type: ANNOTATIONS_LOADED,
        annotations: result.map(deserializeThreeTypes)
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function* saveAnnotationSaga(action) {
  try {
    const { annotation, threeViewId } = action;
    let result;
    if (annotation.saveStatus === ANNOTATION_SAVE_STATUS.NEEDS_UPDATE) {
      const { saveStatus, ...rest } = annotation;
      result = yield backend.updateAnnotation(rest, threeViewId);
    } else {
      result = yield backend.saveAnnotation(annotation, threeViewId);
    }
    if (result && result.saveStatus === ANNOTATION_SAVE_STATUS.SAVED) {
      yield put({
        type: ANNOTATION_SAVED,
        annotation: deserializeThreeTypes(result)
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function* deleteAnnotationSaga(action) {
  try {
    const result = yield backend.deleteAnnotation(
      action.id,
      action.threeViewId
    );
  } catch (error) {
    console.error(error);
  }
}

function* watchForLoadAnnotationsSaga() {
  yield takeEvery(LOAD_ANNOTATIONS, loadAnnotationsSaga);
}

function* watchForSaveAnnotationSaga() {
  yield takeEvery(SAVE_ANNOTATION, saveAnnotationSaga);
}

function* watchForDeleteAnnotationSaga() {
  yield takeEvery(DELETE_ANNOTATION, deleteAnnotationSaga);
}

export default function* AnnotationSaga() {
  yield [
    watchForLoadAnnotationsSaga(),
    watchForSaveAnnotationSaga(),
    watchForDeleteAnnotationSaga()
  ];
}
