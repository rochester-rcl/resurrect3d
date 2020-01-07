/* @flow */

// React
import React, { Component } from "react";

// THREEJS
import * as THREE from "three";

// Semantic UI
import { Button, Icon } from "semantic-ui-react";

// ThreeToggle
import ThreeToggle from "./ThreeToggle";

export default class ThreeMeasure extends Component {
  raycaster;

  defaultState = {
    active: false,
    points: {
      a: null,
      b: null,
      distance: null
    },
    secondClick: false
  };
  // Object spread doesn't do a deep copy so we need to do this
  state = {
    active: false,
    points: {
      a: null,
      b: null,
      distance: null
    },
    secondClick: false
  };
  constructor(props) {
    super(props);
    this.activate = this.activate.bind(this);
    this.measure = this.measure.bind(this);
    this.handleIntersection = this.handleIntersection.bind(this);
    this.reset = this.reset.bind(this);
    this.doCallback = this.doCallback.bind(this);
    this.raycaster = new THREE.Raycaster();
  }

  componentDidMount() {
    this.props.target.addEventListener("click", this.measure, true);
  }

  componentWillUnmount() {
    this.props.target.removeEventListener("click", this.measure, true);
  }

  activate() {
    this.setState(
      {
        active: !this.state.active
      },
      this.reset
    );
  }

  reset() {
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

  doCallback() {
    this.props.updateCallback(this.state.active ? this.state.points : null);
  }

  measure(event) {
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

  handleIntersection(intersection) {
    let { points } = this.state;
    if (!this.state.secondClick) {
      points.a = intersection.point;
      points.b = null;
      points.distance = null;
      this.setState(
        {
          points: points,
          secondClick: true
        },
        this.doCallback
      );
    } else {
      points.b = intersection.point;
      points.distance =
        points.a && points.b ? points.a.distanceTo(points.b) : null; // Need to figure out a way to enforce presence of 'a'
      this.setState(
        {
          points: points,
          secondClick: false
        },
        this.doCallback
      );
    }
  }

  render() {
    return (
      <div className="three-measure-tool-container">
        <ThreeToggle title="measure" callback={this.activate} />
      </div>
    );
  }
}
