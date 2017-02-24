/* @flow */

// React
import React, { Component } from 'react';

// Redux
import { Provider } from 'react-redux';

// React-Router
import routes from '../routes/routes';
import { Router } from 'react-router';

export default class Root extends Component {
  render() {
    const { store, history } = this.props;
    return(
      <Provider store={store}>
        <Router history={history} routes={routes}/>
      </Provider>
    )
  }
}
