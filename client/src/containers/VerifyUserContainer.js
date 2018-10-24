import React, { Component } from "react";

// Redux
import { connect } from "react-redux";

// Actions
import { verifyUser } from "../actions/UserActions";

// Components
import VerifyUser from "../components/admin/VerifyUser";

class VerifyUserContainer extends Component {

  componentDidMount() {
    this.props.verifyUser(this.props.token);
  }

  render() {
    const { user } = this.props;
    // TODO this will be more fleshed out, but for now we'll just have the option to delete
    return(
      <div className="three-admin-verify-user-container">
        <VerifyUser verified={user.info.status} message={user.info.message} />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    token: ownProps.match.params.token,
  };
}

export default connect(
  mapStateToProps,
  { verifyUser }
)(VerifyUserContainer);
