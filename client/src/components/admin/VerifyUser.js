/* @flow */

import React, { Component } from 'react';

// Semantic UI
import { Message } from 'semantic-ui-react';

// components
import LoaderModal from '../LoaderModal';

// React Router
import { Link } from 'react-router-dom';

// constants
import { BASENAME } from '../../constants/api-endpoints';

const verifyLoader = () => <LoaderModal active={true} text="Verifying Account ..." />;
const link = <Link className="three-admin-home-link" to={BASENAME + '/admin/login'}>Back to Login</Link>

const VerifyUser = (props: Object) => {
  const { verified, message } = props;
  if (verified === undefined) {
    return (
      verifyLoader()
    )
  } else {
    const msgHeader = (verified === true) ? "Success" : "Something Went Wrong!";
    return (
      <Message success={verified} className="three-admin-verify-message">
        <Message.Header>
          {msgHeader}
        </Message.Header>
        <Message.Content>
          {message}
        </Message.Content>
        <Message.Content className="three-admin-content-link">
          {link}
        </Message.Content>
      </Message>
    );
  }
}

export default VerifyUser;
