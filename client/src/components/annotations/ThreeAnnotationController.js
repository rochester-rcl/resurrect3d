/* @flow */

// React
import React, { Component, forwardRef } from "react";
import ReactDom from "react-dom";

// THREEJS
import * as THREE from "three";

// UI
import ThreeToggle from "./../ThreeToggle";
import ThreeGUI from "./../ThreeGUI";

//ThreeAnnotation
import ThreeAnnotation from "./ThreeAnnotation";
import ThreeAnnotationShortcut from "./ThreeAnnotationShortcut";
import PortalElement from "./PortalElement";

// Redux
import { connect } from "react-redux";

// Action Creators
import { loadAnnotations, saveAnnotation } from "../../actions/AnnotationActions";

class ThreeAnnotationController extends Component {
  raycaster: THREE.RayCaster;

  constructor(props: Object) {
    super(props);

    (this: any).handleDown = this.handleDown.bind(this);
    (this: any).handleMove = this.handleMove.bind(this);
    (this: any).handleUp = this.handleUp.bind(this);
    (this: any).handleIntersection = this.handleIntersection.bind(this);
    (this: any).makeAnnotation = this.makeAnnotation.bind(this);
    (this: any).updateAnnotation = this.updateAnnotation.bind(this);
    (this: any).viewAnnotation = this.viewAnnotation.bind(this);
    (this: any).deleteAnnotation = this.deleteAnnotation.bind(this);
    (this: any).toggle = this.toggle.bind(this);
    (this: any).toggleEdit = this.toggleEdit.bind(this);
    (this: any).raycaster = new THREE.Raycaster();
    this.verifyAnnotationComponentRendered = this.verifyAnnotationComponentRendered.bind(
      this
    );

    this.state = {
      mousedown: false,
      dragging: false,
      active: false,
      open: false,
      editable: true,
      annotations: []
    };
  }

  componentDidMount(): void {
    const { css } = this.props;
    this.props.loadAnnotations();
    css.addEventListener("mousedown", this.handleDown, true);
    css.addEventListener("mousemove", this.handleMove, true);
    css.addEventListener("mouseup", this.handleUp, true);
    css.style.pointerEvents = "auto";
  }

  componentWillUnmount(): void {
    const { css } = this.props;
    css.removeEventListener("mousedown", this.handleDown, true);
    css.removeEventListener("mousemove", this.handleMove, true);
    css.removeEventListener("mouseup", this.handleUp, true);
    css.style.pointerEvents = "none";
  }

  toggle(): void {
    const { active } = this.state;
    this.setState(
      {
        active: !active
      },
      this.reset
    );
  }

  toggleEdit(): void {
    this.setState({
      editable: !this.state.editable
    });
  }

  reset(): void {
    this.props.drawCallback();
    this.setState({ annotations: [] });

    if (this.props.onActiveCallback)
      this.props.onActiveCallback(this.state.active);
  }

  componentDidUpdate(prevProps, prevState): void {
    const { editable } = this.state;
    const { css } = this.props;
    if (this.props.open != prevProps.open) {
      this.setState({ open: this.props.open });
    }
    if (prevState.editable && !editable) {
      css.style.pointerEvents = "none";
    }
    if (!prevState.editable && editable) {
      css.style.pointerEvents = "all";
    }
  }

  handleDown(event: MouseEvent): void {
    this.setState({
      mousedown: true
    });
  }

  handleMove(event: MouseEvent): void {
    if (this.state.mousedown)
      this.setState({
        dragging: true
      });
  }

  handleUp(event: MouseEvent): void {
    //Hard to check if mousedown and mouseup on same object
    const { camera, mesh, css } = this.props;
    if (this.state.active && !this.state.dragging && event.target === css) {
      const res = css.getBoundingClientRect();
      const mouseVector = new THREE.Vector2();
      mouseVector.x = ((event.clientX - res.x) / res.width) * 2 - 1;
      mouseVector.y = -((event.clientY - res.top) / res.height) * 2 + 1;

      this.raycaster.setFromCamera(mouseVector, camera);

      const meshArray = [];
      if (mesh.type === THREE.Group) meshArray = mesh.children;
      else meshArray.push(mesh);

      const intersections = this.raycaster.intersectObjects(meshArray, true);

      // Only take the best result
      if (intersections.length > 0) this.handleIntersection(intersections[0]);
    }
    this.setState({
      mousedown: false,
      dragging: false
    });
  }

