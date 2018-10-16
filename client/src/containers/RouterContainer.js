/* @flow */

// React
import React, { Component } from "react";

// React-redux
import { connect } from "react-redux";

// React-Router
import { BrowserRouter as Router, Route } from "react-router-dom";

// App
import App from "./App";

// TODO should be in containers
import ViewForm from "../components/admin/ThreeViewForm";
import ThreeViews from "../components/admin/ThreeViews";
import ThreeViewDetails from "../components/admin/ThreeViewDetails";
import ConverterContainer from "./converter/ConverterContainer";

// actions
import { authenticate } from "../actions/ThreeViewActions";

// constants
import {
  CONVERSION_TYPE_RTI,
  CONVERSION_TYPE_MESH
} from "../constants/application";


class RouterContainer extends Component {
  _element = React.createElement;

  constructor(props: Object) {
    super(props);
    (this: any).authenticateRoute = this.authenticateRoute.bind(this);
  }

  authenticateRoute(props: Object, component: Component) {
    console.log(props);
    return this._element(component, props, null);
  }

  render() {
    const { store } = this.props;
    // need this for Omeka or embedding in any other system that has its own routing
    let path = window.publicUrl ? window.publicUrl : "/";
    return (
        <Router>
          <div className="three-router">
            <Route path="*/models/:id" component={App} />
            <Route path="*/admin/add" render={(props) => this.authenticateRoute(props, ViewForm)} />
            <Route path="*/admin/views" render={(props) => this.authenticateRoute(props, ThreeViews)} />
            <Route path="*/admin/view/:id" render={(props) => this.authenticateRoute(props, ThreeViewDetails)} />
            <Route
              path="*/converter"
              render={props => (
                <ConverterContainer conversionType={CONVERSION_TYPE_MESH} />
              )}
            />
            <Route
              path="*/ptm-converter"
              render={props => (
                <ConverterContainer conversionType={CONVERSION_TYPE_RTI} />
              )}
            />
          </div>
        </Router>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.views.user,
  }
}

export default connect(mapStateToProps, { authenticate })(RouterContainer);
