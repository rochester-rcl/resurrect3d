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
  touchControlRef: Object;
  width: number;
  height: number;
  baseClassName = 'three-touch-listener ';
  constructor(props: Object) {
    super(props);
    (this: any).handleTouch = this.handleTouch.bind(this);
    (this: any).handleTouchMove = this.handleTouchMove.bind(this);
    (this: any).handlePinch = this.handlePinch.bind(this);
    (this: any).handlePinchMove = this.handlePinchMove.bind(this);
    (this: any)._preparePinchCallback = this._preparePinchCallback.bind(this);
    (this: any)._preparePinchMoveCallback = this._preparePinchMoveCallback.bind(this);
    (this: any).pinchDistance = this.pinchDistance.bind(this);
    (this: any).normalizedPinchDistance = this.normalizedPinchDistance.bind(this);
    (this: any).pinchCenter = this.pinchCenter.bind(this);
    (this: any).distanceFromCenter = this.distanceFromCenter.bind(this);
    (this: any).setPinchVectors = this.setPinchVectors.bind(this);
    (this: any).toVec2Array = this.toVec2Array.bind(this);
  }

  componentDidMount(): void {
    this.width = this.touchControlRef.clientWidth;
    this.height = this.touchControlRef.clientHeight;
  }

  handleTouch(event: SyntheticEvent): void {
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

  handleTouchMove(event: SyntheticEvent): void {
    event.preventDefault();
    event.stopPropagation();
    let touches = event.nativeEvent.touches;
    if (touches.length > 1) {
      this.handlePinchMove(touches);
    } else {
      this.props.onTouchMoveCallback(touches[0]);
    }
  }

  handlePinch(touches: TouchList, type: string): void {
    this.setPinchVectors(touches, this._preparePinchCallback);
  }

  _preparePinchCallback(vecs: Array<THREE.Vector2>, touches: TouchList): void {
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

  handlePinchMove(touches: TouchList): void {
    this.setPinchVectors(touches, this._preparePinchMoveCallback);
  }

  _preparePinchMoveCallback(vecs: Array<THREE.Vector2>, touches: TouchList): void {
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
  pinchDistance(): number {
    let [vec1, vec2] = this.state.pinchVectors;
    return vec1.distanceTo(vec2);
  }
  // distance from touches in normalized screen coords
  normalizedPinchDistance(): number {
    let [vec1, vec2] = this.state.pinchVectors.map((vec) => {
      return new THREE.Vector2(vec.x / this.width, vec.y / this.height);
    });
    return vec1.distanceTo(vec2);
  }

  pinchCenter(): THREE.Vector2 {
    let [vec1, vec2] = this.state.pinchVectors;
    return vec1.add(vec2).divideScalar(2);
  }

  distanceFromCenter(vec1: THREE.Vector2, vec2: THREE.Vector2, center: THREE.Vector2): number {
    return Math.max(vec1.distanceTo(center), vec2.distanceTo(center));
  }

  setPinchVectors(touches: TouchList, callback: (vecs: Array<THREE.Vector2>, nativeTouches: TouchList) => void): void {
    this.setState({
      pinchVectors: this.toVec2Array(...touches),
    }, () => {
      if (callback) callback(this.state.pinchVectors, touches);
    });
  }

  toVec2Array(touch1: Touch, touch2: Touch): Array<THREE.Vector2> {
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
