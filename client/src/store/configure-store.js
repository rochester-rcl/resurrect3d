/* @flow */

// Redux
import { createStore, applyMiddleware, compose } from 'redux';
import appReducer from '../reducers/reducer';

// Redux Saga
import createSagaMiddleware from 'redux-saga';

export const sagaMiddleware = createSagaMiddleware();

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(sagaMiddleware)
);

export function configureStore() {
  return createStore(appReducer, enhancer);
}
