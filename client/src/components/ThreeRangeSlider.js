/* @flow */

// React
import React, { Component } from "react";

// semantic-ui-react
import { Label, Segment } from "semantic-ui-react";

// input range
import InputRange from "react-input-range";
import "react-input-range/lib/css/index.css";

export default class ThreeRangeSlider extends Component {
  state = {
    value: 0,
    minValue: 0,
    maxValue: 100
  };
  constructor(props) {
    super(props);
    this.updateRange = this.updateRange.bind(this);
    this.updateThreshold = this.updateThreshold.bind(this);
    this.resetToDefaults = this.resetToDefaults.bind(this);
  }

  componentDidMount() {
    this.setState({
      value: this.props.defaultVal,
      stepValue: this.props.step,
      minValue: this.props.min,
      maxValue: this.props.max,
      defaults: {
        stepValue: this.props.step,
        minValue: this.props.min,
        maxValue: this.props.max
      }
    });
  }

  updateRange(value, callback) {
    this.setState({ value: value }, () => {
      if (callback) callback(value);
    });
  }

  updateThreshold(minValue, maxValue, stepValue) {
    this.setState({
      minValue: minValue,
      maxValue: maxValue,
      stepValue: stepValue
    });
  }

  resetToDefaults() {
    let { minValue, maxValue, stepValue } = this.state.defaults;
    this.updateThreshold(minValue, maxValue, stepValue);
  }

  render() {
    const { callback, title } = this.props;
    const { minValue, maxValue, stepValue } = this.state;
    return (
      <Segment className="three-tool-component-container">
        <Label className="three-tool-component-label" attached="top left">
          {title}
        </Label>
        <InputRange
          className="three-range-slider"
          step={stepValue}
          maxValue={maxValue}
          minValue={minValue}
          draggableTrack={true}
          value={Number(this.state.value.toFixed(2))}
          onChange={value => this.updateRange(value, callback)}
        />
      </Segment>
    );
  }
}
