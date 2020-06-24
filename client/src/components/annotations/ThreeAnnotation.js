import React from "react";
import { Transition } from "semantic-ui-react";

export default class ThreeAnnotation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: props.title,
      titleStyle: {},
      text: props.text,
      textStyle: {},
      needsUpdate: false,
      children: [],
    };

    (this: any).updateTitle = this.updateTitle.bind(this);
    (this: any).updateText = this.updateText.bind(this);
    this.renderText = this.renderText.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
  }

  updateTitle(event): void {
    const { index, onUpdate } = this.props;
    const { needsUpdate } = this.state;
    this.setState(
      {
        title: event.target.value,
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
        text: event.target.value,
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
    return (
      <div className="annotation-body" style={textStyle}>
        <textarea
          defaultValue={text}
          type="text"
          onChange={this.updateText}
          className="text-area"
          readOnly={!editable}
        />
      </div>
    );
  }

  renderTitle() {
    const { editable } = this.props;
    const { title, titleStyle } = this.state;
    return (
      <div className="annotation-head" style={titleStyle}>
        <textarea
          defaultValue={title}
          type="text"
          onChange={this.updateTitle}
          className="text-area"
          readOnly={!editable}
        />
      </div>
    );
  }

  render() {
    const { visible, innerRef, className, editable } = this.props;
    const cName = `annotation ${className ? className : ""}`;
    return (
      <Transition duration={1000} visible={visible} mountOnShow={false}>
        <div ref={innerRef} className={cName}>
          {this.renderTitle()}
          {editable ? this.renderText() : null}
        </div>
      </Transition>
    );
  }
}
