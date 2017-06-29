/* @flow */

// React
import React from 'react';

// Semantic UI
import { Button, Icon } from 'semantic-ui-react';

const ThreeControls = (props: Object) => {
  const {
    handleResetCamera,
    handleToggleInfo,
    handleToggleBackground,
    handleToggleDynamicLighting,
    toggleState,
  } = props;
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
        content="dynamic lighting"
        icon="lightbulb"
        onClick={() => { handleToggleDynamicLighting() }}
        active={toggleState['dynamicLighting']}
        labelPosition='right'
        color="grey"
        inverted
      />
      <Button
        className="three-controls-button"
        content="detail mode"
        icon="camera retro"
        onClick={() => { handleToggleBackground() }}
        labelPosition='right'
        active={toggleState['detailMode']}
        color="grey"
        inverted
      />
      <Button
        className="three-controls-button"
        content="info"
        icon="info"
        onClick={() => { handleToggleInfo() }}
        labelPosition='right'
        color="grey"
        inverted
      />
    </div>
  );
}

export default ThreeControls;
