/* @flow */

// React
import React, { Component } from "react";

// semantic-ui-react
import { Label, Segment, Icon, Button } from "semantic-ui-react";
import ThreeToggle from "../ThreeToggle";

export default class ThreeAnnotationShortcut extends Component {
  state = { settings: { useCamera: false, useLights: false } };
  constructor(props) {
    super(props);
    this.focus = this.focus.bind(this);
    this.del = this.del.bind(this);
    this.save = this.save.bind(this);
  }
  focus() {
    this.props.focus(this.props.index);
  }

  del() {
    this.props.delete(this.props.index);
  }

  save() {}
  render() {
    const { title } = this.props;
    return (
      <Segment className="annotation-shortcut-container">
        <Label className="annotation-shortcut-title">{title}</Label>
        <div className="annotation-shortcut-button-container">
          <Button
            icon
            onClick={this.focus}
            className="annotation-shortcut-button"
            size="mini"
          >
            <Icon
              color="grey"
              className="annotation-shortcut-icon"
              name="eye"
              size="large"
            />
          </Button>
          <Button
            icon
            onClick={this.save}
            className="annotation-shortcut-button"
            size="mini"
          >
            <Icon
              color="grey"
              className="annotation-shortcut-icon"
              name="save"
              size="large"
            />
          </Button>
          <Button
            icon
            onClick={this.del}
            className="annotation-shortcut-button"
            size="mini"
          >
            <Icon
              color="grey"
              className="annotation-shortcut-icon"
              name="close"
              size="large"
            />
          </Button>
        </div>
        <div className="annotation-shortcut-settings-container">
          <ThreeToggle
            callback={val => console.log(val)}
            defaultVal={false}
            title="use camera position"
            size="mini"
          />
          <ThreeToggle
            callback={val => console.log(val)}
            defaultVal={false}
            title="use light settings"
            size="mini"
          />
        </div>
      </Segment>
    );
  }
}
