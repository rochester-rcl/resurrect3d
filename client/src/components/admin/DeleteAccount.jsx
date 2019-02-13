/* @flow */

import React, { Component } from "react";

// Semantic UI
import { Button, Confirm, Icon, Message } from "semantic-ui-react";

// components
import LoaderModal from "../LoaderModal";

// React Router
import { Link } from "react-router-dom";

// constants
import { BASENAME } from "../../constants/api-endpoints";

const link = (
  <Link className="three-admin-home-link" to={BASENAME + "/admin/login"}>
    Back to Login
  </Link>
);

export default class DeleteAccount extends Component {
  state = { open: false, deleteAttempted: false, redirectTimeout: 0 };
  constructor(props: Object) {
    super(props);
    this.onDelete = this.onDelete.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }

  onDelete() {
    this.setState(
      {
        deleteAttempted: true
      },
      () => {
        this.props.onDelete();
        this.close();
      }
    );
  }

  open() {
    this.setState({
      open: true
    });
  }

  close() {
    this.setState({
      open: false
    });
  }

  render() {
    const { open, deleteAttempted, deleteTimeout } = this.state;
    const { user } = this.props;
    const { message, status } = user.info;
    if (deleteAttempted === true) {
      const msgHeader =
        status === true
          ? "Your Account Was Successfully Deleted. You will be Redirected to the Login Screen in 5 seconds."
          : "There was an Problem Deleting Your Account";
      return (
        <Message success={status} className="three-admin-verify-message">
          <Message.Header>{msgHeader}</Message.Header>
          <Message.Content>{message}</Message.Content>
          <Message.Content className="three-admin-content-link">
            {link}
          </Message.Content>
        </Message>
      );
    } else {
      return (
        <div className="three-admin-delete-account-container">
          <Button
            className="three-admin-button-confirm"
            onClick={this.open}
            icon
            labelPosition="left"
          >
            <Icon name="user delete" />
            Delete My Account
          </Button>
          <Confirm
            content="Are you sure you wanto to delete your account? This can't be undone."
            className="three-admin-confirm"
            open={open}
            onCancel={this.close}
            onConfirm={this.onDelete}
          />
        </div>
      );
    }
  }
}
