/* @flow */
import React, { Component } from "react";

// constants
import {
  WEBVR_ENTER,
  WEBVR_EXIT,
  WEBVR_NOT_SUPPORTED,
  WEBVR_DEVICE_NOT_FOUND,
  WEBVR_SUPPORT
} from "../../constants/application";

// button
import ThreeButton from '../ThreeButton';

export function checkVR() {
  if ('xr' in navigator) return true;
  if ('getVRDisplays' in navigator) return true;
  return false;
}

export default class ThreeWebVR extends Component {
  state = {
    vrActive: false,
    currentSession: null,
    displayStatus: WEBVR_SUPPORT.NOT_SUPPORTED
  };

  constructor(props: Object) {
    super(props);
    this.handleSessionStarted = this.handleSessionStarted.bind(this);
    this.handleSessionEnded = this.handleSessionEnded.bind(this);
    this.handleVRNotFound = this.handleVRNotFound.bind(this);
    this.handlePresentActivate = this.handlePresentActivate.bind(this);
    this.init = this.init.bind(this);
    this.setRendererSession = this.setRendererSession.bind(this);
    this.enterVR = this.enterVR.bind(this);
    this.enterXR = this.enterXR.bind(this);
    this.createButton = this.createButton.bind(this);
    this.enterCallback = null;
  }

  componentDidMount() {
    window.addEventListener("vrdisplayconnect", this.enterVR, false);
    window.addEventListener(
      "vrdisplaydisconnect",
      this.handleVRNotFound,
      false
    );
    window.addEventListener(
      "vrdisplayactivate",
      this.handlePresentActivate,
      false
    );
    this.init();
    // window.addEventListener('vrdisplaypresentchange', )
  }

  componentWillUnmount() {
    window.removeEventListener("vrdisplayconnect", this.enterVR, false);
    window.removeEventListener(
      "vrdisplaydisconnect",
      this.handleVRNotFound,
      false
    );
    window.removeEventListener(
      "vrdisplayactivate",
      this.handlePresentActivate,
      false
    );
  }

  init() {
    if ('xr' in navigator) {
      navigator.xr.requestDevice().then(device => {
        device
          .supportsSession({ immersive: true, exclusive: true })
          .then(() => { this.enterCallback = this.enterXR(device) })
          .catch(this.handleVRNotFound);
      });
    } else if ('getVRDisplays' in navigator) {
      navigator
        .getVRDisplays()
        .then(displays => {
          if (displays.length > 0) {
            this.enterCallback = this.enterVR(displays[0]);
          } else {
            this.handleVRNotFound();
          }
        })
        .catch(this.handleVRNotFound);
    } else {
      this.setState({
        displayStatus: WEBVR_SUPPORT.NOT_SUPPORTED
      });
      this.enterCallback = () => this.infoLink.click();
    }
  }

  handleSessionStarted(session) {
    session.addEventListener('end', this.handleSessionEnded);
    this.setState({
      currentSession: session,
      vrActive: true,
    }, () => {
      this.props.renderer.vr.setSession(this.state.currentSession);
    }, this.setRendererSession);
  }

  handleSessionEnded(event) {
    const { currentSession } = this.state;
    currentSession.removeEventListener('end', this.handleSessionEnded);
    this.setState({
      currentSession: null,
      vrActive: false
    }, this.setRendererSession)
  }

  handleVRNotFound(event) {
    this.setState({
      displayStatus: WEBVR_SUPPORT.DEVICE_NOT_FOUND
    });
  }

  handlePresentActivate (event) {

  }

  enterVR(device) {
    const { renderer } = this.props;
    renderer.setDevice(device);
    this.setState({
      displayStatus: WEBVR_SUPPORT.DEVICE_FOUND
    });
    return(() => {
      device.isPresenting ? device.exitPresent() : device.requestPresent([{ source: renderer.domElement }]);
    });
  }

  enterXR(device) {
    this.props.renderer.setDevice(device);
    this.setState({
      displayStatus: WEBVR_SUPPORT.DEVICE_FOUND
    });
    return (() => {
      const { currentSession } = this.state;
      if (currentSession === null) {
        device.requestSession({ immersive: true })
              .then(this.handleSessionStarted);
      } else {
        currentSession.end();
      }
    });
  }

  setRendererSession() {
    this.props.renderer.vr.setSession(this.state.currentSession);
  }

  createButton() {
    const { displayStatus, vrActive } = this.state;
    let { labelPosition, color, className } = this.props;
    let message;
    let icon;
    switch(displayStatus) {
      case WEBVR_SUPPORT.DEVICE_NOT_FOUND :
        message = WEBVR_DEVICE_NOT_FOUND;
        icon = 'question';
        break;

      case WEBVR_SUPPORT.DEVICE_FOUND:
        if (vrActive === true) {
          message = WEBVR_EXIT;
          icon = 'pause';
        } else {
          message = WEBVR_ENTER;
          icon = 'play';
        }
        break;

      default:
        message = WEBVR_NOT_SUPPORTED;
        icon = 'exclamation';
        break;
    }
    className = (className !== undefined) ? className : ''
    return(
      <div className="three-webvr-button-container">
        <ThreeButton
          className={'three-webvr-button ' + className}
          color={color}
          icon={icon}
          labelPosition={labelPosition}
          content={message}
          onClick={this.enterCallback}
        />
        <a
          ref={(ref) => this.infoLink = ref}
          className="three-webvr-info"
          href="https://webvr.info"
          target="_blank"
        />
      </div>
    );
  }

  render() {
    const { hideOnUnsupported } = this.props;
    return (
      (hideOnUnsupported === true) ? null : this.createButton()
    );
  }
}
