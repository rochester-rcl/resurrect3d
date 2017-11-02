/* @flow */

// React
import React, { Component } from 'react';

// semantic-ui-react
import { Label, Segment, Checkbox } from 'semantic-ui-react';

export default class ThreeToggle extends Component {
  state = { checked: false }

  constructor(props: Object): void {
    super(props);
    this.updateChecked = this.updateChecked.bind(this);
  }

  componentDidMount() {
    this.setState({ checked: this.props.defaultVal });
  }

  updateChecked(): void {
    let newVal = !this.state.checked;
    this.setState({
      checked: newVal
    }, this.props.callback(newVal));
  }

  render() {
    const { title } = this.props;
    const { checked } = this.state;
    return(
      <Segment className="three-tool-component-container">
        <Label className="three-tool-component-label" attached="top left">{title}</Label>
        <div className="three-tool-toggle-container">
          <Checkbox
            className="three-tool-toggle"
            checked={checked}
            toggle
            onClick={this.updateChecked}
          />
          <span className="three-toggle-status">{ checked ? 'on' : 'off'}</span>
        </div>
      </Segment>
    );
  }
}
