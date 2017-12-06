/* @flow */

// React
import React from 'react';
import ReactDOM from 'react-dom';

// CSS
import './css/index.css';

// Store
import { sagaMiddleware, configureStore } from './store/configure-store';

// Sagas
import rootSaga from './middleware/saga';

// containers
import Root from './containers/Root';

const store: Object = configureStore();

sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root')
);
