/* @flow */

// React
import React, { Component } from 'react';

// Semantic UI
import { Dimmer, Loader, Segment, Progress, Accordion, Label, Icon, Message } from 'semantic-ui-react';


class LoaderModalError extends Component {
  state = { active: false }
  constructor(props: Object) {
    super(props);
    this.toggleActive = this.toggleActive.bind(this);
  }

  toggleActive(): void {
    this.setState({
      active: !this.state.active,
    });
  }

  render() {
    const { message } = this.props;
    const { active } = this.state;
    return(
      <Accordion inverted className="loader-modal-error-container">
        <Accordion.Title active={active} onClick={this.toggleActive}>
          <h1>There was an error!</h1>
          <Label className="loader-modal-error-label">
            <Icon className="loader-modal-error-icon" name="exclamation triangle"/>
            show error message
          </Label>
        </Accordion.Title>
        <Accordion.Content className="loader-modal-error-message" active={active}>
          <Message negative>{message}</Message>
        </Accordion.Content>
      </Accordion>
    );
  }
}

const LoaderModal = (props: Object) => {
  let { text, active, className, percent, error } = props;
  const message = (error === true) ? <LoaderModalError message={text} /> : <h1>{text}</h1>;
  if (percent) {
    return(
      <Dimmer className={className} active={active} as={Segment}>
        <Progress error={error} percent={percent} indicating progress color='green' />
        {message}
      </Dimmer>
    )
  } else {
    return (
      <Dimmer className={className} active={active} as={Segment}>
        <Loader size="huge">{message}</Loader>
      </Dimmer>
    )
  }
}

export default LoaderModal;
