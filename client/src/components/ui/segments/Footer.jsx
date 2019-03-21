/*eslint-disable*/
import React, {Component} from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// nodejs library that concatenates classes
import classNames from "classnames";

import { List, ListItem, withStyles } from "@material-ui/core";

// @material-ui/icons
import Favorite from "@material-ui/icons/Favorite";

import footerStyle from '../../../assets/segments/FooterStyles';

class Footer extends Component {

  render(){
    const { classes, whiteFont } = this.props;

    const footerClasses = classNames({
      [classes.footer]: true,
      [classes.footerWhiteFont]: true
    });
    const aClasses = classNames({
      [classes.a]: true,
      [classes.footerWhiteFont]: true
    });
    return (
      <footer className={footerClasses}>
        <div className={classes.container}>
          <div className={classes.left}>
            <List className={classes.list}>
              <ListItem className={classes.inlineBlock}>
                <a
                  href="https://www.creative-tim.com/"
                  className={classes.block}
                  target="_blank">
                  Resurrect3D
                </a>
              </ListItem>
            </List>
          </div>
          <div className={classes.right}>
            &copy; {1900 + new Date().getYear()} , made with{" "}
            <Favorite className={classes.icon} /> by
            <a
              href="#"
              className={aClasses}
              target="_blank">
              University of Rochester Digital Scholarchip lab
            </a>
          </div>
        </div>
      </footer>
    );
  }
}

export default withStyles(footerStyle)(Footer);
