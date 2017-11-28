/* @flow */

// React
import React, { Component } from 'react';

import { CompactPicker, GithubPicker } from 'react-color';

import * as THREE from 'three';

// semantic-ui-react
import { Label, Segment, Checkbox } from 'semantic-ui-react';

const ThreeColorPicker = (props: Object) => {
  const { callback, title } = props;
  const rgbString = (colorRGB: Object) => {
    let { r, g, b } = colorRGB;
    let rgb = [r, g, b];
    return( new THREE.Color('rgb(' + rgb.join(',') + ')'));
  }
  return (
    <Segment className="three-tool-component-container">
      <Label className="three-tool-component-label" attached="top left">{title}</Label>
      <div className="three-color-picker-container">
        <CompactPicker
          className="three-color-picker"
          onChangeComplete={(color) => callback(rgbString(color.rgb))}
        />
      </div>
    </Segment>
  )
}

export const ThreeMicroColorPicker = (props: Object) => {
  const { callback, title } = props;
  const rgbString = (colorRGB: Object) => {
    let { r, g, b } = colorRGB;
    let rgb = [r, g, b];
    return( new THREE.Color('rgb(' + rgb.join(',') + ')'));
  }
  return (
    <Segment className="three-tool-component-container">
      <Label className="three-tool-component-label" attached="top left">{title}</Label>
      <div className="three-color-picker-container">
        <GithubPicker
          className="three-color-picker"
          onChangeComplete={(color) => callback(rgbString(color.rgb))}
        />
      </div>
    </Segment>
  )
}

export default ThreeColorPicker;
