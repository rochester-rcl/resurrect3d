import React, {Component} from 'react';
import classNames from "classnames";
import PropTypes from 'prop-types';

// Material comments
import {withStyles} from '@material-ui/core/styles';

// Stylings
import AdminSignUpStyles from '../../assets/Admin/AdminSignUpStyles';

class AdminAddViews extends Component {
  render () {
    const {classes, theme, ...rest} = this.props;
    return(
      <div className={classes.test}/>
    );
  }
}

export default (withStyles(AdminSignUpStyles)(AdminAddViews));
