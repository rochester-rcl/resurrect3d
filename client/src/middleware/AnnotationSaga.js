import { put, takeEvery, take, call } from "redux-saga/effects";

import { LOAD_ANNOTATIONS, SAVE_ANNOTATION, UPDATE_ANNOTATION, DELETE_ANNOTATION } from "../constants/actions";

import threeViewerBackendFactory from "./backends/threeViewerBackendFactory";

import ThreeViewerAbstractBackend from "./backends/ThreeViewerAbstractBackend";

// serialization
import { deserializeThreeTypes } from "../utils/serialization";

function* loadAnnotationsSaga() {
    
}

function* watchForLoadAnnotationsSaga() {
    yield takeEvery(LOAD_ANNOTATIONS, loadAnnotationsSaga);
}

export default function* AnnotationSaga() {
    yield [
        watchForLoadAnnotationsSaga()
    ]
}