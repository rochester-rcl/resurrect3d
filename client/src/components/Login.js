import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Form, Button, Message, Radio, Icon } from "semantic-ui-react";
import { loginUser } from "../actions/UserActions";
import ToggleIcon from "../components/ToggleIcon";
import { Redirect, Link } from "react-router-dom";
// actions
import { authenticate } from "../actions/UserActions";

// constants
import { BASENAME } from "../constants/api-endpoints";

export default class Login extends Component {
  state = {
    email: "",
    password: "",
    showPassword: false
  };

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleShowPassword = this.handleShowPassword.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const { email, password } = this.state;
    const loginInfo = {
      username: email,
      password: encodeURIComponent(password)
    };
    this.props.loginUser(loginInfo);
  }

  handleEmailChange(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      email: event.target.value
    });
  }

  handlePasswordChange(event, { value }) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      password: value
    });
  }

  handleShowPassword() {
    this.setState({
      showPassword: !this.state.showPassword
    });
  }

  handleKeyPress(event) {
    if (event.charCode === 13) {
      this.handleSubmit(event);
    }
  }

  render() {
    const { password, showPassword } = this.state;
    const { loginError, loggedIn, onLoginRedirectPath } = this.props;
    let messageClass = "login-error ";
    messageClass += loginError === true ? "show" : "hide";
    if (loggedIn === false) {
      return (
        <div className="ui middle aligned center aligned grid">
          <div className="column">
            <Form className="login-form" onSubmit={this.handleSubmit}>
              <Form.Input
                className="login-form-field"
                icon="mail"
                iconPosition="left"
                onKeyPress={this.handleKeyPress}
                onChange={this.handleEmailChange}
                placeholder="email"
                name="email"
                type="text"
                error={loginError}
              />
              <Form.Input
                className="login-form-field"
                icon="lock"
                iconPosition="left"
                onKeyPress={this.handleKeyPress}
                onChange={this.handlePasswordChange}
                placeholder="password"
                name="password"
                value={password}
                type={showPassword === true ? "text" : "password"}
                error={loginError}
              />
              <Message negative className={messageClass}>
                <Message.Header>There was a problem logging in!</Message.Header>
                <p>Username or password is incorrect</p>
              </Message>
              <Button className="login-submit" type="submit" color="green">
                login
              </Button>
              <ToggleIcon
                className="login-form-button"
                id="show-password"
                onClick={this.handleShowPassword}
                onColor="grey"
                offColor="black"
                onIcon="hide"
                offIcon="eye"
                onLabel="hide password"
                offLabel="show password"
              />
            </Form>
          </div>
        </div>
      );
    } else {
      // likely need to use process info here to properly redirect when building
      const redirectPath = onLoginRedirectPath ? onLoginRedirectPath : "/admin/models";
      return <Redirect to={redirectPath} />;
    }
  }
}
