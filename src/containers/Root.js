/* @flow */

// React
import React, { Component } from 'react';

// Redux
import { Provider } from 'react-redux';

// React-Router
import { BrowserRouter as Router, Route } from 'react-router-dom';

// App
import App from './App';

export default class Root extends Component {
  render() {
    const { store } = this.props;
    // need this for Omeka or embedding in any other system that has its own routing
    let path = window.publicUrl ? window.publicUrl : '/';
    return(
      <Provider store={store}>
        <Router>
          <Route path={path += ':id'} component={App} />
        </Router>
      </Provider>
    )
  }
}
