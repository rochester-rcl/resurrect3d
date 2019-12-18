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
import AccountContainer from "./AccountContainer";
import VerifyUserContainer from "./VerifyUserContainer";
import AdminContainer from "../components/admin/AdminContainer";
import Paperbase from "../components/admin/Paperbase";
import SemanticBase from "../components/admin/SemanticBase";

// actions
import { authenticate, logout } from "../actions/UserActions";

// constants
import {
  CONVERSION_TYPE_RTI,
  CONVERSION_TYPE_MESH
} from "../constants/application";

import { BASENAME } from "../constants/api-endpoints";

import { BUILD_ENV, BUILD_ENV_OMEKA } from "../constants/application";

const AuthenticatingLoader = () => (
  <LoaderModal active={true} text="Authenticating ..." />
);

class RouterContainer extends Component {
  _element = React.createElement;

  constructor(props: Object) {
    super(props);
    (this: any).authenticateRoute = this.authenticateRoute.bind(this);
    (this: any).authenticateRouteWithoutRedirect = this.authenticateRouteWithoutRedirect.bind(
      this
    );
  }

  authenticateRoute(props: Object, component: Component) {
    const { user } = this.props;
    const { location } = props;
    const { authenticateAttempted } = user;
    if (user.loggedIn !== false) {
      return this._element(component, props, null);
    } else {
      if (authenticateAttempted === false) {
        this.props.authenticate();
        return <AuthenticatingLoader />;
      } else {
        // Need to use process.env
        return (
          <Redirect
            from={location.pathname}
            to={{
              pathname: BASENAME + "/admin/login",
              state: { from: location.pathname }
            }}
          />
        );
      }
    }
  }
  // TODO for now we have to disable caching via iframes
  embedRoute(props, component) {
    const newProps = { ...props, ...{ embedded: true } };
    return this._element(component, newProps, null);
  }

  // i.e. for the routes that you could optionally be signed in for
  authenticateRouteWithoutRedirect(props: Object, component: Component) {
    const { user } = this.props;
    const { authenticateAttempted } = user;
    if (user.loggedIn !== false) {
      return this._element(component, props, null);
    } else {
      if (authenticateAttempted === false) {
        this.props.authenticate();
        return <AuthenticatingLoader />;
      } else {
        // up to the component to update the user prop when authentication is done
        return this._element(component, props, null);
      }
    }
  }

  render() {
    const { store, user } = this.props;
    // need this for Omeka or embedding in any other system that has its own routing
    let path = window.publicUrl ? window.publicUrl : "/";
    if (BUILD_ENV === BUILD_ENV_OMEKA) {
      return (
        <Router basename={BASENAME}>
          <div className="three-router">
            <Route
              path="/models/:id"
              render={props =>
                this.authenticateRouteWithoutRedirect(props, App)
              }
            />
            <Route
              path="/embed/:id"
              render={props => this.embedRoute(props, App)}
            />
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
    } else {
      return (
        <Router basename={BASENAME}>
          <div className="three-router">
            <Route exact path="/" component={LoginContainer} />
            <Route
              path="/models/:id"
              render={props =>
                this.authenticateRouteWithoutRedirect(props, App)
              }
            />
            <Route
              path="/embed/:id"
              render={props => this.embedRoute(props, App)}
            />
            {/*<AdminMenu active={user.loggedIn} />*/}
            <Route path="/admin/login" component={LoginContainer} />
            <Route path="/admin/logout" component={LogoutContainer} />
            <Route
              path="/admin/verify/:token"
              component={VerifyUserContainer}
            />
            <Route
              path="/admin/account"
              render={props => this.authenticateRoute(props, AccountContainer)}
            />
            <Route
              path="/admin/add"
              render={props => this.authenticateRoute(props, ViewForm)}
            />
            <Route
              path="/admin/views"
              render={props => this.authenticateRoute(props, ThreeViews)}
            />
            <Route
              path="/admin/container"
              render={props => this.authenticateRoute(props, AdminContainer)}
            />
            <Route
              path="/admin/paperbase"
              render={props => this.authenticateRoute(props, Paperbase)}
            />
            <Route
              path="/admin/models"
              render={props => this.authenticateRoute(props, SemanticBase)}
            />
            <Route
              path="/admin/view/:id"
              render={props => this.authenticateRoute(props, ThreeViewDetails)}
            />
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
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user
  };
}

export default connect(mapStateToProps, { authenticate })(RouterContainer);
