/* @flow */

// React
import React, { Component } from "react";

// THREEJS
import * as THREE from "three";

// Semantic UI
import { Accordion, Button, Icon, Input } from "semantic-ui-react";

// ThreeToggle
import ThreeToggle from './ThreeToggle';

export default class ThreeAnnotation extends Component
{
  raycaster: THREE.RayCaster;

  defaultState = {
    active: false,
    open: false,
    annotations: []
  };

  state = {
    active: false,
    open: false,
    annotations: []
  };


  constructor(props: Object)
  {
    super(props);

    (this: any).handleClick = this.handleClick.bind(this);
    (this: any).handleIntersection = this.handleIntersection.bind(this);
    (this: any).activate = this.activate.bind(this);
    (this: any).raycaster = new THREE.Raycaster();

    this.state = {
      active: false,
      annotations: []
    }
  }

  componentDidMount(): void {
    this.props.webGL.addEventListener("click", this.handleClick, true);
    this.props.css.addEventListener("click", this.handleClick, true);
  }

  componentWillUnmount(): void {
    this.props.webGL.removeEventListener("click", this.handleClick, true);
    this.props.css.removeEventListener("click", this.handleClick, true);
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

  componentDidUpdate(prevProps): void {
    if (this.props.open != prevProps.open)
      this.setState({ open: this.props.open });
  }

  handleClick(event: MouseEvent): void 
  {
    if (this.state.active) {
      let { camera, mesh } = this.props;

      let res = this.props.webGL.getBoundingClientRect();

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
    for (let i = 0; i < this.state.annotations.length && !clickedExisting; i++) //Checked if clicked on existing annotation
      if (this.state.annotations[i].point.distanceTo(intersection.point) <= 0.2)
      {
        clickedExisting = true;
        this.state.annotations[i].open = !this.state.annotations[i].open;
      }

    if (!clickedExisting)
    {
      for (let i = 0; i < this.state.annotations.length; i++)
        this.state.annotations[i].open = false;

      this.state.annotations.push({
        point: intersection.point,
        open: true,
        title: 'Untitled',
        text: '',
      });
    }
    this.doCallback();
  }

  doCallback(): void
  {
    this.props.updateCallback(this.state.annotations);
  }

  render() {
    return (
      <div className="three-annotation-tool-container">
        <ThreeToggle title='annotation' callback={this.activate} />
      </div>
    );
  }
}
