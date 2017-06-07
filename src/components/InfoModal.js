/* @flow */

// React
import React from 'react';

// Semantic UI
import { Dimmer, Loader, Grid } from 'semantic-ui-react';

const InfoModal = (props: Object) => {
  let { info, active, className } = props;
  console.log(active);
  return(
    <Dimmer className={className} active={active}>
      <Grid className='three-info-grid'>
        {info.map((pair, index) =>
          <Grid.Row className='three-info-grid-row' key={index} columns={2}>
            <Grid.Column className='info-grid-key'>
              <h1>{pair.key}</h1>
            </Grid.Column>
            <Grid.Column className='info-grid-val'>
              <h1>{pair.val}</h1>
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    </Dimmer>
  );
}

export default InfoModal;
