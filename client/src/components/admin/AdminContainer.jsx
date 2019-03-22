// React and Redux componets
import React, {Component} from 'react';
import classNames from "classnames";
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

// Material-ui Icons
//import Camera from "@material-ui/icons/Camera";
import Palette from "@material-ui/icons/Palette";
import Favorite from "@material-ui/icons/Favorite";
import Description from "@material-ui/icons/Description";

// Material componnts
import {withStyles} from '@material-ui/core/styles';

// Stylings
import AdminContainerStyles from '../../assets/Admin/AdminContainerStyles';

import Header from '../ui/segments/Header';
import NavPills from '../ui/segments/NavPills';
import Footer from '../ui/segments/Footer';
import HeaderLinks from '../ui/segments/HeaderLinks';
import Parallax from '../ui/segments/Parallax';
import GridContainer from '../ui/segments/GridContainer';
import GridItem from '../ui/segments/GridItem';

//Pill components
import AdminSignUp from './AdminSignUp';
import AdminViewLog from './AdminViewLog';
import AdminAddViews from './AdminAddViews';

//components
import ThreeViews from './ThreeViews';
import ThreeViewForm from './ThreeViewForm';
import ThreeViewDetails from './ThreeViewDetails';

class AdminContainer extends Component {

  render () {
    const {classes, theme, ...rest } = this.props;
    return (
      <div>
        <Header
          brand='Resurrect3D'
          rightLinks={
            <HeaderLinks

            />}
          fixed
          color="transparent"
          changeColorOnScroll={{
            height: 200,
            color: "custom"
          }}
          {...rest}/>
        <Parallax image={require('../../assets/Images/manu.jpg')}>
          <div className={classes.container}>
            <div className={classes.brand}>
              <h1 className={classes.title}>Resurrect3D</h1>
            </div>
          </div>
        </Parallax>
        <div className={classNames(classes.main, classes.mainRaised)}>
          <div className={classes.container}>
            <GridContainer justify="center">
              <GridItem xs={12} sm={12} md={8}>
                <div className={classes.profile}>
                  <div className={classes.name}>
                    <h2 className={classes.title}>Admin widget</h2>
                    {/*
                    <h3>
                      <small className={classNames(classes.defaultFont, classes.name)} >
                        Admin widget
                      </small>
                    </h3>
                    */}
                  </div>
                </div>
              </GridItem>
            </GridContainer>
            <div className={classes.description}>
              <p className={classes.defaultFont}>
                Use the pills below to add, view, and edit files
              </p>
            </div>
            <GridContainer justify="center">
              <GridItem xs={12} sm={12} md={10}>
                <NavPills
                  alignCenter
                  color="info"
                  tabs={[

                    {
                      tabButton: "Add View",
                      tabIcon: Palette,
                      tabContent: (
                        <ThreeViewForm/>
                      )
                    },
                    {
                      tabButton: "Change Views",
                      tabIcon: Description,
                      tabContent: (
                        <ThreeViewDetails/>
                      )
                    }
                  ]}
                />
              </GridItem>
            </GridContainer>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default (withStyles(AdminContainerStyles)(AdminContainer));
