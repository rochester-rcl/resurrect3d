/* @flow */

// React
import React, { Component } from 'react';

import { CompactPicker, GithubPicker } from 'react-color';

import * as THREE from 'three';

// semantic-ui-react
import { Label, Segment, Checkbox, Button } from 'semantic-ui-react';

const ThreeColorPicker = (props: Object) => {
  const { callback, title, color } = props;
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

export class ThreeEyeDropperColorPicker extends Component {

  state = {
    currentColor: '#fff',
    active: false,
  }

  constructor(props: Object) {
    super(props);
    (this: any).pickColor = this.pickColor.bind(this);
    (this: any).activate = this.activate.bind(this);
    (this: any).doCallback = this.doCallback.bind(this);
  }

  activate(): void {
    this.setState({
      active: !this.state.active,
    });
  }

  pickColor(event: SyntheticEvent): void {
    let { active } = this.state;
    if (active) {
      let { renderer, renderTarget } = this.props;
      let res = renderer.domElement.getBoundingClientRect();
      let mouseVector = new THREE.Vector2();
      mouseVector.x = (event.clientX - res.x);
      mouseVector.y = -(event.clientY - res.top);
      // rgba
      let readBuffer = new Uint8Array(4);
      renderer.readRenderTargetPixels(renderTarget, res.x, res.y, 1, 1, readBuffer);
      console.log(readBuffer[0]);
    }
  }

  doCallback(): void {

  }

  componentDidMount(): void {
    this.props.renderer.domElement.addEventListener('click', this.pickColor, true);
  }

  componentWillUnmount(): void {
    this.props.renderer.domElement.removeEventListener('click', this.pickColor, true);
  }

  render() {
    const { renderer, renderTarget, title } = this.props;
    return (
      <Segment className="three-tool-component-container">
        <Label className="three-tool-component-label" attached="top left">{title}</Label>
        <div className="three-color-picker-container">
          <Button
            className="three-controls-button"
            content="pick color"
            icon="eyedropper"
            onClick={this.activate}
            labelPosition='right'
            color="grey"
            active={this.state.active}
            inverted
          />
        </div>
      </Segment>
    );
  }
}

export default ThreeColorPicker;
