import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Form, Button, Message, Radio, Icon } from "semantic-ui-react";
import { loginUser } from "../actions/UserActions";
import ToggleIcon from "../components/ToggleIcon";
import { Redirect, Link } from "react-router-dom";
// actions
import { authenticate, addUser } from "../actions/UserActions";

// components
import Login from "../components/Login";
import AdminSignUpModal from "../components/admin/ThreeViewAdminSignUp";

class LoginContainer extends Component {
  componentDidMount() {
    if (this.props.loggedIn === false) {
      this.props.authenticate();
    }
  }

  render() {
    const {
      loginError,
      loggedIn,
      loginUser,
      addUser,
      info,
      onLoginRedirectPath
    } = this.props;
    return (
      <div className="hp-body-container">
        <div className="hp-overlay">
          <div className="hp-content">
            <p className="hp-tagline">Some great tagline about 3D stuff</p>
            <div className="hp-login-container">
              <Login
                loginError={loginError}
                loggedIn={loggedIn}
                loginUser={loginUser}
                onLoginRedirectPath={onLoginRedirectPath}
              />
              <div className="hp-forgot-pass-container">
                <AdminSignUpModal
                  trigger={<a>sign up</a>}
                  signUpUser={addUser}
                  status={info.email !== undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const ownState = ownProps.location.state;
  return {
    loggedIn: state.user.loggedIn,
    loginError: state.user.loginError,
    info: state.user.info,
    onLoginRedirectPath: ownState ? ownState.from : null
  };
}

//donot connect to store
export default connect(mapStateToProps, { loginUser, authenticate, addUser })(
  LoginContainer
);