  handleIntersection(intersection: Object): void {
    var clickedExisting = false;
    for (
      let i = 0;
      i < this.state.annotations.length && !clickedExisting;
      i++ //Checked if clicked on existing annotation
    )
      if (
        this.state.annotations[i].point.distanceTo(intersection.point) <= 0.2
      ) {
        clickedExisting = true;
        let annotations = this.state.annotations;

        for (let j = 0; j < annotations.length; j++) {
          if (j === i) {
            annotations[j].open = !annotations[j].open;
          } else {
            annotations[j].open = false;
          }
        }
        this.setState({
          annotations: annotations
        });
      }

    if (!clickedExisting && this.state.editable)
      this.makeAnnotation(intersection.point);
  }

  makeAnnotation(point) {
    let annotations = this.state.annotations;
    for (let i = 0; i < annotations.length; i++) {
      annotations[i].open = false;
      const component = annotations[i].component;
      annotations[i].component = React.cloneElement(component, {
        ...component.props,
        ...{ visible: false }
      });
    }
    const ref = React.createRef();
    const component = (
      <ThreeAnnotation
        innerRef={ref}
        title={"Untitled"}
        text={""}
        callback={this.updateAnnotation}
        index={annotations.length}
        editable={this.state.editable}
        visible={true}
      />
    );
    let annotation = {
      component: component,
      get node() {
        return this.component.props.innerRef.current;
      },
      point: point,
      title: component.props.title,
      cameraPosition: this.props.camera.position.clone(),
      open: true
    };
    annotations.push(annotation);
    this.setState(
      {
        annotations: annotations
      },
      () => this.props.drawCallback(this.state.annotations)
    );
  }

  updateAnnotation(index, data) {
    let annotations = this.state.annotations;

    annotations[index] = { ...annotations[index], ...data };

    this.setState({
      annotations: annotations
    });
  }

  deleteAnnotation(index) {
    const { annotations } = this.state;
    const updated = annotations.length === 1 ? [] : [...annotations];
    if (updated.length > 0) updated.splice(index, 1);
    this.setState(
      {
        annotations: updated
      },
      () => this.props.drawCallback(this.state.annotations)
    );
  }

  viewAnnotation(index) {
    let annotations = this.state.annotations;
    annotations.forEach((annotation, idx) => {
      const { component } = annotation;
      if (idx === index) {
        annotation.open = true;
        if (!component.props.visible) {
          annotation.component = React.cloneElement(component, {
            ...component.props,
            ...{ visible: true }
          });
        }
      } else {
        annotation.open = false;
        if (component.props.visible) {
          annotation.component = React.cloneElement(component, {
            ...component.props,
            ...{ visible: false }
          });
        }
      }
    });
    const { cameraPosition, point } = annotations[index];
    this.props.cameraCallback(point, cameraPosition);
    this.setState(
      {
        annotations: annotations
      },
      () => this.props.drawCallback(this.state.annotations)
    );
  }

  verifyAnnotationComponentRendered() {
    const { annotations } = this.state;
    const { drawCallback } = this.props;
  }

  render() {
    const { css } = this.props;
    const { editable, annotations } = this.state;
    const renderedAnnotations = annotations.map(annotation => {
      return <div>{annotation.component}</div>;
    });
    let editToggle;
    if (this.state.active)
      editToggle = (
        <ThreeToggle
          title="edit mode"
          callback={this.toggleEdit}
          defaultVal={this.state.editable}
        />
      );

    let shortcuts = annotations.map((annotation, index) => (
      <ThreeAnnotationShortcut
        title={annotation.title}
        index={index}
        focus={this.viewAnnotation}
        delete={this.deleteAnnotation}
      />
    ));

    let shortcutContainer;
    if (this.state.active)
      shortcutContainer = (
        <div className={"three-gui-group"}>
          <h4 className="three-gui-group-title">shortcuts</h4>
          {shortcuts}
        </div>
      );

    return (
      <div className="three-annotation-tool-container">
        <ThreeToggle title="annotations" callback={this.toggle} />
        {editToggle}
        {shortcutContainer}
        {renderedAnnotations}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    annotationData: state.annotationData
  } 
}

export default connect(mapStateToProps, { saveAnnotation, loadAnnotations })(ThreeAnnotationController);