/* @flow */

// React
import React from 'react';

// Semantic UI
import { Dimmer, Loader } from 'semantic-ui-react';

// Progress
import { Line } from 'rc-progress';

const LoaderModal = (props: Object) => {
  let { text, active, className, progress, progressColor } = props;
  return(
    <Dimmer className={className} active={active}>
      <Loader size='huge'>{text}</Loader>
      <Line percent={progress} strokeWidth="1" strokeColor={progressColor} />
    </Dimmer>
  );
}

export default LoaderModal;
