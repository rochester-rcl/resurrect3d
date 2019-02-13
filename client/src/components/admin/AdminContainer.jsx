// React and Redux componets
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

// Material componnts
import {withStyles} from '@material-ui/core/styles';

//Stylings
import AdminContainerStyles from '../../assets/Admin/AdminContainerStyles'


import Header from '../ui/segments/Header';
import NavPills from '../ui/segments/NavPills';
import Footer from '../ui/segments/Footer';
import HeaderLinks from '../ui/segments/HeaderLinks';
import Parallax from '../ui/segments/Parallax';
import GridContainer from '../ui/segments/GridContainer';
import GridItem from '../ui/segments/GridItem';

class AdminContainer extends Component {

  render () {
    return (
      <div />
    );
  }
}

  export default (withStyles(AdminContainerStyles)(AdminContainer));
