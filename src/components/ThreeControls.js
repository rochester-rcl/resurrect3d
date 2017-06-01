/* @flow */

// React
import React from 'react';

// Semantic UI
import { Button, Icon } from 'semantic-ui-react';

const ThreeControls = (props: Object) => {
  const { handleResetCamera, handleToggleHelpScreen } = props;
  return(
    <div className="three-controls-container">
      <Button
        className="three-controls-button"
        content="re-center"
        icon="crosshairs"
        onClick={() => { handleResetCamera() }}
        labelPosition='right'
        color="grey"
        inverted
      />
      <Button
        className="three-controls-button"
        content="info"
        icon="info"
        onClick={() => { handleToggleHelpScreen() }}
        labelPosition='right'
        color="grey"
        inverted
      />
    </div>
  );
}

export default ThreeControls;
