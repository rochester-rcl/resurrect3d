/* @flow */

// React
import React, { Component } from "react";
import ReactDom from "react-dom";

// THREEJS
import * as THREE from "three";

// UI
import ThreeToggle from "../ThreeToggle";
import ThreeButton from "../ThreeButton";

//ThreeAnnotation
import ThreeAnnotation from "./ThreeAnnotation";
import ThreeAnnotationShortcut from "./ThreeAnnotationShortcut";
import ThreeAnnotationReadOnlyBody from "./ThreeAnnotationBody";

// Redux
import { connect } from "react-redux";

// Action Creators
import {
  loadAnnotations,
  saveAnnotation,
  deleteAnnotation,
  resetLocalStateUpdateStatus,
  changeAnnotationFocus,
  updateAnnotationsMergedStatus,
  updateAnnotationsOrder
} from "../../actions/AnnotationActions";

import screenfull from "screenfull";

import { ANNOTATION_SAVE_STATUS, KEYCODES } from "../../constants/application";

// TODO add editing capabilities to the body and make it editable

class ThreeAnnotationController extends Component {
  raycaster: THREE.RayCaster;
  state = {
    mousedown: false,
    dragging: false,
    active: false,
    open: false,
    editable: false,
    annotations: [],
    updatingAnnotations: false,
    presentationMode: false,
    currentIndex: -1,
    shortcutsNeedUpdate: false
  };

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
    this.saveAnnotation = this.saveAnnotation.bind(this);
    this.requestAnnotationsUpdate = this.requestAnnotationsUpdate.bind(this);
    this.updateAnnotations = this.updateAnnotations.bind(this);
    this.mergeAnnotations = this.mergeAnnotations.bind(this);
    this.onAnnotationContentUpdated = this.onAnnotationContentUpdated.bind(
      this
    );
    this.updateAnnotationSettings = this.updateAnnotationSettings.bind(this);
    this.setAnnotationSettingsValues = this.setAnnotationSettingsValues.bind(
      this
    );
    this.togglePresentationMode = this.togglePresentationMode.bind(this);
    this.onFullscreenChanged = this.onFullscreenChanged.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.goToAnnotation = this.goToAnnotation.bind(this);
    this.updateEditableAnnotations = this.updateEditableAnnotations.bind(this);
    this.onAnnotationBlur = this.onAnnotationBlur.bind(this);
    this.updateIndex = this.updateIndex.bind(this);
    this.shortcutContainerRef = React.createRef();
    this.currentShortcutRef = React.createRef();
    this.shortcuts = [];
    this.renderShortcuts = this.renderShortcuts.bind(this);
  }

  componentDidMount(): void {
    const { css, threeViewId } = this.props;
    this.props.loadAnnotations(threeViewId);
    css.addEventListener("mousedown", this.handleDown, true);
    css.addEventListener("mousemove", this.handleMove, true);
    css.addEventListener("mouseup", this.handleUp, true);
    css.addEventListener("keydown", this.handleKeyDown, true);
    window.addEventListener("fullscreenchange", this.onFullscreenChanged, true);
    css.style.pointerEvents = "auto";
  }

  componentWillUnmount(): void {
    const { css } = this.props;
    css.removeEventListener("mousedown", this.handleDown, true);
    css.removeEventListener("mousemove", this.handleMove, true);
    css.removeEventListener("mouseup", this.handleUp, true);
    css.removeEventListener("keydown", this.handleKeyDown, true);
    window.removeEventListener(
      "fullscreenchange",
      this.onFullscreenChanged,
      true
    );
    css.style.pointerEvents = "none";
  }

  toggle(): void {
    const { active } = this.state;
    this.setState(
      {
        active: !active
      },
      () => {
        if (!this.state.active) {
          this.props.drawCallback([]);
        }
      }
    );
  }

  toggleEdit(): void {
    this.setState(
      {
        editable: !this.state.editable
      },
      this.updateEditableAnnotations
    );
  }

  togglePresentationMode() {
    const { onTogglePresentationMode, presentationRef } = this.props;
    const { presentationMode } = this.state;
    this.setState(
      {
        presentationMode: !presentationMode,
        currentIndex: -1
      },
      () => {
        this.toggleKeydownListeners();
        screenfull.toggle(presentationRef);
        onTogglePresentationMode(this.state.presentationMode);
      }
    );
  }

  onFullscreenChanged(event) {
    const { onTogglePresentationMode } = this.props;
    const { presentationMode } = this.state;
    if (!screenfull.isFullscreen && presentationMode) {
      this.setState(
        {
          presentationMode: false
        },
        () => onTogglePresentationMode(this.state.presentationMode)
      );
    }
  }

  toggleKeydownListeners() {
    const { presentationMode } = this.state;
    if (presentationMode) {
      window.addEventListener("keydown", this.handleKeyDown, true);
    } else {
      window.removeEventListener("keydown", this.handleKeyDown, true);
    }
  }

  handleKeyDown(event) {
    const { presentationMode, currentIndex } = this.state;
    if (presentationMode) {
      switch (event.keyCode) {
        case KEYCODES.LEFT:
          this.goToAnnotation(currentIndex - 1);
          break;
        case KEYCODES.RIGHT:
          this.goToAnnotation(currentIndex + 1);
          break;
        default:
          break;
      }
    }
  }

  goToAnnotation(index) {
    const { annotations } = this.state;
    const max = annotations.length - 1;
    let nextIndex = index;
    if (nextIndex < 0) nextIndex = max;
    if (nextIndex > max) nextIndex = 0;
    this.setState({ currentIndex: nextIndex }, () =>
      this.viewAnnotation(this.state.currentIndex)
    );
  }

  reset(): void {
    this.props.drawCallback();
    this.setState({ annotations: [], shortcutsNeedUpdate: true });

    if (this.props.onActiveCallback)
      this.props.onActiveCallback(this.state.active);
  }

  componentDidUpdate(prevProps, prevState): void {
    const { editable, updatingAnnotations, active } = this.state;
    const { css, annotationData } = this.props;
    const { localStateNeedsUpdate, focused } = annotationData;
    if (this.props.open != prevProps.open) {
      this.setState({ open: this.props.open });
    }
    if (!editable || !active) {
      css.style.pointerEvents = "none";
      css.style.cursor = "pointer";
    }
    if (editable) {
      css.style.pointerEvents = "all";
      css.style.cursor = "crosshair";
    }
    if (localStateNeedsUpdate && !updatingAnnotations) {
      this.requestAnnotationsUpdate();
    }
    if (prevProps.annotationData.focused && !focused) {
      this.onAnnotationBlur();
    }
  }

  shouldComponentUpdate(prevState, prevProps) {
    const { editable, dragging } = this.state;
    if (editable && dragging) return false;
    return true;
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
      const bodyComponent = annotations[i].bodyComponent;
      annotations[i].component = React.cloneElement(component, {
        ...component.props,
        ...{ visible: false }
      });
      annotations[i].bodyComponent = React.cloneElement(bodyComponent, {
        ...bodyComponent.props,
        ...{ visible: false }
      });
    }
    const ref = React.createRef();
    const bodyRef = React.createRef();
    const component = (
      <ThreeAnnotation
        key={THREE.Math.generateUUID()}
        innerRef={ref}
        title={"Untitled"}
        text={""}
        callback={this.updateAnnotation}
        index={annotations.length}
        editable={this.state.editable}
        visible={true}
        onUpdate={this.onAnnotationContentUpdated}
      />
    );
    const bodyComponent = (
      <ThreeAnnotationReadOnlyBody
        key={THREE.Math.generateUUID()}
        innerRef={bodyRef}
        visible={false}
        text={""}
      />
    );
    let annotation = {
      component: component,
      bodyComponent: bodyComponent,
      get node() {
        return this.component.props.innerRef.current;
      },
      get bodyNode() {
        return this.bodyComponent.props.innerRef.current;
      },
      point: point,
      text: "",
      title: component.props.title,
      settings: { cameraPosition: { val: null, enabled: false } },
      saveStatus: ANNOTATION_SAVE_STATUS.UNSAVED,
      open: true
    };
    annotations.push(annotation);
    this.setState(
      {
        annotations: annotations,
        shortcutsNeedUpdate: true
      },
      () => {
        this.props.drawCallback(this.state.annotations);
        const shortcutContainerElement = this.shortcutContainerRef.current;
        if (shortcutContainerElement) {
          shortcutContainerElement.scrollTop =
            shortcutContainerElement.scrollHeight;
        }
      }
    );
  }

  requestAnnotationsUpdate() {
    this.setState(
      {
        updatingAnnotations: true,
        shortcutsNeedUpdate: true
      },
      this.updateAnnotations
    );
  }

  // sets annotation's save status to "needs update"
  onAnnotationContentUpdated(index) {
    const { annotations } = this.state;
    const cloned = annotations.slice(0);
    const annotation = cloned[index];
    if (
      annotation &&
      annotation.saveStatus !== ANNOTATION_SAVE_STATUS.UNSAVED
    ) {
      annotation.saveStatus = ANNOTATION_SAVE_STATUS.NEEDS_UPDATE;
      this.setState({
        annotations: cloned,
        shortcutsNeedUpdate: true
      });
    }
  }

  updateAnnotations() {
    const { annotations } = this.props.annotationData;
    const { active } = this.state;
    const updatedAnnotations = annotations.map((annotation, index) =>
      this.hydrateAnnotation(annotation, index)
    );
    const merged = this.mergeAnnotations(updatedAnnotations);
    this.setState(
      {
        annotations: merged,
        updatingAnnotations: false,
        shortcutsNeedUpdate: true
      },
      () => {
        this.props.resetLocalStateUpdateStatus();
        if (active) {
          this.props.drawCallback(this.state.annotations);
        }
      }
    );
  }

  updateEditableAnnotations() {
    const { annotations, editable } = this.state;
    const cloned = [...annotations];
    const openIndex = cloned.findIndex(a => a.open === true);
    if (openIndex > -1) {
      const oa = cloned[openIndex];
      const { component, bodyComponent } = oa;
      oa.component = React.cloneElement(component, {
        ...component.props,
        ...{ editable: editable }
      });
      oa.bodyComponent = React.cloneElement(bodyComponent, {
        ...bodyComponent.props,
        ...{ visible: !editable }
      });
      this.setState({ annotations: cloned });
    }
  }

  updateIndex(currentIndex, newIndex) {
    const { annotations } = this.state;
    const { drawCallback, updateAnnotationsOrder } = this.props;
    const cloned = [...annotations];
    cloned.splice(newIndex, 0, cloned.splice(currentIndex, 1)[0]);
    if (cloned[newIndex]) {
      cloned[newIndex].saveStatus = ANNOTATION_SAVE_STATUS.NEEDS_UPDATE;
    }
    if (cloned[currentIndex]) {
      cloned[currentIndex].saveStatus = ANNOTATION_SAVE_STATUS.NEEDS_UPDATE;
    }
    const updated = cloned.map((annotation, index) =>
      this.hydrateAnnotation(annotation, index)
    );
    this.setState(
      {
        annotations: updated,
        currentIndex: newIndex,
        shortcutsNeedUpdate: true
      },
      () => {
        drawCallback(this.state.annotations);
        updateAnnotationsOrder(updated.map(a => a._id));
        this.scrollShortcut(this.currentShortcutRef.current);
      }
    );
  }

  mergeAnnotations(newAnnotations) {
    const { annotations } = this.state;
    const { updateAnnotationsMergedStatus } = this.props;
    const updated = [];
    if (annotations.length === 0) return newAnnotations;
    const merged = annotations.slice(0);
    for (let i = 0; i < newAnnotations.length; i++) {
      const annotation = newAnnotations[i];
      if (annotation.needsMerge) {
        merged[i] = annotation;
        updated.push(annotation._id);
      }
    }
    updateAnnotationsMergedStatus(updated);
    return merged;
  }

  hydrateAnnotation(annotation, index) {
    const {
      title,
      text,
      point,
      settings,
      saveStatus,
      needsMerge,
      _id
    } = annotation;
    const ref = React.createRef();
    const bodyRef = React.createRef();
    const component = (
      <ThreeAnnotation
        key={THREE.Math.generateUUID()}
        innerRef={ref}
        title={title}
        text={text}
        callback={this.updateAnnotation}
        index={index}
        editable={this.state.editable}
        visible={false}
        onUpdate={this.onAnnotationContentUpdated}
      />
    );
    const bodyComponent = (
      <ThreeAnnotationReadOnlyBody
        key={THREE.Math.generateUUID()}
        innerRef={bodyRef}
        visible={false}
        text={text}
      />
    );
    const a = {
      component: component,
      bodyComponent: bodyComponent,
      get node() {
        return this.component.props.innerRef.current;
      },
      get bodyNode() {
        return this.bodyComponent.props.innerRef.current;
      },
      point: point,
      title: title,
      text: text,
      index: index,
      settings: settings,
      needsMerge: needsMerge,
      _id: _id,
      open: false,
      saveStatus: saveStatus
    };
    return a;
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
    const annotation = annotations[index];
    if (annotation._id) {
      this.props.deleteAnnotation(annotation._id, this.props.threeViewId);
    }
    const updated = annotations.length === 1 ? [] : [...annotations];
    if (updated.length > 0) updated.splice(index, 1);
    this.setState(
      {
        annotations: updated
      },
      () => this.props.drawCallback(this.state.annotations)
    );
  }

  saveAnnotation(index) {
    const { saveAnnotation, threeViewId } = this.props;
    const annotation = this.state.annotations[index];
    if (annotation) {
      const {
        component,
        node,
        titleStyle,
        textStyle,
        needsMerge,
        ...rest
      } = annotation;
      const a = this.setAnnotationSettingsValues({ ...rest });
      a.index = index;
      saveAnnotation(a, threeViewId);
    }
  }

  setAnnotationSettingsValues(annotation) {
    const { settings } = annotation;
    if (settings.cameraPosition.enabled) {
      settings.cameraPosition.val = this.props.camera.position.clone();
      // settings should be disabled when saving so the user needs to opt in to change the camera position when they update the annotation
      settings.cameraPosition.enabled = false;
    }
    return annotation;
  }

  scrollShortcut(target) {
    if (target) {
      target.parentNode.scrollTop =
        target.offsetTop - target.parentNode.offsetTop - 10;
    }
  }

  viewAnnotation(index) {
    const {
      changeAnnotationFocus,
      cameraCallback,
      drawCallback,
      annotationData
    } = this.props;
    const { annotations, editable } = this.state;
    annotations.forEach((annotation, idx) => {
      const { component, bodyComponent } = annotation;
      if (idx === index) {
        annotation.open = true;
        if (!component.props.visible) {
          annotation.component = React.cloneElement(component, {
            ...component.props,
            ...{ visible: true, editable: editable }
          });
          annotation.bodyComponent = React.cloneElement(bodyComponent, {
            ...bodyComponent.props,
            ...{ visible: !editable }
          });
        }
      } else {
        annotation.open = false;
        if (component.props.visible) {
          annotation.component = React.cloneElement(component, {
            ...component.props,
            ...{ visible: false }
          });
          annotation.bodyComponent = React.cloneElement(bodyComponent, {
            ...bodyComponent.props,
            ...{ visible: false }
          });
        }
      }
    });
    const { settings, point } = annotations[index];
    const { cameraPosition } = settings;
    cameraCallback(point, cameraPosition.val, !annotationData.focused);
    this.scrollShortcut(this.currentShortcutRef.current);
    changeAnnotationFocus(true);
    this.setState(
      {
        annotations: annotations,
        currentIndex: index,
        shortcutsNeedUpdate: true
      },
      () => {
        drawCallback(this.state.annotations);
        this.scrollShortcut(this.currentShortcutRef.current);
      }
    );
  }

  onAnnotationBlur() {
    this.setState({
      currentIndex: -1
    });
  }

  updateAnnotationSettings(index, settingsKey, value) {
    const { annotations } = this.state;
    const cloned = annotations.slice(0);
    const annotation = cloned[index];
    if (annotation) {
      annotation.settings[settingsKey].enabled = value;
      if (annotation.saveStatus !== ANNOTATION_SAVE_STATUS.UNSAVED) {
        annotation.saveStatus = ANNOTATION_SAVE_STATUS.NEEDS_UPDATE;
      }
    }
    this.setState({
      annotations: cloned,
      shortcutsNeedUpdate: false
    });
  }

  renderShortcuts() {
    const { user } = this.props;
    const { annotations, currentIndex, shortcutsNeedUpdate } = this.state;
    const render = () =>
      annotations.map((annotation, index) => (
        <ThreeAnnotationShortcut
          key={THREE.Math.generateUUID()}
          title={annotation.title}
          index={index}
          total={annotations.length}
          focus={this.viewAnnotation}
          delete={this.deleteAnnotation}
          save={this.saveAnnotation}
          saveStatus={annotation.saveStatus}
          onSettingsUpdate={this.updateAnnotationSettings}
          onUpdateIndex={this.updateIndex}
          innerRef={index === currentIndex ? this.currentShortcutRef : null}
          readOnly={!user.loggedIn}
        />
      ));

    if (
      (annotations.length > 0 && this.shortcuts.length === 0) ||
      shortcutsNeedUpdate
    ) {
      this.shortcuts = render();
    }
    return this.shortcuts;
  }

  render() {
    const { user } = this.props;
    const {
      annotations,
      presentationMode,
      currentIndex,
      editable
    } = this.state;
    const currentAnnotation =
      currentIndex > -1 ? annotations[currentIndex] : null;
    const renderedAnnotations = annotations.map(annotation => {
      return <div key={annotation.component.key}>{annotation.component}</div>;
    });
    const renderedBodyAnnotations = annotations.map(annotation => {
      return (
        <div key={annotation.bodyComponent.key}>{annotation.bodyComponent}</div>
      );
    });
    let editToggle;
    let togglePresentationMode;
    if (this.state.active) {
      if (user.loggedIn) {
        editToggle = (
          <ThreeToggle
            title="edit mode"
            callback={this.toggleEdit}
            defaultVal={editable}
          />
        );
      }
      if (!presentationMode && annotations.length > 0) {
        togglePresentationMode = (
          <ThreeButton
            className="toggle-annotations-presentation-button three-controls-button"
            icon="play"
            color="grey"
            labelPosition="right"
            content="Start Presentation"
            onClick={this.togglePresentationMode}
          />
        );
      }
    }

    let shortcutContainer;
    if (this.state.active) {
      shortcutContainer = (
        <div ref={this.shortcutContainerRef} className={"three-gui-group"}>
          <h4 className="three-gui-group-title">shortcuts</h4>
          {this.renderShortcuts()}
        </div>
      );
    }
    return (
      <div className="three-annotation-tool-container">
        <ThreeToggle title="annotations" callback={this.toggle} />
        {editToggle}
        {togglePresentationMode}
        {shortcutContainer}
        {renderedAnnotations}
        {renderedBodyAnnotations}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    annotationData: state.annotationData,
    user: state.user
  };
}

export default connect(mapStateToProps, {
  saveAnnotation,
  loadAnnotations,
  deleteAnnotation,
  resetLocalStateUpdateStatus,
  changeAnnotationFocus,
  updateAnnotationsMergedStatus,
  updateAnnotationsOrder
})(ThreeAnnotationController);
