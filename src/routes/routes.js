/* @flow */

//React
import React from 'react';

// React-Router
import { BrowserRouter as Router, Route } from 'react-router';

// Containers
import App from '../containers/App';

// Components
import ViewForm from '../components/admin/ThreeViewForm';


const routes = () => {
  return(
    <Router>
      <Route path="/models" component={App}/>
      <Route path="/admin" component={blah}/>
  </Router>)
};

export default routes;
