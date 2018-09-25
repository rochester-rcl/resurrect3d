/* @flow */

// React
import React from "react";

// Semantic UI
import { Dimmer, Loader, Grid } from "semantic-ui-react";

const InfoModal = (props: Object) => {
  let { info, active, className } = props;
  return (
    <Dimmer className={className} active={active}>
      {info.map((pair, index) => (
        <Grid className="three-info-grid">
          <Grid.Row className="three-info-grid-row-odd" key={index} columns={1}>
            <Grid.Column className="info-grid-key">
              <h2>{pair.label}</h2>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row
            className="three-info-grid-row-even"
            key={index + 1}
            columns={1}
          >
            <Grid.Column className="info-grid-val">
              <span className="three-info-grid-val-text">{pair.value}</span>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      ))}
    </Dimmer>
  );
};

export default InfoModal;
