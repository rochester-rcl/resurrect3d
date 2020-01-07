import React, { Component, createRef } from "react";
// Redux
import ThreeButton from "./ThreeButton";

import { Modal, Form, Transition } from "semantic-ui-react";

import { Link } from "react-router-dom";

const hide = 1000;
const show = 2000;

export default class ThreeEmbed extends Component {
  state = { show: false, embedContent: "", copied: false };
  textRef = createRef();
  generateEmbedCode = () => {
    const { origin, pathname } = window.location;
    const embedPath = pathname.replace("models", "embed");
    return `<iframe src="${origin +
      embedPath}" width="1000" height="800" allowfullscreen="true" frameborder="0"></iframe>`;
  };
  getFullViewPath = () => {
    const { pathname } = window.location;
    const fullPath = pathname.replace("embed", "models");
    return fullPath;
  };
  toggle = () => {
    this.setState(prevState => ({
      show: !prevState.show,
      embedContent: this.generateEmbedCode()
    }));
  };
  updateEmbedContent = event => {
    this.setState(prevState => ({
      embedContent: this.textRef.current.value
    }));
  };
  copyEmbedContent = () => {
    if (this.textRef.current) {
      this.textRef.current.select();
      document.execCommand("copy");
      this.setState(prevState => ({ copied: true }));
    }
  };
  resetCopyStatus = () => {
    this.setState(prevState => ({ copied: false }));
  };
  render() {
    const { embedContent, copied } = this.state;
    const { embedded, readOnly } = this.props;
    const trigger = (
      <ThreeButton
        content="share"
        className="three-controls-button"
        icon="external share"
        labelPosition="right"
        color="grey"
        onClick={this.toggle}
      />
    );
    if (!embedded && !readOnly) {
      return (
        <Modal
          basic
          className="three-embed-modal"
          trigger={trigger}
          open={this.state.show}
          onClose={this.toggle}
        >
          <Modal.Header className="three-export-modal-header">
            Embed Viewer
          </Modal.Header>
          <Modal.Content>
            <Form className="three-embed-form" inverted>
              <Form.Field>
                <label>Embed Code</label>
                <textarea
                  ref={this.textRef}
                  value={embedContent}
                  onChange={this.updateEmbedContent}
                ></textarea>
              </Form.Field>
            </Form>
            <div className="three-embed-form-copy-container">
              <ThreeButton
                content="copy to clipboard"
                className="three-controls-button"
                icon="copy"
                labelPosition="right"
                color="grey"
                onClick={this.copyEmbedContent}
              />
              <Transition
                visible={copied}
                animation="fade"
                duration={{ hide, show }}
                onComplete={this.resetCopyStatus}
              >
                <h4 className="three-embed-copy-status">Copied</h4>
              </Transition>
            </div>
          </Modal.Content>
        </Modal>
      );
    } else if(embedded) {
      return (
        <Link target="_blank" to={this.getFullViewPath()}>
          <ThreeButton
            content="Go to Resurrect3D"
            className="three-controls-button"
            icon="cube"
            labelPosition="right"
            color="grey"
            onClick={this.copyEmbedContent}
          />
        </Link>
      );
    } else {
        return null;
    }
  }
}
