import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Form, Button, Message, Radio, Icon } from "semantic-ui-react";
import { loginUser } from "../actions/ThreeViewActions";
import ToggleIcon from '../components/ToggleIcon';
import { Redirect, Link } from 'react-router-dom';

class LoginContainer extends Component {
  // TODO rewrite with semantic ui form
  state = {
    email: '',
    password: '',
    showPassword: false
  }

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleShowPassword = this.handleShowPassword.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.loggedIn) {
      // this.props.history.push("/dashboard");
    }
  }

  componentDidMount() {

  }

  handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const { email, password } = this.state;
    if (this.props.loggedIn) {
      this.context.router.push("/");
    } else {
      const loginInfo = {
        username: email,
        password: encodeURIComponent(password),
      };
      this.props.loginUser(loginInfo);
      // this.props.getSession();
      this.setState({
        loginAttempted: true
      });
    }
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

  handleShowPassword(event) {
    event.preventDefault();
    event.stopPropagation();
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
    const { loginError, loggedIn } = this.props;
    let messageClass = "login-error ";
    messageClass += loginError === true ? "show" : "hide";
    if (loggedIn === false) {
      return (
        <div className="hp-body-container">
          <div className="hp-overlay">
            <div className="hp-content">
              <p className="hp-tagline">
                Some great tagline about 3D stuff
              </p>
              <div className="hp-login-container">
                <div className="ui middle aligned center aligned grid">
                  <div className="column">
                    <Form
                      className="login-form"
                      onSubmit={this.handleSubmit}
                    >
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
                        type={(showPassword === true) ? "text" : "password"}
                        error={loginError}
                      />
                      <Message negative className={messageClass}>
                        <Message.Header>
                          There was a problem logging in!
                        </Message.Header>
                        <p>Username or password is incorrect</p>
                      </Message>
                      <Button
                        className="login-submit"
                        type="submit"
                        color="green"
                      >
                        Login
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
                <div className="hp-forgot-pass-container">
                  <a href="/">Sign Up</a>
                  <a href="/">Request New</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return <Redirect path="/" />;
    }
  }
}

function mapStateToProps(state) {
  return {
    loggedIn: state.views.user.loggedIn,
    loginError: state.views.user.loginError
  };
}

//donot connect to store
export default connect(mapStateToProps, { loginUser })(LoginContainer);
