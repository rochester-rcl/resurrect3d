// React and Redux componets
import React, {Component} from 'react';
import classNames from "classnames";
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

// Material-ui Icons
//import Camera from "@material-ui/icons/Camera";
import Palette from "@material-ui/icons/Palette";
import Favorite from "@material-ui/icons/Favorite";

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
    const {classes, theme, ...rest } = this.props;
    return (
      <div>
        <Header
          brand='Twit'
          rightLinks={
            <HeaderLinks

            />}
          fixed
          color="transparent"
          changeColorOnScroll={{
            height: 400,
            color: "info"
          }}
          {...rest}/>
        <Parallax image={require('../../assets/Images/bg4.jpg')}>
          <div className={classes.container}>
            <div className={classes.brand}>
              <h1 className={classes.title}>Twit</h1>
            </div>
          </div>
        </Parallax>
        <div className={classNames(classes.main, classes.mainRaised)}>
          <div className={classes.container}>
            <GridContainer justify="center">
              <GridItem xs={12} sm={12} md={8}>
                <div className={classes.profile}>
                  <div className={classes.name}>
                    <h2 className={classes.title}>Twit</h2>
                    <h3><small className={classes.defaultFont} >CSC 210 Final App</small></h3>
                  </div>
                </div>
              </GridItem>
            </GridContainer>
            <div className={classes.description}>
              <p className={classes.defaultFont}>
                A really kool, (yes we spell it with a k...) application
                that lets you read tweets using the twitter API and then see
                tone analysis on comments using IBM watson Api! Well... we think it's kool anyway!
                Play around abit and try it out!
              </p>
            </div>
            <GridContainer justify="center">
              <GridItem xs={12} sm={12} md={10}>
                <NavPills
                  alignCenter
                  color="info"
                  tabs={[
                    {
                      tabButton: "Home",
                      tabIcon: Favorite,
                      tabContent: (
                        <div/>
                      )
                    },
                    {
                      tabButton: "Work",
                      tabIcon: Palette,
                      tabContent: (
                        <div />
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
