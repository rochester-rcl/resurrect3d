/* @flow */

// React
import React, { Component } from "react";

// semantic-ui-react
import { Label, Segment, Checkbox, Button } from "semantic-ui-react";

export class ThreeToggleMulti extends Component {
  state = { toggleButtons: [] };

  constructor(props: Object): void {
    super(props);
    (this: any).updateChecked = this.updateChecked.bind(this);
  }

  componentDidMount() {
    this.setState({ toggleButtons: this.props.buttons });
  }

  updateChecked(index: number): void {
    const { toggleButtons } = this.state;
    let cloned = toggleButtons.slice(0);
    cloned.forEach(button => {
      button.checked = false;
    });
    cloned[index].checked = !toggleButtons[index].checked;
    this.setState(
      {
        toggleButtons: cloned
      },
      () => {
        const { toggleButtons } = this.state;
        toggleButtons[index].callback(toggleButtons[index].checked);
      }
    );
  }

  render() {
    const { title } = this.props;
    const { toggleButtons } = this.state;
    return (
      <Segment className="three-tool-component-container">
        <Label className="three-tool-component-label" attached="top left">
          {title}
        </Label>
        <div className="three-tool-toggle-container">
          <div className="three-toggle-multi-container">
            {toggleButtons.map((button, index) => {
              const { toggle } = button;
              const toggleVal = (toggle === true || toggle === false) ? toggle : true;
              return(
                <div className="three-toggle-multi">
                  <span className="three-toggle-multi-label">{button.label}</span>
                  <Checkbox
                    className="three-tool-toggle"
                    checked={button.checked}
                    toggle={toggleVal}
                    radio={!toggleVal}
                    onClick={() => this.updateChecked(index)}
                  />
                  {(toggleVal === true) ?
                    <span className="three-toggle-status">
                      {button.checked ? "on" : "off"}
                    </span>
                    : null }

                </div>
              )
            })}
          </div>
        </div>
      </Segment>
    );
  }
}

export default class ThreeToggle extends Component {
  state = { checked: false };

  constructor(props: Object): void {
    super(props);
    (this: any).updateChecked = this.updateChecked.bind(this);
  }

  componentDidMount() {
    this.setState({ checked: this.props.defaultVal });
  }

  updateChecked(): void {
    let newVal = !this.state.checked;
    this.setState(
      {
        checked: newVal
      },
      () => { if (this.props.callback !== undefined) this.props.callback(newVal) }
    );
  }

  render() {
    const { title, toggle, size } = this.props;
    const { checked } = this.state;
    const toggleVal = (toggle !== true || toggle !== false) ? true : toggle;
    const buttonSize = size ? size : "medium"
    return (
      <Segment className="three-tool-component-container">
        <Label className="three-tool-component-label" attached="top left">
          {title}
        </Label>
        <div className="three-tool-toggle-container">
          <Button
            toggle
            active={checked}
            size={buttonSize}
            onClick={this.updateChecked}
          >
            {checked ? "on" : "off"}
          </Button>
        </div>
      </Segment>
    );
  }
}
