import React, {Component} from 'react';
import classNames from "classnames";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Hidden from "@material-ui/core/Hidden";
import Drawer from "@material-ui/core/Drawer";
// @material-ui/icons
import Menu from "@material-ui/icons/Menu";

import headerStyles from '../../../assets/segments/HeaderStyles';

class Header extends Component {
  state = {
    mobileOpen: false
  };

  constructor(props) {
    super(props);
    this.handleDrawerToggle = this.handleDrawerToggle.bind(this);
    this.headerColorChange = this.headerColorChange.bind(this);
  }

  componentWillUnmount() {
    if (this.props.changeColorOnScroll) {
      window.removeEventListener("scroll", this.headerColorChange);
    }
  }

  handleDrawerToggle() {
    this.setState({
      mobileOpen: !this.state.mobileOpen
    });
  }
  componentDidMount() {
    if (this.props.changeColorOnScroll) {
      window.addEventListener("scroll", this.headerColorChange);
    }
  }
  headerColorChange() {
    const {classes, color, changeColorOnScroll} = this.props;
    const windowsScrollTop = window.pageYOffset;
    if (windowsScrollTop > changeColorOnScroll.height) {
      document.body.getElementsByTagName("header")[0].classList.remove(classes[color]);
      document.body.getElementsByTagName("header")[0].classList.add(classes[changeColorOnScroll.color]);
    } else {
      document.body.getElementsByTagName("header")[0].classList.add(classes[color]);
      document.body.getElementsByTagName("header")[0].classList.remove(classes[changeColorOnScroll.color]);
    }
  }

  render() {
    const {
      classes,
      brand,
      color,
      fixed,
      absolute,
      rightLinks
    } = this.props;
    const appBarClasses = classNames({
      [classes.appBar]: true,
      [`classes.${color}`]: true,
      [classes.absolute]: true,
      [classes.fixed]: true
    });
    console.log(appBarClasses);
    return (
      <AppBar
        className={appBarClasses}>
        <Toolbar
          className={classes.container}>
          <Button className={classes.title}>{brand}</Button>
          <div
            className={classes.flex}>

          </div>
          <Hidden
            smDown={true}
            implementation="css">
            {rightLinks}
          </Hidden>
          <Hidden
            mdUp={true}>
            <IconButton
              color="inherit"
              aria-label="open drawer" onClick={this.handleDrawerToggle}>
              <Menu/>
            </IconButton>
          </Hidden>
        </Toolbar>

      <Hidden
        mdUp={true}
        implementation="css">
        <Drawer
          variant="temporary"
          anchor={"right"}
          open={this.state.mobileOpen}
          classes={{
            paper: classes.drawerPaper
          }}
          onClose={this.handleDrawerToggle}>
          <div
            className={classes.appResponsive}>
            {rightLinks}
          </div>
        </Drawer>
      </Hidden>
    </AppBar>);
  }
}

export default withStyles(headerStyles)(Header);
