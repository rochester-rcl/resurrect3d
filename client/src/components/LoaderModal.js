/* @flow */

// React
import React from 'react';

// Semantic UI
import { Dimmer, Loader, Segment, Progress } from 'semantic-ui-react';

const LoaderModal = (props: Object) => {
  let { text, active, className, percent } = props;

  if (percent) {
    return(
      <Dimmer className={className} active={active} as={Segment}>
        <h1>{ text }</h1>
        <Progress percent={percent} indicating progress color='green'/>
      </Dimmer>
    )
  } else {
    return (
      <Dimmer className={className} active={active} as={Segment}>
        <h1>{ text }</h1>
      </Dimmer>
    )
  }
}

export default LoaderModal;
