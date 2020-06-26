/* @flow */

// React
import React, { Component, createRef } from "react";
import ReactDom from "react-dom";

// THREEJS
import * as THREE from "three";

// UI
import ThreeToggle from "../ThreeToggle";
import ThreeButton from "../ThreeButton";
import ThreeColorPicker, { rgbToBase16 } from "../ThreeColorPicker";
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
  updateAnnotationsOrder,
  updateLocalAnnotation,
  updateLocalAnnotations,
  hideAnnotations,
  showAnnotations,
} from "../../actions/AnnotationActions";

import screenfull from "screenfull";

import { ANNOTATION_SAVE_STATUS, KEYCODES } from "../../constants/application";

import { Label, Icon } from "semantic-ui-react";

import { debounce } from "lodash";

// TODO add editing capabilities to the body and make it editable

class ThreeAnnotationController extends Component {
  EDIT_MODES = {
    ADD: "ADD",
    EDIT_EXISTING: "EDIT_EXISTING",
  };
  raycaster: THREE.RayCaster;
  state = {
    mousedown: false,
    dragging: false,
    active: false,
    open: false,
    editable: false,
    editMode: this.EDIT_MODES.ADD,
    annotations: [],
    updatingAnnotations: false,
    presentationMode: false,
    storeLastCameraPosition: false,
    currentIndex: -1,
    shortcutsNeedUpdate: false,
    pinColor: { hex: 0x21ba45, str: "#21ba45" },
    annotationsVisible: false,
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
    this.startCameraCallback = this.startCameraCallback.bind(this);
    this.onCameraCallbackComplete = this.onCameraCallbackComplete.bind(this);
    this.focusShortcut = this.focusShortcut.bind(this);
    (this: any).deleteAnnotation = this.deleteAnnotation.bind(this);
    this.handleColorPick = this.handleColorPick.bind(this);
    (this: any).toggle = this.toggle.bind(this);
    (this: any).toggleEdit = this.toggleEdit.bind(this);
    (this: any).raycaster = new THREE.Raycaster();
    this.saveAnnotation = this.saveAnnotation.bind(this);
    this.editAnnotation = this.editAnnotation.bind(this);
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
    this.updateIndex = this.updateIndex.bind(this);
    this.shortcutContainerRef = React.createRef();
    this.currentShortcutRef = React.createRef();
    this.shortcuts = [];
    this.renderShortcuts = this.renderShortcuts.bind(this);
    this.getCurrentAnnotation = this.getCurrentAnnotation.bind(this);
    this.updateAnnotationPosition = this.updateAnnotationPosition.bind(this);
    this.toggleAnnotations = this.toggleAnnotations.bind(this);
    this._toggleAnnotations = this._toggleAnnotations.bind(this);
  }

