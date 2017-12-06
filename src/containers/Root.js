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
    return(
      <Provider store={store}>
        <Router>
          <Route path="/:id" component={App} />
        </Router>
      </Provider>
    )
  }
}
