/* @flow */

// React
import React, { Component } from "react";

// semantic-ui-react
import { Label, Segment, Icon, Button } from "semantic-ui-react";
import ThreeToggle from "../ThreeToggle";

import {
  ANNOTATION_SAVE_STATUS,
  ANNOTATION_SETTINGS_OPTIONS
} from "../../constants/application";

export default class ThreeAnnotationShortcut extends Component {
  state = { settings: { useCamera: false, useLights: false } };
  constructor(props) {
    super(props);
    this.focus = this.focus.bind(this);
    this.del = this.del.bind(this);
    this.save = this.save.bind(this);
    this.saveStatusLabel = this.saveStatusLabel.bind(this);
    this.handleSettingsChange = this.handleSettingsChange.bind(this);
    this.updateIndex = this.updateIndex.bind(this);
    this.renderReadOnly = this.renderReadOnly.bind(this);
    this.renderAdminMode = this.renderAdminMode.bind(this);
  }

  focus() {
    this.props.focus(this.props.index);
  }

  del() {
    this.props.delete(this.props.index);
  }

  save() {
    this.props.save(this.props.index);
  }

  handleSettingsChange(settingsKey, value) {
    const { index, onSettingsUpdate } = this.props;
    onSettingsUpdate(index, settingsKey, value);
  }

  updateIndex(direction) {
    const { index, onUpdateIndex, total } = this.props;
    const dst = direction ? index + 1 : index - 1;
    let canUpdate = false;
    if (direction) {
      if (dst <= total - 1) {
        canUpdate = true;
      }
    } else {
      if (dst >= 0) {
        canUpdate = true;
      }
    }
    if (canUpdate) {
      onUpdateIndex(index, dst, this.scrollToShortcut);
    }
  }

  saveStatusLabel() {
    const { saveStatus } = this.props;
    switch (saveStatus) {
      case ANNOTATION_SAVE_STATUS.SAVED:
        return (
          <Label className="annotation-status-label" size="mini" color="green">
            saved
          </Label>
        );
      case ANNOTATION_SAVE_STATUS.NEEDS_UPDATE:
        return (
          <Label className="annotation-status-label" size="mini" color="yellow">
            needs update
          </Label>
        );
      default:
        return (
          <Label className="annotation-status-label" size="mini" color="red">
            unsaved
          </Label>
        );
    }
  }

  renderReadOnly() {
    const { title, innerRef } = this.props;
    return (
      <div ref={innerRef} className="annotation-shortcut-container">
        <span className="annotation-shortcut-label-container">
          <Label className="annotation-shortcut-title">{title}</Label>
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
        </span>
      </div>
    );
  }

  renderAdminMode() {
    const { title, innerRef, total, index } = this.props;
    return (
      <div ref={innerRef} className="annotation-shortcut-container">
        <span className="annotation-shortcut-label-container">
          <Label className="annotation-shortcut-title">{title}</Label>
          {this.saveStatusLabel()}
        </span>
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
          <Button
            icon
            onClick={() => this.updateIndex(true)}
            className="annotation-shortcut-button"
            size="mini"
          >
            <Icon
              color={index + 1 <= total - 1 ? "grey" : "red"}
              className="annotation-shortcut-icon"
              name="plus"
              size="large"
            />
          </Button>
          <Button
            icon
            onClick={() => this.updateIndex(false)}
            className="annotation-shortcut-button"
            size="mini"
          >
            <Icon
              color={index - 1 >= 0 ? "grey" : "red"}
              className="annotation-shortcut-icon"
              name="minus"
              size="large"
            />
          </Button>
        </div>
        <div className="annotation-shortcut-settings-container">
          <ThreeToggle
            callback={val =>
              this.handleSettingsChange(
                ANNOTATION_SETTINGS_OPTIONS.CAMERA_POSITION,
                val
              )
            }
            defaultVal={false}
            title="save camera data"
            size="mini"
          />
          <ThreeToggle
            callback={val => console.log(val)}
            defaultVal={false}
            title="save light data"
            size="mini"
          />
        </div>
      </div>
    );
  }

  render() {
    const { readOnly } = this.props;
    if (!readOnly) return this.renderAdminMode();
    return this.renderReadOnly();
  }
}