  componentDidMount(): void {
    const {
      css,
      threeViewId,
      annotationData,
      setHide,
      setShow,
      showAnnotations,
      hideAnnotations,
    } = this.props;
    setHide(this.toggleAnnotations(false));
    setShow(this.toggleAnnotations(true));
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
        active: !active,
      },
      () => {
        if (!this.state.active) {
          this.props.drawCallback([]);
        }
      }
    );
  }

  toggleEdit(mode = this.EDIT_MODES.ADD) {
    const { editable, editMode } = this.state;
    let isEditable = editable === true && mode === editMode;
    this.setState(
      {
        editable: !isEditable,
        editMode: mode,
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
        currentIndex: -1,
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
          presentationMode: false,
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
    console.log(currentIndex);
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

  handleColorPick(rgb) {
    const color = new THREE.Color(...Object.values(rgb));
    this.setState({
      pinColor: { hex: color.getHex(), str: color.getHexString() },
    });
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

  componentDidUpdate(prevProps, prevState) {
    const {
      editable,
      updatingAnnotations,
      active,
      storeLastCameraPosition,
      presentationMode,
    } = this.state;
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
    if (presentationMode && !prevState.presentationMode) {
      this.setState({
        storeLastCameraPosition: true,
      });
    }
  }

  shouldComponentUpdate(prevState, prevProps) {
    const { editable, dragging } = this.state;
    if (editable && dragging) return false;
    return true;
  }

  handleDown(event: MouseEvent): void {
    this.setState({
      mousedown: true,
    });
  }

  handleMove(event: MouseEvent): void {
    if (this.state.mousedown)
      this.setState({
        dragging: true,
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
      dragging: false,
    });
  }

  handleIntersection(intersection: Object): void {
    const { editMode } = this.state;
    let clickedExisting = false;
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
          annotations: annotations,
        });
      }

    if (!clickedExisting && this.state.editable) {
      if (editMode === this.EDIT_MODES.EDIT_EXISTING) {
        this.updateAnnotationPosition(intersection.point, intersection.face);
      } else {
        this.makeAnnotation(intersection.point, intersection.face);
      }
    }
  }

  updateAnnotationPosition(point, face) {
    const { currentIndex, annotations, pinColor } = this.state;
    const annotation = {
      ...this.getCurrentAnnotation(),
      ...{
        point: point,
        normal: face.normal,
        pinColor: pinColor.hex,
        saveStatus: ANNOTATION_SAVE_STATUS.NEEDS_UPDATE,
      },
    };
    const updated = [...annotations];
    updated.splice(currentIndex, 1, annotation);
    this.setState(
      {
        annotations: updated,
        shortcutsNeedUpdate: true,
      },
      () => {
        this.props.drawCallback(this.state.annotations);
      }
    );
  }

  makeAnnotation(point, face) {
    const { annotations, pinColor, currentIndex } = this.state;
    for (let i = 0; i < annotations.length; i++) {
      annotations[i].open = false;
      /*const component = annotations[i].component;
      const bodyComponent = annotations[i].bodyComponent;
      annotations[i].component = React.cloneElement(component);
      annotations[i].bodyComponent = React.cloneElement(bodyComponent, {
        ...bodyComponent.props,
      });*/
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
    const annotation = {
      component: component,
      bodyComponent: bodyComponent,
      get node() {
        return this.component.props.innerRef.current;
      },
      get bodyNode() {
        return this.bodyComponent.props.innerRef.current;
      },
      point: point,
      normal: face.normal,
      pinColor: pinColor.hex,
      text: "",
      title: component.props.title,
      settings: { cameraPosition: { val: null, enabled: false } },
      saveStatus: ANNOTATION_SAVE_STATUS.UNSAVED,
      open: true,
    };
    annotations.push(annotation);
    this.setState(
      {
        annotations: annotations,
        shortcutsNeedUpdate: true,
        currentIndex: currentIndex + 1,
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
        shortcutsNeedUpdate: true,
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
        shortcutsNeedUpdate: true,
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
        shortcutsNeedUpdate: true,
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
    const openIndex = cloned.findIndex((a) => a.open === true);
    if (openIndex > -1) {
      const oa = cloned[openIndex];
      const { component, bodyComponent } = oa;
      oa.component = React.cloneElement(component, {
        editable: editable,
        visible: oa.visible,
      });
      oa.bodyComponent = React.cloneElement(bodyComponent, {
        visible: !editable,
      });
      this.setState({ annotations: cloned });
    }
  }

  getCurrentAnnotation() {
    const { currentIndex, annotations } = this.state;
    return annotations[currentIndex];
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
        shortcutsNeedUpdate: true,
      },
      () => {
        drawCallback(this.state.annotations);
        updateAnnotationsOrder(updated.map((a) => a._id));
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
      normal,
      pinColor,
      settings,
      saveStatus,
      needsMerge,
      _id,
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
      normal: normal,
      title: title,
      text: text,
      index: index,
      settings: settings,
      needsMerge: needsMerge,
      pinColor: pinColor,
      visible: false,
      _id: _id,
      open: false,
      saveStatus: saveStatus,
    };
    return a;
  }

  updateAnnotation(index, data) {
    const { annotations } = this.state;

    annotations[index] = { ...annotations[index], ...data };

    this.setState({
      annotations: annotations,
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
        annotations: updated,
      },
      () => this.props.drawCallback(this.state.annotations)
    );
  }

  editAnnotation(index) {
    const { editMode } = this.state;
    this.setState({
      currentIndex: index,
      editMode:
        editMode === this.EDIT_MODES.ADD
          ? this.EDIT_MODES.EDIT_EXISTING
          : this.EDIT_MODES.ADD,
    });
  }

  saveAnnotation(index) {
    const { saveAnnotation, threeViewId } = this.props;
    const annotation = this.state.annotations[index];
    if (annotation) {
      const {
        component,
        bodyComponent,
        node,
        bodyNode,
        visible,
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

  focusShortcut(idx) {
    this.setState(
      {
        currentIndex: idx,
      },
      () => {
        this.scrollShortcut(this.currentShortcutRef.current);
        this.viewAnnotation(idx, false);
      }
    );
  }
  // TODO needs to be optimized
  cloneAnnotation(
    annotations,
    index,
    newFields = {},
    props = {},
    bodyProps = {}
  ) {
    const annotation = {
      ...annotations[index],
      ...newFields,
    };
    const { component, bodyComponent } = annotation;
    const color = new THREE.Color(annotation.pinColor);
    this.setState({
      pinColor: { hex: color.getHex(), str: color.getHexString() },
    });
    annotation.component = React.cloneElement(component, props);
    annotation.bodyComponent = React.cloneElement(bodyComponent, bodyProps);
    return annotation;
  }

  _toggleAnnotations(val, index) {
    return new Promise((resolve, reject) => {
      try {
        const { annotations, annotationsVisible, editable } = this.state;
        if (annotationsVisible === val) {
          resolve();
          return;
        }
        let updated;
        if (index !== null) {
          updated = [...annotations];
          const annotation = this.cloneAnnotation(
            updated,
            index,
            { open: val, visible: val },
            {
              visible: val,
              editable: editable,
            },
            { visible: editable !== true && val !== false }
          );
          updated.splice(index, 1, annotation);
        } else {
          updated = annotations.map((annotation, index) => {
            return this.cloneAnnotation(
              annotations,
              index,
              { visible: val, open: val },
              { visible: val },
              { visible: editable !== true && val !== false }
            );
          });
        }
        this.setState(
          {
            annotations: updated,
            annotationsVisible: val,
          },
          () => {
            resolve();
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  toggleAnnotations(val) {
    return debounce(
      (index = null) => this._toggleAnnotations(val, index),
      750,
      { leading: true, trailing: false, maxWait: 1000 }
    );
  }

  viewAnnotation(index, moveCamera = true) {
    const { annotations } = this.state;
    const { settings, point } = annotations[index];
    const { cameraPosition } = settings;
    this.toggleAnnotations(false)().then(() => {
      if (moveCamera) {
        this.startCameraCallback(index, point, cameraPosition.val);
      } else {
        this.onCameraCallbackComplete(index);
      }
    });
  }

  startCameraCallback(index, point, cameraPosition) {
    const { cameraCallback } = this.props;
    if (cameraCallback) {
      const { storeLastCameraPosition, presentationMode } = this.state;
      const storeLast = presentationMode ? storeLastCameraPosition : true;
      cameraCallback(point, cameraPosition, storeLast, () =>
        this.onCameraCallbackComplete(index)
      );
    }
  }
  // always store last camera position outside of presentation mode, only store it on the first animation in presentation mode
  onCameraCallbackComplete(index) {
    const { changeAnnotationFocus, drawCallback } = this.props;
    const { presentationMode, storeLastCameraPosition } = this.state;
    this.scrollShortcut(this.currentShortcutRef.current);
    this.toggleAnnotations(true)(index).then(() => {
      this.setState(
        {
          currentIndex: index,
          shortcutsNeedUpdate: true,
          storeLastCameraPosition: false,
        },
        () => {
          drawCallback(this.state.annotations);
          this.scrollShortcut(this.currentShortcutRef.current);
        }
      );
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
      shortcutsNeedUpdate: false,
    });
  }

  renderShortcuts() {
    const { user } = this.props;
    const { annotations, currentIndex, shortcutsNeedUpdate } = this.state;
    const render = () =>
      annotations.map((annotation, index) => {
        const selected = index === currentIndex;
        return (
          <ThreeAnnotationShortcut
            onClick={() => this.focusShortcut(index)}
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
            innerRef={selected ? this.currentShortcutRef : null}
            selected={selected}
            readOnly={!user.loggedIn}
          />
        );
      });

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
      editable,
      pinColor,
      editMode,
    } = this.state;
    const renderedAnnotations = annotations.map((annotation) => {
      return <div key={annotation.component.key}>{annotation.component}</div>;
    });
    const renderedBodyAnnotations = annotations.map((annotation) => {
      return (
        <div key={annotation.bodyComponent.key}>{annotation.bodyComponent}</div>
      );
    });
    let addToggle = null;
    let editToggle = null;
    let colorPicker = null;
    let togglePresentationMode = null;
    let editModeLabel = null;
    // TODO check ownership of model and just use readOnly property
    if (this.state.active) {
      if (user.loggedIn) {
        addToggle = (
          <ThreeToggle
            title="add"
            checked={editable && editMode === this.EDIT_MODES.ADD}
            callback={() => this.toggleEdit(this.EDIT_MODES.ADD)}
            defaultVal={editable && editMode === this.EDIT_MODES.ADD}
          />
        );
        editToggle = (
          <ThreeToggle
            title="edit"
            checked={editable && editMode === this.EDIT_MODES.EDIT_EXISTING}
            callback={() => this.toggleEdit(this.EDIT_MODES.EDIT_EXISTING)}
            defaultVal={editable && editMode === this.EDIT_MODES.EDIT_EXISTING}
          />
        );
        if (editable) {
          colorPicker = (
            <ThreeColorPicker
              title={"Active Pin Color"}
              color={pinColor.str}
              callback={this.handleColorPick}
            />
          );
          const editModeMessage =
            editMode === this.EDIT_MODES.ADD
              ? "Pick a point on the mesh to add a new annotation"
              : `Pick a point on the mesh to update the current annotation (${
                  this.getCurrentAnnotation()
                    ? this.getCurrentAnnotation().title
                    : ""
                })`;
          const editModeIcon =
            editMode === this.EDIT_MODES.ADD ? "add" : "edit";
          editModeLabel = (
            <Label icon className="annotation-edit-mode-label">
              <Icon name={editModeIcon} />
              <Label.Detail>{editModeMessage}</Label.Detail>
            </Label>
          );
        }
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

    let shortcutContainer = null;
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
        {addToggle}
        {editToggle}
        {editModeLabel}
        {togglePresentationMode}
        {colorPicker}
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
    user: state.user,
  };
}

export default connect(mapStateToProps, {
  saveAnnotation,
  loadAnnotations,
  deleteAnnotation,
  resetLocalStateUpdateStatus,
  changeAnnotationFocus,
  updateAnnotationsMergedStatus,
  updateAnnotationsOrder,
  hideAnnotations,
  showAnnotations,
})(ThreeAnnotationController);
