import React, { Component } from "react";

// Redux
import { connect } from "react-redux";

import { Redirect } from "react-router-dom";

// Actions
import { deleteUser } from "../actions/UserActions";

// Semantic UI
import { Segment, Divider } from "semantic-ui-react";

// constants
import { BASENAME } from "../constants/api-endpoints";

// components
import DeleteAccount from "../components/admin/DeleteAccount";

class AccountContainer extends Component {
  constructor(props: Object) {
    super(props);
    this.handleDeleteUser = this.handleDeleteUser.bind(this);
  }

  handleDeleteUser() {
    this.props.deleteUser(this.props.user.info.id);
  }

  render() {
    const { user } = this.props;
    // TODO this will be more fleshed out, but for now we'll just have the option to delete
    return (
      <div className="three-admin-account-settings-container">
        <Divider
          className="three-admin-account-settings-divider"
          horizontal
          inverted
        >
          My Account
        </Divider>
        <DeleteAccount
          onDelete={this.handleDeleteUser}
          user={user}
          onSuccessRedirect={<Redirect to={BASENAME + "/admin/login"} />}
        />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user
  };
}

export default connect(
  mapStateToProps,
  { deleteUser }
)(AccountContainer);
