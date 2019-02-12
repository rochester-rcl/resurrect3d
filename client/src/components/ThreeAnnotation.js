/* @flow */

// React
import React, { Component } from "react";

// THREEJS
import * as THREE from "three";

import { Text, TextInput } from "react-native";

// Semantic UI
import { Button, Icon, Input } from "semantic-ui-react";

// ThreeToggle
import ThreeToggle from './ThreeToggle';

export class ThreeAnnotation extends Component 
{
  /*
  * Basic idea: Renders differently depending on if open or closed -- I still need to figure out how render method interacts with ThreeView and html better.
  * Contains text using React TextField component (?)
  */
  defaultState = {
    point: null,
    text: '',
    open: false
  }

  state = {
    point: null,
    text: '',
    open: false
  }

  constructor(props: Object) {
    super(props);
  }
}

export default class ThreeAnnotationGroup extends Component
{
  /*
  * Basic idea: Contains a list of annotations, and functionality to add and delete. Handles clicks -- 
  * if left click on nothing, makes an annotation.
  * if left click on annotation, open/close annotation.
  */
  defaultState = {
    active: false,
    annotations: []
  }

  state = {
    active: false,
    annotations: []
  }

  constructor(props : Object) {
    super(props);
    (this: any).activate = this.activate.bind(this);
    (this: any).handleClick = this.measure.bind(this);
    (this: any).handleIntersection = this.handleIntersection.bind(this);
    (this: any).reset = this.reset.bind(this);
    (this: any).doCallback = this.doCallback.bind(this);
    (this: any).raycaster = new THREE.Raycaster();
  }

  componentDidMount(): void {
    this.props.target.addEventListener("click", this.measure, true);
  }

  componentWillUnmount(): void {
    this.props.target.removeEventListener("click", this.measure, true);
  }

  activate(): void {
    this.setState(
      {
        active: !this.state.active
      },
      this.reset
    );
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
    boolean clickedExisting = false;
    for (int i = 0; i < annotations.length; i++) //Checked if clicked on existing annotation
      if (annotations[i].state.point == intersection)
      {
        annotations[i].state.open = !annotations[i].state.open; //Toggles open-ness
        clickedExisting = true;
      }

    if (!clickedExisting)
      this.state.annotations.push( //Adds new annotation otherwise
        <ThreeAnnotation 
        point = intersection,
        text = '',
        open = true
        />);
  }

  render() {
    return (
      <div className="three-annotations-tool-container">
        <ThreeToggle title='annotations' callback={this.activate} />
      </div>
    );
  }
}
