/* @flow */

// React
import React, { Component } from "react";

// THREEJS
import * as THREE from "three";

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
    open: true
  }

  state = {
    point: null,
    text: '',
    open: true
  }

  constructor(props: Object) {
    super(props);
  }

  doCallback(): void {
    this.props.callback(this.state);
  }

  render() {
    return null;
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
    annotations: [],
    points: []
  }

  state = {
    active: false,
    annotations: [],
    points: []
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
    for (let i = 0; i < this.state.annotations.length; i++) //Checked if clicked on existing annotation
    {
      console.log("Checking annotation " + i);
      if (this.state.points[i] == intersection)
      {
        this.state.annotations[i].state.open = !this.state.annotations[i].state.open; //Toggles open-ness
        clickedExisting = true;
      }
    }

    if (!clickedExisting)
    {
      let annotation = React.createElement(ThreeAnnotation);
      this.state.annotations.push( //Adds new annotation otherwise
        <ThreeAnnotation 
        point={intersection}
        />);
      this.state.points.push(intersection.point);
      console.log("Made new annotation");
    }
    this.doCallback();
  }

  doCallback(): void {
    console.log("Doing callback.");
    this.props.updateCallback(this.state.points);
  }

  render() {
    return (
      <div className="three-annotations-tool-container">
        <ThreeToggle title='annotations' callback={this.activate} />
      </div>
    );
  }
}
