/* @flow */

// Redux Saga
import { put, takeEvery } from 'redux-saga/effects';

export function* loadDataSaga(loadDataAction: Object): Generator<Promise<Object>, any, any> {
  try {
    // Do fetching here
    // i.e const data = yield fetchData();
    const data = ['this is where the response from your fetch would go'];
    yield put({type: 'DATA_LOADED', data });
  } catch(error) {
    console.log(error);
  }
}

export function* watchForLoadData(): Generator<any, any, any> {
  yield takeEvery('LOAD_API_DATA', loadDataSaga);
}

export default function* rootSaga(): Generator<any, any, any> {
  yield[
    watchForLoadData(),
  ]
}
