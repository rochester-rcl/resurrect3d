/* @flow */

// React
import React from 'react';

// Semantic UI
import { Dimmer, Loader, Segment } from 'semantic-ui-react';

const LoaderModal = (props: Object) => {
  let { text, active, className } = props;
  return(
    <Dimmer className={className} active={active} as={Segment}>
      <h1>{ text }</h1>
    </Dimmer>
  );
}

export default LoaderModal;
