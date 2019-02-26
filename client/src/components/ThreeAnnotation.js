/* @flow */

// React
import React, { Component } from "react";

// THREEJS
import * as THREE from "three";

// Semantic UI
import { Button, Icon, Input } from "semantic-ui-react";

// ThreeToggle
import ThreeToggle from './ThreeToggle';

export default class ThreeAnnotation extends Component
{
  /*
  * Basic idea: Contains a list of annotations, and functionality to add and delete. Handles clicks -- 
  * if left click on nothing, makes an annotation.
  * if left click on annotation, open/close annotation.
  */
  defaultState = {
    active: false,
    annotations: [],
    open: null
  }

  state = {
    active: false,
    annotations: [],
    open: null
  }

  constructor(props : Object) {
    super(props);
    (this: any).activate = this.activate.bind(this);
    (this: any).handleClick = this.handleClick.bind(this);
    (this: any).handleIntersection = this.handleIntersection.bind(this);
    (this: any).reset = this.reset.bind(this);
    (this: any).doCallback = this.doCallback.bind(this);
    (this: any).raycaster = new THREE.Raycaster();
  }

  componentDidMount(): void {
    this.props.target.addEventListener("click", this.handleClick, true);
  }

  componentWillUnmount(): void {
    this.props.target.removeEventListener("click", this.handleClick, true);
  }

  activate(): void {
    this.setState(
      {
        active: !this.state.active
      },
      this.reset
    );
  }

  reset(): void {
    if (!this.state.active) {
      this.setState(
        {
          ...this.defaultState
        },
        this.doCallback
      );
    }
    if (this.props.onActiveCallback) {
      this.props.onActiveCallback(this.state.active);
    }
  }

  handleClick(event: MouseEvent): void { //Copied directly from ThreeMeasure
    if (this.state.active) {
      let { camera, mesh } = this.props;

      let res = this.props.target.getBoundingClientRect();

      let mouseVector = new THREE.Vector2();
      mouseVector.x = ((event.clientX - res.x) / res.width) * 2 - 1;
      mouseVector.y = -((event.clientY - res.top) / res.height) * 2 + 1;
      this.raycaster.setFromCamera(mouseVector, camera);
      let meshArray = [];
      if (mesh.type === THREE.Group) {
        meshArray = mesh.children;
      } else {
        meshArray.push(mesh);
      }
      let intersections = this.raycaster.intersectObjects(meshArray, true);
      // Only take the best result
      if (intersections.length > 0) this.handleIntersection(intersections[0]);
    }
  }

  handleIntersection(intersection: Object): void 
  { 
    var clickedExisting = false;
    var newAnnotations = this.state.annotations.slice();
    for (let i = 0; i < newAnnotations.length; i++) //Checked if clicked on existing annotation
    {
      if (newAnnotations[i].point.distanceTo(intersection.point) <= 0.1)
      {
        clickedExisting = true;
        newAnnotations[i].open = !newAnnotations[i].open;
      }
    }

    if (!clickedExisting)
    {
      newAnnotations.push( //Adds new annotation otherwise
      {
        point: intersection.point,
        open: true,
        text: ""
      }
      );
    }
    this.setState(
    {
      annotations: newAnnotations
    });
    this.doCallback();
  }

  doCallback(): void {
    this.props.updateCallback(this.state.active ? this.state.annotations : null);
  }

  render() {
    return (
      <div className="three-annotations-tool-container">
        <ThreeToggle title='annotations' callback={this.activate} />
      </div>
    );
  }
}
