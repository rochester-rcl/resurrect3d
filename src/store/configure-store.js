/* @flow */

// Redux
import { createStore, applyMiddleware } from 'redux';
import appReducer from '../reducers/reducer';

// Redux Saga
import createSagaMiddleware from 'redux-saga';

export const sagaMiddleware = createSagaMiddleware();

export function configureStore() {
  return createStore(
    appReducer,
    applyMiddleware(sagaMiddleware)
  );
}
