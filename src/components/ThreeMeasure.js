/* @flow */

// React
import React, { Component } from 'react';

// THREEJS
import * as THREE from 'three';

// Semantic UI
import { Button, Icon } from 'semantic-ui-react';

export default class ThreeMeasure extends Component {

  raycaster: THREE.RayCaster;

  defaultState = {
    active: false,
    points: {
      a: null,
      b: null,
      distance: null,
    },
    secondClick: false,
  };
  // Object spread doesn't do a deep copy so we need to do this
  state = {
    active: false,
    points: {
      a: null,
      b: null,
      distance: null,
    },
    secondClick: false,
  };
  constructor(props: Object) {
    super(props);
    (this: any).activate = this.activate.bind(this);
    (this: any).measure = this.measure.bind(this);
    (this: any).handleIntersection = this.handleIntersection.bind(this);
    (this: any).reset = this.reset.bind(this);
    (this: any).doCallback = this.doCallback.bind(this);
    (this: any).raycaster = new THREE.Raycaster();
  }

  componentDidMount(): void {
    window.addEventListener('click', this.measure, true);
  }

  componentWillUnmount(): void {
    window.removeEventListener('click', this.measure, true);
  }

  activate(): void {
    this.setState({
      active: !this.state.active
    }, this.reset);
  }

  reset(): void {
    if (!this.state.active) {
      this.setState({
        ...this.defaultState
      }, this.doCallback)
    }
  }

  doCallback(): void {
    this.props.updateCallback( this.state.active ? this.state.points : null);
  }

  measure(event: MouseEvent): void {

    if (this.state.active) {
      let { camera, mesh, resolution } = this.props;
      let mouseVector = new THREE.Vector2();
      mouseVector.x = (event.clientX / resolution.width) * 2 - 1;
      mouseVector.y = -(event.clientY / resolution.height) * 2 + 1;
      this.raycaster.setFromCamera(mouseVector, camera);
      let intersections = this.raycaster.intersectObjects(mesh.children, true);
      // Only take the best result
      if (intersections.length > 0) this.handleIntersection(intersections[0]);
    }
  }

  handleIntersection(intersection: Object): void {
    let { points } = this.state;
    if (!this.state.secondClick) {
      points.a = intersection.point;
      points.b = null,
      points.distance = null,
      this.setState({
        points: points,
        secondClick: true
      }, this.doCallback);
    } else {
      points.b = intersection.point;
      points.distance = points.a && points.b ? points.a.distanceTo(points.b) : null; // Need to figure out a way to enforce presence of 'a'
      this.setState({
        points: points,
        secondClick: false
      }, this.doCallback);
    }
  }

  render() {
    return(
      <div className="three-measure-tool-container">
        <Button
          className="three-controls-button"
          content="measure"
          icon="pencil"
          onClick={this.activate}
          labelPosition='right'
          color="grey"
          active={this.state.active}
          inverted
        />
      </div>
    );
  }
}
