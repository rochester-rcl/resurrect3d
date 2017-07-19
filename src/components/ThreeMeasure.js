/* @flow */

// React
import React, { Component } from 'react';

// THREEJS
import * as THREE from 'three';

// Semantic UI
import { Button, Icon } from 'semantic-ui-react';

export default class ThreeMeasure extends Component {
  state = {
    active: false,
    pointA: null,
    pointB: null,
    distance: 0,
  };

  constructor(props: Object) {
    super(props);
    (this: any).activate = this.activate.bind(this);
    (this: any).measure = this.measure.bind(this);
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
    });
  }

  measure(event: typeof MouseEvent): void {

    if (this.state.active) {
      let { camera, mesh, resolution } = this.props;
      let mouseVector = new THREE.Vector2();
      mouseVector.x = (event.clientX / resolution.width) * 2 - 1;
      mouseVector.y = (event.clientY / resolution.height) * 2 + 1;
      this.raycaster.setFromCamera(mouseVector, camera);
      let intersections = this.raycaster.intersectObjects(mesh.children);
      console.log(intersections);
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
