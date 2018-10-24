/* @flow */

import React, { Component } from "react";

// semantic ui
import { Form, Button, Modal, Message } from "semantic-ui-react";

// components
import ToggleIcon from "../ToggleIcon";

export default class AdminSignUpModal extends Component {
  state = {
    username: "",
    password: "",
    email: ""
  };

  constructor(props: Object) {
    super(props);
    this.handleSignUpUser = this.handleSignUpUser.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleShowPassword = this.handleShowPassword.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
  }

  // TODO all of these could be more DRY and exist in one method but I don't care right now

  handleEmailChange(event, { value }) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      email: value
    });
  }

  handlePasswordChange(event, { value }) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      password: value
    });
  }

  handleUsernameChange(event, { value }) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      username: value
    });
  }

  handleShowPassword() {
    this.setState({
      showPassword: !this.state.showPassword
    });
  }

  handleSignUpUser(event) {
    event.preventDefault();
    event.stopPropagation();
    const { email, password, username } = this.state;
    const userInfo = {
      username: username,
      email: email,
      password: encodeURIComponent(password)
    };
    this.props.signUpUser(userInfo);
  }

  render() {
    const { password, showPassword, username, email } = this.state;
    const { trigger, signUpUser, signUpError, status } = this.props;
    let messageClass = "signup-error ";
    messageClass += signUpError === true ? "show" : "hide";
    return (
      <Modal dimmer className="three-admin-signup-modal" trigger={trigger}>
        <Modal.Header>Create an Account</Modal.Header>
        <Modal.Content>
          {status === false ? (
            <Form className="signup-form" onSubmit={this.handleSignUpUser}>
              <Form.Input
                className="login-form-field"
                icon="mail"
                iconPosition="left"
                onChange={this.handleEmailChange}
                placeholder="email"
                name="email"
                type="text"
                error={signUpError}
              />
              <Form.Input
                className="login-form-field"
                icon="lock"
                iconPosition="left"
                onChange={this.handlePasswordChange}
                placeholder="password"
                name="password"
                value={password}
                type={showPassword === true ? "text" : "password"}
                error={signUpError}
              />
              <Form.Input
                className="login-form-field"
                icon="user circle"
                iconPosition="left"
                onChange={this.handleUsernameChange}
                placeholder="username (optional)"
                name="username"
                value={username}
                type="text"
                error={signUpError}
              />
              <Message negative className={messageClass}>
                <Message.Header>
                  There was a problem creating your account!
                </Message.Header>
                <p>(real message goes here)</p>
              </Message>
              <Button className="login-submit" type="submit" color="green">
                create
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
          ) : (
            <Message className="three-admin-signup-message" positive>
              <Message.Header>Your Account was Created</Message.Header>We just
              sent a verification e-mail to {email}. Please check your inbox for
              further instructions.
            </Message>
          )}
        </Modal.Content>
      </Modal>
    );
  }
}
