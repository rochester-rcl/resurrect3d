/* @flow */

// React
import React, { Component } from "react";

// React-redux
import { connect } from "react-redux";

// React-Router
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

// App
import App from "./App";

// TODO should be in containers
import ViewForm from "../components/admin/ThreeViewForm";
import ThreeViews from "../components/admin/ThreeViews";
import AdminMenu from "../components/admin/ThreeViewAdminMenu";
import ThreeViewDetails from "../components/admin/ThreeViewDetails";
import LoaderModal from "../components/LoaderModal";
import ConverterContainer from "./converter/ConverterContainer";
import LoginContainer from "./LoginContainer";
import LogoutContainer from "./LogoutContainer";

// actions
import { authenticate, logout } from "../actions/UserActions";

// constants
import {
  CONVERSION_TYPE_RTI,
  CONVERSION_TYPE_MESH,
  BASENAME
} from "../constants/application";

const AuthenticatingLoader = () => <LoaderModal active={true} text="Authenticating ..." />;

const process = require('process');

class RouterContainer extends Component {
  _element = React.createElement;

  constructor(props: Object) {
    super(props);
    (this: any).authenticateRoute = this.authenticateRoute.bind(this);
  }

  authenticateRoute(props: Object, component: Component) {
    const { user } = this.props;
    const { authenticateAttempted } = user;
    if (user.loggedIn !== false) {
      return this._element(component, props, null);
    } else {
      if (authenticateAttempted === false) {
        this.props.authenticate();
        return <AuthenticatingLoader />;
      } else {
        // Need to use process.env
        return <Redirect to={BASENAME + 'admin/login'}/>;
      }
    }
  }

  render() {
    const { store, user } = this.props;
    // need this for Omeka or embedding in any other system that has its own routing
    let path = window.publicUrl ? window.publicUrl : "/";

    return (
        <Router basename={BASENAME}>
          <div className="three-router">
            <Route path="/models/:id" component={App} />
            <AdminMenu active={user.loggedIn} />
            <Route path="/admin/login" component={LoginContainer} />
            <Route path="/admin/logout" component={LogoutContainer} />
            <Route path="/admin/add" render={(props) => this.authenticateRoute(props, ViewForm)} />
            <Route path="/admin/views" render={(props) => this.authenticateRoute(props, ThreeViews)} />
            <Route path="/admin/view/:id" render={(props) => this.authenticateRoute(props, ThreeViewDetails)} />
            <Route
              path="/converter"
              render={props => (
                <ConverterContainer conversionType={CONVERSION_TYPE_MESH} />
              )}
            />
            <Route
              path="/ptm-converter"
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
    user: state.user,
  }
}

export default connect(mapStateToProps, { authenticate })(RouterContainer);
