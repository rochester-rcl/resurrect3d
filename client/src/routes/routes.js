/* @flow */

//React
import React from 'react';

// React-Router
import { BrowserRouter as Router, Route } from 'react-router';

// Containers
import App from '../containers/App';

const routes = () => {
  return(<Router>
    <Route path="/" component={App}/>
  </Router>)
};

export default routes;
