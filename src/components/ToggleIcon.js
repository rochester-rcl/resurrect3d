/* @flow */
import React, { Component } from "react";
import { Icon, Label, Button } from "semantic-ui-react";

export default class ToggleIcon extends Component {
  state = { toggled: false };

  constructor(props: Object) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event: SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.setState(
      {
        toggled: !this.state.toggled
      },
      () => this.props.onClick()
    );
  }

  render() {
    const {
      onIcon,
      offIcon,
      onColor,
      offColor,
      className,
      onClick,
      onLabel,
      offLabel
    } = this.props;

    let _className = className;
    const { toggled } = this.state;
    let _icon = offIcon;
    let _label = offLabel;
    let _color = offColor;
    if (toggled === true) {
      _icon = onIcon;
      _label = onLabel;
      _color = onColor;
    }

    return (
      <Button
        icon
        labelPosition='left'
        onClick={this.handleClick}
        color={_color}
        key={0}
        className="toggle-icon-label"
      >
        <Icon
          key={0}
          className={(_className += " toggle-icon")}
          id="show-password"
          name={_icon}
        />
        {_label}
      </Button>
    );
  }
}
