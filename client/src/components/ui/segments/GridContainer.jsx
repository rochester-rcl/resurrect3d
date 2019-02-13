import React, { Component } from 'react';

import Grid from "@material-ui/core/Grid";
import withStyles from "@material-ui/core/styles/withStyles";

const style = {
  grid: {
    marginRight: "-15px",
    marginLeft: "-15px",
    width: "auto"
  }
};
class GridContainer extends Component {

  render() {
    const {
      classes,
      children,
      className,
      ...rest } = this.props;
    return (
      <Grid
        container {...rest}
        className={classes.grid + " " + className}>
        {children}
      </Grid>
    );
  }
}

export default withStyles(style)(GridContainer);
