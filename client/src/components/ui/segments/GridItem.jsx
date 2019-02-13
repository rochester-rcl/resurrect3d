import React, { Component } from 'react';

import Grid from "@material-ui/core/Grid";

import withStyles from "@material-ui/core/styles/withStyles";

const style = {
  grid: {
    position: "relative",
    width: "100%",
    minHeight: "1px",
    paddingRight: "15px",
    paddingLeft: "15px",
    flexBasis: "auto"
  }
};

class GridItem extends Component {

  render() {
    const {
      classes,
      children,
      className,
      ...rest } = this.props;
    return (
      <Grid
        item {...rest}
        className={classes.grid + " " + className}>
        {children}
      </Grid>
    );
  }

}

export default withStyles(style)(GridItem);
