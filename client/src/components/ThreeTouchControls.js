/* @flow */

// React
import React, {
  Component
} from 'react';

// THREE
import * as THREE from 'three';

// constants
import { ZOOM_IN, ZOOM_OUT, PINCH_END, PINCH_START} from '../constants/application';

// ONLY SUPPORTS 2 FINGER PINCH
export default class ThreeTouchControls extends Component {
  state = {
    pinchDistanceFromCenter: 0,
    pinchVectors: new THREE.Vector2(),
  }
  touchControlRef;
  width;
  height;
  baseClassName = 'three-touch-listener ';
  constructor(props) {
    super(props);
    this.handleTouch = this.handleTouch.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handlePinch = this.handlePinch.bind(this);
    this.handlePinchMove = this.handlePinchMove.bind(this);
    this._preparePinchCallback = this._preparePinchCallback.bind(this);
    this._preparePinchMoveCallback = this._preparePinchMoveCallback.bind(this);
    this.pinchDistance = this.pinchDistance.bind(this);
    this.normalizedPinchDistance = this.normalizedPinchDistance.bind(this);
    this.pinchCenter = this.pinchCenter.bind(this);
    this.distanceFromCenter = this.distanceFromCenter.bind(this);
    this.setPinchVectors = this.setPinchVectors.bind(this);
    this.toVec2Array = this.toVec2Array.bind(this);
  }

  componentDidMount() {
    this.width = this.touchControlRef.clientWidth;
    this.height = this.touchControlRef.clientHeight;
  }

  handleTouch(event) {
    let touches = event.nativeEvent.touches;
    event.preventDefault();
    event.stopPropagation();
    switch (event.type) {

      case 'touchstart':
        if (touches.length > 1) {
          this.handlePinch(touches, PINCH_START);
        } else {
          this.props.onTouchStartCallback(touches[0], event.type);
        }
        break;

      case 'touchend':
        this.props.onPinchEndCallback(touches, PINCH_END);
        this.props.onTouchEndCallback(touches, event.type);
        break;

      default:
        break;
    }
  }

  handleTouchMove(event) {
    event.preventDefault();
    event.stopPropagation();
    let touches = event.nativeEvent.touches;
    if (touches.length > 1) {
      this.handlePinchMove(touches);
    } else {
      this.props.onTouchMoveCallback(touches[0]);
    }
  }

  handlePinch(touches, type) {
    this.setPinchVectors(touches, this._preparePinchCallback);
  }

  _preparePinchCallback(vecs, touches) {
    let distance = this.pinchDistance();
    let normalizedDistance = this.normalizedPinchDistance();
    let pinchCenter = this.pinchCenter();
    let distanceFromCenter = this.distanceFromCenter(vecs[0], vecs[1], pinchCenter);
    this.setState({
      pinchDistanceFromCenter: distanceFromCenter,
    }, () => {
      let pinchInfo = {
        distance: distance,
        normalizedDistance: normalizedDistance,
        clientCenter: pinchCenter,
        nativeTouches: touches,
      }
      this.props.onPinchStartCallback(pinchInfo, PINCH_START);
    });
  }

  handlePinchMove(touches) {
    this.setPinchVectors(touches, this._preparePinchMoveCallback);
  }

  _preparePinchMoveCallback(vecs, touches) {
    let pinchDistance = this.pinchDistance();
    let normalizedDistance = this.normalizedPinchDistance();
    let pinchCenter = this.pinchCenter();
    let distanceFromCenter = this.distanceFromCenter(vecs[0], vecs[1], pinchCenter);
    let zoomAction = (distanceFromCenter > this.state.pinchDistanceFromCenter) ?
      ZOOM_OUT : ZOOM_IN;
    let pinchDelta = this.state.pinchDistanceFromCenter - distanceFromCenter;
    this.setState({
      pinchDistanceFromCenter: distanceFromCenter,
    }, () => {
      this.props.onPinchMoveCallback({
        distance: pinchDistance,
        normalizedDistance: normalizedDistance,
        pinchDelta: pinchDelta,
        clientCenter: this.pinchCenter(...touches),
        nativeTouches: touches,
        zoomAction: zoomAction,
      });
    });
  }
  // distance from touches in pixels
  pinchDistance() {
    let [vec1, vec2] = this.state.pinchVectors;
    return vec1.distanceTo(vec2);
  }
  // distance from touches in normalized screen coords
  normalizedPinchDistance() {
    let [vec1, vec2] = this.state.pinchVectors.map((vec) => {
      return new THREE.Vector2(vec.x / this.width, vec.y / this.height);
    });
    return vec1.distanceTo(vec2);
  }

  pinchCenter() {
    let [vec1, vec2] = this.state.pinchVectors;
    return vec1.add(vec2).divideScalar(2);
  }

  distanceFromCenter(vec1, vec2, center) {
    return Math.max(vec1.distanceTo(center), vec2.distanceTo(center));
  }

  setPinchVectors(touches, callback) {
    this.setState({
      pinchVectors: this.toVec2Array(...touches),
    }, () => {
      if (callback) callback(this.state.pinchVectors, touches);
    });
  }

  toVec2Array(touch1, touch2) {
    return [
      new THREE.Vector2(touch1.clientX, touch2.clientY),
      new THREE.Vector2(touch2.clientX, touch2.clientY)
    ]
  }

  render() {
    const { className, children } = this.props;
    return(
      <span className={this.baseClassName += className ? className : ''}
        ref={(ref) => this.touchControlRef = ref}
        onTouchStart={this.handleTouch}
        onTouchEnd={this.handleTouch}
        onTouchMove={this.handleTouchMove}>
        {children}
      </span>
    );
  }

}
