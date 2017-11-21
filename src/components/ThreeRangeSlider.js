/* @flow */

// React
import React, { Component } from 'react';

// semantic-ui-react
import { Label, Segment } from 'semantic-ui-react';

// input range
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';

export default class ThreeRangeSlider extends Component {
  state: Object = {
    value: 0,
  };
  constructor(props: Object) {
    super(props);
    (this: any).updateRange = this.updateRange.bind(this);
  }

  componentDidMount(): void {
    this.setState({ value: this.props.defaultVal });
  }

  updateRange(value: Number, callback: any): void {
    this.setState({ value: value }, () => {
      if (callback) callback(value);
    });
  }

  render() {
    const { min, max, step, callback, title } = this.props;
    return(
      <Segment className="three-tool-component-container">
        <Label className="three-tool-component-label" attached="top left">{title}</Label>
        <InputRange
          className="three-range-slider"
          step={step}
          maxValue={max}
          minValue={min}
          draggableTrack={true}
          value={Number(this.state.value.toFixed(2))}
          onChange={(value) => this.updateRange(value, callback)}
        />
      </Segment>
    );
  }
}
