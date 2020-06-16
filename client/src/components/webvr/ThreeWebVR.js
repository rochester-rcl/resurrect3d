/* @flow */
import React, { Component } from "react";

// constants
import {
  WEBVR_ENTER,
  WEBVR_EXIT,
  WEBVR_NOT_SUPPORTED,
  WEBVR_DEVICE_NOT_FOUND,
  WEBVR_SUPPORT,
} from "../../constants/application";

// button
import ThreeButton from "../ThreeButton";

// polyfill
import WebXRPolyfill from "webxr-polyfill";
const polyfill = new WebXRPolyfill();

export function checkVR() {
  if ("xr" in navigator && "requestDevice" in navigator.xr) return true;
  if ("getVRDisplays" in navigator) return true;
  return false;
}

export default class ThreeWebVR extends Component {
  state = {
    vrActive: false,
    currentSession: null,
    displayStatus: WEBVR_SUPPORT.NOT_SUPPORTED,
  };

  constructor(props: Object) {
    super(props);
    this.handleSessionStarted = this.handleSessionStarted.bind(this);
    this.handleSessionEnded = this.handleSessionEnded.bind(this);
    this.handleVRNotFound = this.handleVRNotFound.bind(this);
    this.init = this.init.bind(this);
    this.setRendererSession = this.setRendererSession.bind(this);
    this.setRendererFrameOfReference = this.setRendererFrameOfReference.bind(
      this
    );
    this.enterXR = this.enterXR.bind(this);
    this.createButton = this.createButton.bind(this);
    this.enterCallback = null;
  }

  componentDidMount() {
    this.init();
    const { frameOfReference } = this.props;
    if (frameOfReference !== undefined) {
      this.setRendererFrameOfReference(frameOfReference);
    }
  }

  init() {
    if ("xr" in navigator) {
      this.props.renderer.xr.enabled = true;
      navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
        if (supported) {
          const init = {};
          this.enterCallback = this.enterXR(init);
        } else {
          this.setState({
            displayStatus: WEBVR_SUPPORT.NOT_SUPPORTED,
          });
          this.enterCallback = () => this.infoLink.click();
        }
      });
    }
  }

  handleSessionStarted(session) {
    session.addEventListener("end", this.handleSessionEnded);
    this.setState(
      {
        currentSession: session,
        vrActive: true,
      },
      this.setRendererSession
    );
  }

  handleSessionEnded(event) {
    const { currentSession } = this.state;
    currentSession.removeEventListener("end", this.handleSessionEnded);
    this.setState(
      {
        currentSession: null,
        vrActive: false,
      },
      this.setRendererSession
    );
  }

  handleVRNotFound(event) {
    this.setState({
      displayStatus: WEBVR_SUPPORT.DEVICE_NOT_FOUND,
    });
  }

  enterXR(options) {
    this.setState({
      displayStatus: WEBVR_SUPPORT.DEVICE_FOUND,
    });
    return () => {
      const { currentSession } = this.state;
      if (currentSession === null) {
        navigator.xr
          .requestSession("immersive-vr", options)
          .then(this.handleSessionStarted)
          .catch(this.handleVRNotFound);
      } else {
        currentSession.end();
      }
    };
  }

  setRendererSession() {
    const { currentSession } = this.state;
    const { onEnterCallback, onExitCallback, renderer } = this.props;
    if (currentSession === null) {
      if (onExitCallback !== undefined) onExitCallback();
    } else {
      if (onEnterCallback !== undefined) onEnterCallback();
    }
    this.props.renderer.xr.setSession(currentSession);
  }

  setRendererFrameOfReference(val) {
    this.props.renderer.xr.setReferenceSpaceType(val);
  }

  createButton() {
    const { displayStatus, vrActive } = this.state;
    let { labelPosition, color, className } = this.props;
    let message;
    let icon;
    switch (displayStatus) {
      case WEBVR_SUPPORT.DEVICE_NOT_FOUND:
        message = WEBVR_DEVICE_NOT_FOUND;
        icon = "question";
        break;

      case WEBVR_SUPPORT.DEVICE_FOUND:
        if (vrActive === true) {
          message = WEBVR_EXIT;
          icon = "pause";
        } else {
          message = WEBVR_ENTER;
          icon = "play";
        }
        break;

      default:
        message = WEBVR_NOT_SUPPORTED;
        icon = "exclamation";
        break;
    }
    className = className !== undefined ? className : "";
    return (
      <div className="three-webvr-button-container">
        <ThreeButton
          ref={(ref) => (this.vrButton = ref)}
          className={"three-webvr-button " + className}
          color={color}
          icon={icon}
          labelPosition={labelPosition}
          content={message}
          onClick={() => this.enterCallback()}
        />
        <a
          ref={(ref) => (this.infoLink = ref)}
          className="three-webvr-info"
          href="https://webvr.info"
          target="_blank"
        />
      </div>
    );
  }

  render() {
    const { hideOnUnsupported } = this.props;
    const { displayStatus } = this.state;
    if (
      hideOnUnsupported === true &&
      displayStatus === WEBVR_SUPPORT.NOT_SUPPORTED
    ) {
      return null;
    } else {
      return this.createButton();
    }
  }
}
