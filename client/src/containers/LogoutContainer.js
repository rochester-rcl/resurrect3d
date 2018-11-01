import React, { Component } from "react";

// Redux
import { connect } from "react-redux";

import { Redirect } from 'react-router-dom';

// Loader
import LoaderModal from "../components/LoaderModal";

// Actions
import { logoutUser, resetLoginErrorMessage } from "../actions/UserActions";

// constants
import { BASENAME } from "../constants/api-endpoints";

const LogoutLoader = () => <LoaderModal active={true} text="Logging Out ..." />;

class Logout extends Component {
  componentDidMount() {
    this.props.logoutUser();
    this.props.resetLoginErrorMessage();
  }
  render() {
    const { loggedIn } = this.props.user;
    if (loggedIn === false) {
      return(
        <Redirect to={ BASENAME + '/admin/login'} />
      );
    } else {
      return(
        <LogoutLoader />
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
  };
}

export default connect(
  mapStateToProps,
  { logoutUser, resetLoginErrorMessage }
)(Logout);
