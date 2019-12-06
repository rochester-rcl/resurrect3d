import React from "react";
import ThreeAnnotationHeader from "./ThreeAnnotationHeader";
import ThreeAnnotationBody from "./ThreeAnnotationBody";
import GrowingTextArea from "./GrowingTextArea";

export default class ThreeAnnotation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: props.title,
      titleStyle: {},
      text: props.text,
      textStyle: {},
      needsUpdate: false
    };

    (this: any).updateTitle = this.updateTitle.bind(this);
    (this: any).updateText = this.updateText.bind(this);
    this.renderText = this.renderText.bind(this);
  }

  updateTitle(event): void {
    const { index, onUpdate } = this.props;
    const { needsUpdate } = this.state;
    this.setState(
      {
        title: event.target.value
      },
      () => {
        this.props.callback(index, this.state);
        if (!needsUpdate) {
          onUpdate(index);
        }
      }
    );
  }

  updateText(event): void {
    const { index, onUpdate } = this.props;
    const { needsUpdate } = this.state;
    this.setState(
      {
        text: event.target.value
      },
      () => {
        this.props.callback(this.props.index, this.state);
        if (!needsUpdate) {
          onUpdate(index);
        }
      }
    );
  }

  renderText() {
    const { editable } = this.props;
    const { text, textStyle } = this.state;
    if (editable) {
      return (
        <div className="annotation-body" style={textStyle}>
          <textarea
            defaultValue={this.state.text}
            type="text"
            onChange={this.updateText}
            className="text-area"
            readOnly={!editable}
          />
        </div>
      );
    } else {
      return text.length !== 0 ? <div className="text-area-read-only">{text}</div> : null;
    }
  }

  render() {
    const { innerRef, visible, editable } = this.props;
    if (visible) {
      return (
        <div ref={innerRef} className="annotation">
          <div className="annotation-head" style={this.state.titleStyle}>
            <textarea
              defaultValue={this.state.title}
              type="text"
              onChange={this.updateTitle}
              className="text-area"
              readOnly={!this.props.editable}
            />
          </div>
          {this.renderText()}
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}
