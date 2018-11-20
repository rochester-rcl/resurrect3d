/* @flow */

// React
import React, { Component } from "react";

import { CompactPicker, GithubPicker } from "react-color";

import * as THREE from "three";

// three toggle
import ThreeToggle from './ThreeToggle';

// semantic-ui-react
import { Label, Segment, Checkbox, Button } from "semantic-ui-react";

const rgbString = (colorRGB: Object) => {
  let { r, g, b } = colorRGB;
  let rgb = [r, g, b];
  return new THREE.Color("rgb(" + rgb.join(",") + ")");
};

const stringToRGB = (hex: String) => {
  const color = new THREE.Color(parseInt(hex.substring(1), 16)).multiplyScalar(
    255
  );
  return {
    r: color.r,
    g: color.g,
    b: color.b
  };
};

const ThreeColorPicker = (props: Object) => {
  const { callback, title, color } = props;
  return (
    <Segment className="three-tool-component-container">
      <Label className="three-tool-component-label" attached="top left">
        {title}
      </Label>
      <div className="three-color-picker-container">
        <CompactPicker
          className="three-color-picker"
          color={color}
          onChangeComplete={color => callback(rgbString(color.rgb))}
        />
      </div>
    </Segment>
  );
};

export const ThreeMicroColorPicker = (props: Object) => {
  const { callback, title, color } = props;
  return (
    <Segment className="three-tool-component-container">
      <Label className="three-tool-component-label" attached="top left">
        {title}
      </Label>
      <div className="three-color-picker-container">
        <GithubPicker
          className="three-color-picker"
          color={color}
          onChangeComplete={color => callback(rgbString(color.rgb))}
        />
      </div>
    </Segment>
  );
};

export class ThreeEyeDropperColorPicker extends Component {
  state = {
    currentColor: {
      r: "255",
      g: "255",
      b: "255"
    },
    active: false
  };

  constructor(props: Object) {
    super(props);
    (this: any).pickColor = this.pickColor.bind(this);
    (this: any).activate = this.activate.bind(this);
    (this: any).handleChangeComplete = this.handleChangeComplete.bind(this);
  }

  activate(): void {
    this.setState({
      active: !this.state.active
    }, () => {
      if (this.props.onActiveCallback !== undefined) {
        this.props.onActiveCallback(this.state.active);
      }
    });
  }

  pickColor(event: SyntheticEvent): void {
    let { active } = this.state;
    if (active) {
      let { renderer, renderTarget } = this.props;
      let element = renderer.domElement;
      let rec = element.getBoundingClientRect();
      let mouseVector = new THREE.Vector2();
      // check for scaling
      let xScale = element.width / rec.width;
      let yScale = element.height / rec.height;
      // mouse vector must be in pixels relative to the canvas size
      mouseVector.x = (event.clientX - rec.left) * xScale;
      mouseVector.y = (event.clientY - rec.top) * yScale;
      // rgba
      let readBuffer = new Uint8Array(4);
      renderer.readRenderTargetPixels(
        renderTarget,
        mouseVector.x,
        element.height - mouseVector.y,
        1,
        1,
        readBuffer
      );
      const color = {
        rgb: {
          r: readBuffer[0],
          g: readBuffer[1],
          b: readBuffer[2]
        }
      };
      this.handleChangeComplete(color);
    }
  }

  handleChangeComplete(color: Object): void {
    this.setState(
      {
        currentColor: { ...color.rgb }
      },
      () => {
        this.props.callback(rgbString(this.state.currentColor));
      }
    );
  }

  componentDidMount(): void {
    this.props.renderer.domElement.addEventListener(
      "click",
      this.pickColor,
      true
    );
    if (this.props.color !== undefined) {
      // just like the others above we expect a hex string - need to add PropTypes for everything
      this.setState({
        currentColor: { ...stringToRGB(this.props.color) }
      });
    }
  }

  componentWillUnmount(): void {
    this.props.renderer.domElement.removeEventListener(
      "click",
      this.pickColor,
      true
    );
  }

  render() {
    const { renderer, renderTarget, title, color } = this.props;
    return (
      <Segment className="three-tool-component-container">
        <Label className="three-tool-component-label" attached="top left">
          {title}
        </Label>
        <div className="three-color-picker-container">
          <ThreeToggle title='pick color' callback={this.activate} />
          <CompactPicker
            className="three-color-picker"
            color={this.state.currentColor}
            onChangeComplete={this.handleChangeComplete}
          />
        </div>
      </Segment>
    );
  }
}

export default ThreeColorPicker;
