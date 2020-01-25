import * as React from "react";

type AnnotationState = {
  title: string;
  titleStyle: Object;
  text: string;
  textStyle: Object;
  needsUpdate: boolean;
}

type AnnotationProps = {
  title: string;
  text: string;
  index: number;
  editable: boolean;
  onUpdate: (num: number) => void;
  callback: (num: number, obj: Object) => void;
  innerRef: React.RefObject<HTMLDivElement>;
  visible: boolean;
}

export default class ThreeAnnotation extends React.Component<AnnotationProps, AnnotationState> {

  constructor(props: AnnotationProps) {
    super(props);

    this.state = {
      title: props.title,
      titleStyle: {},
      text: props.text,
      textStyle: {},
      needsUpdate: false,
    };

    this.updateTitle = this.updateTitle.bind(this);
    this.updateText = this.updateText.bind(this);
    this.renderText = this.renderText.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
  }

  updateTitle(event: React.ChangeEvent<HTMLTextAreaElement>): void {
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

  updateText(event: React.ChangeEvent<HTMLTextAreaElement>): void {
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
            defaultValue={text}
            //type="text"
            onChange={this.updateText}
            className="text-area"
            readOnly={!editable}
          />
        </div>
      );
    }
  }

  renderTitle() {
    const { editable } = this.props;
    const { title, titleStyle } = this.state;
    return (
      <div className="annotation-head" style={titleStyle}>
        <textarea
          defaultValue={title}
          //type="text"
          onChange={this.updateTitle}
          className="text-area"
          readOnly={!editable}
        />
      </div>
    );
  }

  render() {
    const { innerRef, visible, editable } = this.props;
    if (visible) {
      return (
        <div ref={innerRef} className="annotation">
          {this.renderTitle()}
          {this.renderText()}
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}
