/* @flow */
import React, { Component } from 'react';

// React-router
import { Link } from 'react-router-dom';

// constants
import { BASENAME } from '../../constants/api-endpoints';

// semantic-ui-react
import { Dropdown, Menu, Icon } from 'semantic-ui-react';

const AdminMenu = (props: Object) => {
  const { active } = props;
  if (active === true) {
    const trigger = <Icon className="three-menu-admin-trigger" size="big" name="bars" />;
    return (
      <div className="three-menu-admin-container">
          <Dropdown className="three-menu-admin-dropdown" direction="left" trigger={trigger}>
            <Dropdown.Menu className="three-menu-admin">
              <Dropdown.Item>
                <Link to={BASENAME + '/admin/account'}>Account</Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link to={BASENAME + '/admin/views'}>My Meshes</Link>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>
                <Link to={BASENAME + '/admin/logout'}>Log Out</Link>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
      </div>
    );
  } else {
    return null;
  }
}

export default AdminMenu;
