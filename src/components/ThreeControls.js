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
    handleToggleTools,
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
        content="lighting"
        icon="lightbulb"
        onClick={() => { handleToggleDynamicLighting() }}
        active={toggleState['dynamicLighting']}
        labelPosition='right'
        color="grey"
        inverted
      />
      <Button
        className="three-controls-button"
        content="background"
        icon="image"
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
      <Button
        inverted
        color="grey"
        labelPosition="right"
        content="tools"
        className="three-controls-button"
        icon="wrench"
        onClick={handleToggleTools}
      />
    </div>
  );
}

export default ThreeControls;
