// React
import React, { Component } from "react";

// Semantic UI
import { Icon, Label, Button } from "semantic-ui-react";

// Components
import ThreeButton from "./ThreeButton";

// short uuid
const short = require("short-uuid");

export default class ThreeScreenshot extends Component {
  state = { url: null, filename: null, inBuffer: false };
  uuid = short();
  constructor(props: Object) {
    super(props);
    (this: any).captureScreenshot = this.captureScreenshot.bind(this);
    (this: any).handleClientDownload = this.handleClientDownload.bind(this);
  }

  captureScreenshot(): void {
    const { url, filename, inBuffer } = this.state;
    this.setState({
      url: this.props.renderer.domElement.toDataURL(this.props.mime),
      filename: this.uuid.new() + "." + this.props.extension,
      inBuffer: true
    });
  }

  handleClientDownload(event: SyntheticEvent): void {
    // let the default event propagate
    this.setState({
      inBuffer: false
    });
  }

  render() {
    const { extension } = this.props;
    const { url, filename, inBuffer } = this.state;
    let downloadClass = "three-data-download-link";

    return (
      <div className="three-screenshot-button-container">
        <ThreeButton
          content="screenshot"
          className="three-controls-button"
          icon="photo"
          onClick={this.captureScreenshot}
          labelPosition="right"
          color="grey"
        />
        <a
          href={url}
          download={filename}
          className={
            inBuffer ? (downloadClass += " show") : (downloadClass += " hide")
          }
          onClick={this.handleClientDownload}
        >
          <Label basic icon="cloud download" content="download" />
        </a>
      </div>
    );
  }
}
