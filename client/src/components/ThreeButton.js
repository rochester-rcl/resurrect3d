// React
import React, { Component } from "react";

// Semantic UI
import { Button, Label, Icon } from "semantic-ui-react";

// Device Detection for label content
import { DISPLAY_DEVICE } from "../constants/application";

export default class ThreeButton extends Component {
  state = {
    label: null
  };

  componentDidMount(): void {
    this.setState({
      label: this.props.content
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.content !== this.props.content) {
      this.setState({
        label: this.props.content,
      });
    }
  }

  constructor(props: Object) {
    super(props);
    (this: any).updateLabel = this.updateLabel.bind(this);
  }

  updateLabel(label: string) {
    this.setState({ label: label });
  }

  render() {
    const { className, icon, onClick, labelPosition, color } = this.props;
    const { label } = this.state;

    if (DISPLAY_DEVICE.SMARTPHONE()) {
      return (
        <Button
          className={className + " mobile"}
          icon={icon}
          onClick={onClick}
          color={color}
        />
      );
    } else {
      return (
        <Button
          className={className}
          icon={icon}
          onClick={onClick}
          labelPosition={labelPosition}
          color={color}
          content={label}
        />
      );
    }
  }
}
