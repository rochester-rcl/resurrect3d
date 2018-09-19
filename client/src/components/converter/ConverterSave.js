/* @flow */
import React, { Component } from "react";

// uuid
import * as THREE from "three";

// constants
import { GZIP_EXT } from "../../constants/application";

// semantic ui react
import { Form, Divider, Button } from "semantic-ui-react";

// React-Router
import { Redirect } from "react-router-dom";

export default class ConverterSave extends Component {
  state = {
    filename: THREE.Math.generateUUID(),
    url: null
  };

  constructor(props: Object) {
    super(props);
    this.onSave = this.onSave.bind(this);
    this.onName = this.onName.bind(this);
    this.performRedirect = this.performRedirect.bind(this);
    this.filesize = null;
    this.formatFileLabel = this.formatFileLabel.bind(this);
  }

  componentDidMount() {
    // set URL blob here
    const { file } = this.props;
    this.filesize = (file.length / 1048576).toFixed(2);
    this.setState({
      url: window.URL.createObjectURL(new Blob([file]))
    });
  }

  onSave(event: SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
    // get rid of the url, redirect to main converter
    this.downloadLink.click();
    this.setState({
      saved: true
    });
  }

  performRedirect(event: SynteticEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.props.restartConverter();
  }

  onName(event: SyntheticEvent, { value }): void {
    this.setState({
      filename: value
    });
  }

  formatFileLabel(): string {
    return (
      "current filename: " +
      this.state.filename +
      GZIP_EXT +
      " (" +
      this.filesize +
      " MB" +
      ")"
    );
  }

  render() {
    const { filename, url } = this.state;
    return (
      <Form inverted className="three-converter-form">
        <Divider className="three-converter-form-divider" inverted horizontal>
          Conversion Complete
        </Divider>
        <Form.Group className="three-converter-form-group">
          <Form.Input
            fluid
            className="three-converter-form-field"
            label={this.formatFileLabel()}
            onChange={this.onName}
            value={filename}
          />
        </Form.Group>
        <Form.Group className="three-converter-form-group">
          <Button
            size="large"
            className="three-converter-form-submit"
            color="green"
            onClick={this.onSave}
          >
            save
          </Button>
          <Divider className="three-converter-form-divider" inverted horizontal>
            or
          </Divider>
          <Button
            size="large"
            className="three-converter-form-submit"
            color="green"
            onClick={this.performRedirect}
          >
            convert another
          </Button>
          <a
            ref={ref => (this.downloadLink = ref)}
            href={url}
            download={filename + GZIP_EXT}
          />
        </Form.Group>
      </Form>
    );
  }
}
