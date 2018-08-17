/* @flow */

// React
import React, { Component } from 'react';

// Redux
import { Provider } from 'react-redux';

// React-Router
import { BrowserRouter as Router, Route } from 'react-router-dom';

// App
import App from './App';
// TODO should be in containers
import ViewForm from '../components/admin/ThreeViewForm';
import ThreeViews from '../components/admin/ThreeViews';
import ThreeViewDetails from '../components/admin/ThreeViewDetails';

export default class Root extends Component {
  render() {
    const { store } = this.props;
    // need this for Omeka or embedding in any other system that has its own routing
    let path = window.publicUrl ? window.publicUrl : '/';
    return(
      <Provider store={store}>
        <Router>
          <div className="three-router">
            <Route path={path += 'models/:id'} component={App} />
            <Route path={'/admin/add'} component={ViewForm} />
            <Route path={'/admin/views'} component={ThreeViews} />
            <Route path={'/admin/view/:id'} component={ThreeViewDetails} />
          </div>
        </Router>
      </Provider>
    )
  }
}
