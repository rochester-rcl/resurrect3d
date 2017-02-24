/* @flow */

//React
import React from 'react';

// React-Router
import { Route } from 'react-router';

// Containers
import App from '../containers/App';

export default (
  <Route path={"/"} component={App}>
    {/* other child routes go here */}
  </Route>
);
