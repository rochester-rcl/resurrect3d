/* @flow */
// TODO Why is loadText not showing? And why is there a huge bottleneck at loadPostProcessor ?????????
// React
import React, { Component } from "react";
import ReactDOM from "react-dom";

// THREEJS
import * as _THREE from "three";
import { CSS2DObject, CSS2DRenderer } from "../utils/CSS2DRenderer";

// Semantic UI
import LoaderModal from "./LoaderModal";
import InfoModal from "./InfoModal";
import { Button, Label, Icon } from "semantic-ui-react";

// GUI
import ThreeGUI, {
  ThreeGUIPanelLayout,
  ThreeGUILayout,
  ThreeGUIGroup,
  ThreeGUINestedGroup
} from "./ThreeGUI";

// Touch
import ThreeTouchControls from "./ThreeTouchControls";

// postprocessing
import loadPostProcessor from "../utils/postprocessing";

// Utils
import { panLeft, panUp, rotateLeft, rotateUp } from "../utils/camera";
import { fitBoxes, mapMaterials } from "../utils/mesh";
import { LabelSprite } from "../utils/image";
import { LinearGradientShader, RadialGradientCanvas } from "../utils/image";
import ThreePointLights from "../utils/lights";
import { convertUnits, lerpArrays } from "../utils/math";
import { serializeThreeTypes } from "../utils/serialization";
import screenfull from "screenfull";

// Constants
import {
  DEFAULT_GRADIENT_COLORS,
  DEFAULT_CLEAR_COLOR,
  ZOOM_PINCH_DISTANCE_SIZE,
  CM,
  IN,
  MM,
  FT,
  THREE_VECTOR3,
  THREE_MESH_STANDARD_MATERIAL,
  DISPLAY_DEVICE
} from "../constants/application";

// Controls
import ThreeMeasure from "./ThreeMeasure";
import ThreeAnnotationController from "./annotations/ThreeAnnotationController";
import ThreeRangeSlider from "./ThreeRangeSlider";
import ThreeToggle, { ThreeToggleMulti } from "./ThreeToggle";
import ThreeColorPicker, {
  ThreeMicroColorPicker,
  ThreeEyeDropperColorPicker
} from "./ThreeColorPicker";
import ThreeButton from "./ThreeButton";
import ThreeTools from "./ThreeTools";
import ThreeScreenshot from "./ThreeScreenshot";
import ThreeMeshExporter from "./ThreeMeshExporter";

// Components
import ThreeWebVR, { checkVR } from "./webvr/ThreeWebVR";

// Because of all of the THREE examples' global namespace pollu
const THREE = _THREE;

export default class ThreeView extends Component {
  /* Flow - declare all instance property types here */

  // settings
  height;//: number;
  width;//: number;
  pixelRatio;//: number;
  minAzimuthAngle;//: number;
  maxAzimuthAngle;//: number;
  minPolarAngle;//: number;
  maxPolarAngle;//: number;
  minDistance;//: number;
  maxDistance;//: number;
  environmentRadius;//: number;
  maxPan;//: number;
  minPan;//: number;
  spriteScaleFactor;//: number;

  // objects
  bboxMesh;//: THREE.Vector3;
  axisGuides;//: Array<Object>;
  bboxSkybox;//: THREE.MESH;
  mesh;//: THREE.Group;
  labelSprite;//: THREE.Sprite;
  labelSphere;//: THREE.Sphere;

  // mesh properties
  measurement;//: THREE.Group;
  meshDepth;//: number;
  meshWidth;//: number;
  meshHeight;//: number;

  // environments
  scene;//: THREE.Scene;
  overlayScene;//: THREE.Scene;
  envScene;//: THREE.Scene;
  guiScene;//: THREE.Scene;
  ambientLight;//: THREE.AmbientLight;
  pointLights;//: ThreePointLights;
  dynamicLight;//: THREE.SpotLight;
  skyboxGeom;//: THREE.SphereGeometry;
  skyboxMaterial;//: THREE.ShaderMaterial;
  skyboxMaterialShader;//: THREE.ShaderMaterial;
  skyboxMesh;//: THREE.Mesh;

  // cameras
  lastCameraPosition;//: THREE.Vector3;
  lastCameraTarget;//: THREE.Vector3;
  camera;//: THREE.PerspectiveCamera;
  overlayCamera = THREE.OrthographicCamera;

  // Controls
  rotateSpeed;//: Number = 0.4;
  zoomSpeed;//: Number = 0.9;
  dampingFactor;//: Number = 0.2;

  // Rendering
  webGLRenderer;//: THREE.WebGLRenderer;
  css2DRenderer;//: CSS2DRenderer;
  envRenderPass;//: THREE.RenderPass;
  effectComposer;//: THREE.EffectComposer;
  bokehPass;//: THREE.BokehPass;
  bloomPass;//: THREE.BloomPass;
  brightnessPass;//: THREE.BrightnessPass;

  // GUI
  panelLayout;//: ThreeGUIPanelLayout;
  controls;//: ThreeGUILayout;

  // DOM
  threeContainer;//: HTMLElement;
  // Mask for settings we don't want to save (aka uniforms)
  settingsMask = {
    materials: new Set([]),
    lights: new Set([]),
    shaders: new Set([])
  };
  state = {
    // interaction
    dragging: false,
    shiftDown: false,
    rmbDown: false,
    pinching: false,
    // auto camera movement
    controllable: true,
    annotationPresentationMode: false,
    target: undefined,
    animator: null,
    deltaTime: 0,
    currentAnnotationIndex: 0,
    currentAnnotationCSSObj: null,
    currentAnnotationCSSReadOnlyBodyObj: null,
    // rotation
    rotateStart: new THREE.Vector2(),
    rotateEnd: new THREE.Vector2(),
    rotateDelta: new THREE.Vector2(),
    //panning
    panStart: new THREE.Vector2(),
    panEnd: new THREE.Vector2(),
    panDelta: new THREE.Vector2(),
    panOffset: new THREE.Vector3(),
    // dolly
    scale: 1.75,
    lastScale: 1,
    zoomScale: Math.pow(0.95, 1.0),
    maxScale: 2.5,
    // spherical coords
    spherical: new THREE.Spherical(),
    sphericalDelta: new THREE.Spherical(0, 1.5, 0),
    // interface
    loadProgress: 0,
    loadText: "",
    detailMode: false,
    showInfo: false,
    showAxes: false,
    showLightHelper: false,
    dynamicLighting: false,
    toolsActive: false,
    dynamicLightProps: {
      color: new THREE.Color(0xc9e2ff),
      intensity: 0.8,
      distance: 0,
      decay: 2,
      offset: new THREE.Vector3(),
      lock: false
    },
    materialsInfo: {
      normalScale: 1,
      bumpScale: 1,
      pbr: {
        metalness: 0,
        roughness: 1
      }
    },
    shaderPasses: {
      EDL: {}
    },
    quality: {
      options: [
        {
          label: "best",
          value: 1
        },
        {
          label: "good",
          value: 1.325
        },
        {
          label: "medium",
          value: 2
        },
        {
          label: "low",
          value: 4
        }
      ],
      current: {
        label: "good",
        value: 1.325
      }
    },
    isRaycasting: false,
    //newContentToggle: false,
    vrActive: false,
    units: CM,
    cameraTargetTransitionRequired: false,
    cameraControlPaused: false,
    lastCameraPosition: new THREE.Vector3(),
    presentationMode: false
  };
  ROTATION_STEP = 0.0174533; // 1 degree in radians
  clock;//: THREE.Clock;
  constructor(props) {
    super(props);

    /** Properties
     ***************************************************************************/

    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.pixelRatio = window.devicePixelRatio;
    this.minAzimuthAngle = -Infinity;
    this.maxAzimuthAngle = Infinity;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.environmentRadius = 0;
    this.maxPan = 0;
    this.minPan = 0;
    this.bboxMesh = null;
    this.axisGuides = [];
    this.bboxSkybox = null;
    this.lastCameraPosition = new THREE.Vector3();
    this.EDL_TEXTURE_RADIUS = 1.0;
    this.EDL_TEXTURE_STEP = 0.01;
    this.clock = new THREE.Clock();
    this.lastTarget = new THREE.Vector3();
    this.cameraTargetAlpha = 0;
    // TODO needs serious refactoring for VR to work
    /** Methods
     ***************************************************************************/

    // Initialization

    this.initEnvironment = this.initEnvironment.bind(this);
    this.initMesh = this.initMesh.bind(this);
    this.initPostprocessing = this.initPostprocessing.bind(this);
    this.initThree = this.initThree.bind(this);
    this.initControls = this.initControls.bind(this);
    this.initTools = this.initTools.bind(this);
    this.addShaderPass = this.addShaderPass.bind(this);
    this.hydrateSettings = this.hydrateSettings.bind(this);

    // Updates / Geometry / Rendering

    this.animate = this.animate.bind(this);
    this.update = this.update.bind(this);
    this.updateCamera = this.updateCamera.bind(this);
    this.controlCamera = this.controlCamera.bind(this);
    this.orbit = this.orbit.bind(this);
    this.zoom = this.zoom.bind(this);
    this.pan = this.pan.bind(this);
    this.controlAnimation = this.controlAnimation.bind(this);
    this.renderWebGL = this.renderWebGL.bind(this);
    this.renderCSS = this.renderCSS.bind(this);
    this.getScale = this.getScale.bind(this);
    this.fitPerspectiveCamera = this.fitPerspectiveCamera.bind(this);
    this.panBounds = this.panBounds.bind(this);
    this.centerCamera = this.centerCamera.bind(this);
    this.center = this.center.bind(this);
    this.computeAxisGuides = this.computeAxisGuides.bind(this);
    this.drawAxisGuides = this.drawAxisGuides.bind(this);
    this.addAxisLabels = this.addAxisLabels.bind(this);
    this.removeAxisLabels = this.removeAxisLabels.bind(this);
    this.toggleBackground = this.toggleBackground.bind(this);
    this.captureScreenshot = this.captureScreenshot.bind(this);
    this.showAxes = this.showAxes.bind(this);
    this.showLightHelper = this.showLightHelper.bind(this);
    this.toggleDynamicLighting = this.toggleDynamicLighting.bind(this);
    this.updateDynamicLight = this.updateDynamicLighting.bind(this);
    this.updateLights = this.updateLights.bind(this);
    this.toggleInfo = this.toggleInfo.bind(this);
    this.toggleTools = this.toggleTools.bind(this);
    this.handleToolMenuExpanded = this.handleToolMenuExpanded.bind(this);
    this.handleToolMenuTransition = this.handleToolMenuTransition.bind(this);
    this.toggleQuality = this.toggleQuality.bind(this);
    this.drawMeasurement = this.drawMeasurement.bind(this);
    this.drawAnnotations = this.drawAnnotations.bind(this);
    this.viewAnnotation = this.viewAnnotation.bind(this);
    this.onAnnotationPresentationToggle = this.onAnnotationPresentationToggle.bind(
      this
    );
    this.drawSpriteTarget = this.drawSpriteTarget.bind(this);
    this.computeSpriteScaleFactor = this.computeSpriteScaleFactor.bind(
      this
    );
    this.updateDynamicMaterials = this.updateDynamicMaterials.bind(this);
    this.deepUpdateThreeMaterial = this.deepUpdateThreeMaterial.bind(
      this
    );
    this.updateThreeMaterial = this.updateThreeMaterial.bind(this);
    this.updateMaterials = this.updateMaterials.bind(this);
    this.updateDynamicShaders = this.updateDynamicShaders.bind(this);
    this.updateShaders = this.updateShaders.bind(this);
    this.updateRenderSize = this.updateRenderSize.bind(this);
    this.setEnvMap = this.setEnvMap.bind(this);
    this.exportObj = this.exportObj.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.updateButtonLabel = this.updateButtonLabel.bind(this);
    this.toggleRaycasting = this.toggleRaycasting.bind(this);
    this.enterVR = this.enterVR.bind(this);
    this.exitVR = this.exitVR.bind(this);
    this.animateZoom = this.animateZoom.bind(this);
    this.animateAnnotationTransition = this.animateAnnotationTransition.bind(
      this
    );
    this.cameraTargetTransition = this.cameraTargetTransition.bind(this);
    this.annotationThrottleTime = 0;
    this.annotationOffsetPlaceholder = 0;
    this.positionAnnotations = this.positionAnnotations.bind(this);
    this.hideAnnotations = this.hideAnnotations.bind(this);
    // event handlers

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    // touch events
    this.handlePinchMove = this.handlePinchMove.bind(this);
    this.handlePinch = this.handlePinch.bind(this);
    this.handleTouch = this.handleTouch.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);

    // VR
    this.vrSupported = checkVR();

    //Updatable UI
    this.panelGroup = new ThreeGUIGroup("tools");
  }

  /** COMPONENT LIFECYCYLE
   *****************************************************************************/

  componentDidMount() {
    this.initThree();
    window.addEventListener("resize", this.handleWindowResize);
    // TODO will remove this after when FB fixes onWheel events (https://github.com/facebook/react/issues/14856)
    this.threeView.addEventListener("wheel", this.handleMouseWheel);
  }

  componentDidUpdate(prevProps, prevState) {
    const { cameraControlPaused } = this.state;
    const { changeAnnotationFocus } = this.props;
    if (prevState.units !== this.state.units) {
      this.removeAxisLabels();
      this.addAxisLabels();
    }
    if (prevState.cameraControlPaused && !cameraControlPaused) {
      changeAnnotationFocus(false);
    }
    if (prevProps.saveStatus !== this.props.saveStatus) {
      this.updateButtonLabel(
        this.saveToolSettingsButton,
        "save tool settings",
        "settings saved",
        "settings save failed"
      );
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.mesh !== this.props.mesh) return true;
    if (nextState.loadProgress !== this.state.loadProgress) return true;
    if (nextState.showInfo !== this.state.showInfo) return true;
    if (nextState.dynamicLighting !== this.state.dynamicLighting) return true;
    if (nextState.detailMode !== this.state.detailMode) return true;
    if (nextState.toolsActive !== this.state.toolsActive) return true;
    //if (nextState.updatingUI !== this.state.updatingUI) return true;
    if (nextState.units !== this.state.units) return true;
    if (nextProps.loggedIn !== this.props.loggedIn) return true;
    if (nextProps.saveStatus !== this.props.saveStatus) return true;
    if (nextState.dragging !== this.state.dragging) return true;
    if (nextState.isRaycasting !== this.state.isRaycasting) return true;
    //if (nextState.newContentToggle !== this.state.newContentToggle) return true;
    return false;
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    this.threeView.removeEventListener("wheel", this.handleMouseWheel);
  }

  render() {
    const {
      loadProgress,
      loadText,
      showInfo,
      dynamicLighting,
      detailMode,
      toolsActive,
      dragging,
      isRaycasting,
      annotations
    } = this.state;
    const { info } = this.props;
    let threeViewClassName = "three-view";
    threeViewClassName +=
      toolsActive === true ? " tools-active" : " tools-inactive";
    threeViewClassName += dragging === true ? " dragging" : "";
    threeViewClassName += isRaycasting === true ? " raycasting" : "";
    return (
      <div className="three-gui-container">
        {this.controls ? this.controls : null}
        <div className="three-view-container">
          {this.panelLayout ? this.panelLayout : <span />}
          <InfoModal
            className="three-info-modal"
            active={showInfo}
            info={info}
          />
          <LoaderModal
            text={loadText + loadProgress}
            className="three-loader-dimmer"
            active={loadProgress !== 100}
          />
          <ThreeTouchControls
            onTouchStartCallback={this.handleTouch}
            onTouchEndCallback={this.handleTouch}
            onTouchMoveCallback={this.handleTouchMove}
            onPinchStartCallback={this.handlePinch}
            onPinchEndCallback={this.handlePinch}
            onPinchMoveCallback={this.handlePinchMove}
          >
            <div
              ref={ref => {
                this.threeView = ref;
              }}
              className={threeViewClassName}
              onMouseDown={this.handleMouseDown}
              onMouseMove={this.handleMouseMove}
              onMouseUp={this.handleMouseUp}
              onKeyDown={this.handleKeyDown}
              onKeyUp={this.handleKeyUp}
              onContextMenu={event => event.preventDefault()}
              contentEditable
            />
          </ThreeTouchControls>
        </div>
      </div>
    );
  }

  /** THREE JS 'LIFECYCYLE'
   *****************************************************************************/
  initThree() {
    const { localAssets } = this.props;
    this.GUI = new ThreeGUI();
    this.GUI.registerComponent("THREE_RANGE_SLIDER", ThreeRangeSlider);
    this.GUI.registerComponent("THREE_BUTTON", ThreeButton);
    this.GUI.registerComponent("THREE_TOGGLE", ThreeToggle);
    this.GUI.registerComponent("THREE_TOGGLE_MULTI", ThreeToggleMulti);
    this.GUI.registerComponent("THREE_COLOR_PICKER", ThreeColorPicker);
    this.GUI.registerComponent(
      "THREE_EYEDROPPER_COLOR_PICKER",
      ThreeEyeDropperColorPicker
    );
    this.GUI.registerComponent(
      "THREE_MICRO_COLOR_PICKER",
      ThreeMicroColorPicker
    );
    this.GUI.registerComponent(
      "THREE_ANNOTATION_CONTROLLER",
      ThreeAnnotationController
    );
    this.GUI.registerComponent("THREE_MEASURE", ThreeMeasure);
    this.GUI.registerComponent("THREE_SCREENSHOT", ThreeScreenshot);
    this.GUI.registerComponent("THREE_MESH_EXPORTER", ThreeMeshExporter);
    this.GUI.registerLayout("THREE_GROUP_LAYOUT", ThreeGUILayout);
    this.GUI.registerLayout("THREE_PANEL_LAYOUT", ThreeGUIPanelLayout);

    const { color, intensity, decay, distance } = this.state.dynamicLightProps;

    // init camera
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height); // use defaults for fov and near and far frustum;
    this.overlayCamera = new THREE.PerspectiveCamera(
      50,
      this.width / this.height
    );
    this.vrCamera = new THREE.PerspectiveCamera();
    this.camera.add(this.vrCamera);
    this.spherical = new THREE.Spherical();
    this.offset = new THREE.Vector3();
    this.quat = new THREE.Quaternion().setFromUnitVectors(
      this.camera.up,
      new THREE.Vector3(0, 1, 0)
    );
    this.quatInverse = this.quat.clone().inverse();
    this.rotationTarget = new THREE.Vector3();

    // Scenes
    this.scene = new THREE.Scene();
    this.overlayScene = new THREE.Scene();
    this.envScene = new THREE.Scene();
    this.guiScene = new THREE.Scene();
    this.camera.target = new THREE.Vector3();

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);

    this.dynamicLight = new THREE.PointLight(color, intensity, distance, decay);
    this.dynamicLight.target = new THREE.Vector3();

    this.dynamicLight.castShadow = true;
    this.dynamicLight.shadow.mapSize.width = 2048;
    this.dynamicLight.shadow.mapSize.height = 2048;
    this.dynamicLight.shadow.bias = -0.0002;
    this.dynamicLight.shadow.camera.near = this.camera.near;
    this.dynamicLight.shadow.camera.far = this.camera.far;

    this.dynamicLight.visible = this.state.dynamicLighting;
    this.scene.add(this.dynamicLight);

    this.pointLights = new ThreePointLights();
    this.pointLights.addTo(this.scene);

    this.lightHelper = new THREE.CameraHelper(this.dynamicLight.shadow.camera);
    this.lightHelper.visible = this.state.showLightHelper;
    this.guiScene.add(this.lightHelper);

    this.scene.add(this.ambientLight);
    this.scene.add(this.camera);

    this.overlayScene.add(this.overlayCamera);

    // Label Sprite that we can just copy for all the measurement
    this.labelSprite = new LabelSprite(128, 128, "#fff", "+").toSprite();
    const { annotationSpriteTexture } = localAssets.textures;
    // annotation sprite that we can also clone
    const spriteMaterial = new THREE.SpriteMaterial({
      map: annotationSpriteTexture,
      transparent: true,
      alphaTest: 0.5,
      depthTest: false,
      depthWrite: false
    });
    this.annotationSprite = new THREE.Sprite(spriteMaterial);
    const spriteBbox = new THREE.Box3().setFromObject(this.annotationSprite);
    const centerY = (spriteBbox.max.y - spriteBbox.min.y) / 2;
    this.annotationSpriteOffset = new THREE.Vector3(0, centerY, 0);
    this.measurement = new THREE.Group();
    this.guiScene.add(this.measurement);

    this.annotationMarkers = new THREE.Group();
    this.annotationLines = new THREE.Group();

    this.guiScene.add(this.annotationMarkers);
    this.overlayScene.add(this.annotationLines);

    // WebGL Renderer
    this.webGLRenderer = new THREE.WebGLRenderer({
      alpha: true,
      autoClear: false,
      antialias: true,
      gammaInput: true,
      gammaOutput: true,
      preserveDrawingBuffer: true
    });

    // Renderer and DOM
    this.webGLRenderer.shadowMap.enabled = true;
    this.webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.webGLRenderer.setPixelRatio(1);
    this.threeView.appendChild(this.webGLRenderer.domElement);
    this.width = this.webGLRenderer.domElement.clientWidth;
    this.height = this.webGLRenderer.domElement.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.webGLRenderer.setSize(this.width, this.height, false);
    this.camera.updateProjectionMatrix();

    // Check if we're not on a touch device
    this.isMobile = !DISPLAY_DEVICE.DESKTOP();
    this.css2DRenderer = new CSS2DRenderer();
    this.css2DRenderer.domElement.className = "three-view-2d-renderer";
    this.css2DRenderer.setSize(this.width, this.height, false);
    this.threeView.appendChild(this.css2DRenderer.domElement);
    this.setState((prevState, props) => {
      return {
        loadProgress: prevState.loadProgress + 25,
        loadText: "Loading Mesh"
      };
    }, this.initMesh());
  }

  initControls() {
    let components = this.GUI.components;
    let layouts = this.GUI.layouts;
    let controls = new ThreeGUIGroup("controls");
    const checkTools = () => {
      for (let key in this.props.options) {
        if (key.includes("enable")) {
          let value = this.props.options[key];
          if (value) return true;
        }
      }
      return false;
    };
    // TODO should probably remove refs from these props and find a better way ...
    let buttonProps = {
      content: "re-center",
      className: "three-controls-button",
      icon: "crosshairs",
      onClick: () => this.centerCamera(),
      labelPosition: "right",
      color: "grey"
    };

    controls.addComponent("resetCamera", components.THREE_BUTTON, {
      ...buttonProps
    });

    controls.addComponent("quality", components.THREE_BUTTON, {
      ...buttonProps,
      content: "quality: " + this.state.quality.current.label,
      icon: "signal",
      ref: ref => (this.toggleQualityButton = ref),
      onClick: () => this.toggleQuality()
    });

    controls.addComponent("screenshot", components.THREE_SCREENSHOT, {
      extension: "jpg",
      mime: "image/jpeg",
      renderer: this.webGLRenderer
    });

    if (this.props.options.enableDownload) {
      controls.addComponent("mesh-export", components.THREE_MESH_EXPORTER, {
        threeInstance: THREE,
        mesh: this.mesh
      });
    }

    if (this.props.options.enableLight) {
      controls.addComponent("lighting", components.THREE_BUTTON, {
        ...buttonProps,
        content: "lighting: off",
        icon: "lightbulb",
        ref: ref => (this.enableLightButton = ref),
        onClick: () => this.toggleDynamicLighting()
      });
    }

    if (this.props.skyboxTexture.image) {
      controls.addComponent("background", components.THREE_BUTTON, {
        ...buttonProps,
        content: "background",
        icon: "image",
        onClick: () => this.toggleBackground()
      });
    }

    if (this.props.info) {
      controls.addComponent("info", components.THREE_BUTTON, {
        ...buttonProps,
        content: "info",
        icon: "info",
        onClick: () => this.toggleInfo()
      });
    }

    if (checkTools()) {
      controls.addComponent("tools", components.THREE_BUTTON, {
        ...buttonProps,
        content: "tools",
        icon: "wrench",
        onClick: () => this.toggleTools()
      });
      if (this.props.loggedIn === true) {
        controls.addComponent("save", components.THREE_BUTTON, {
          ...buttonProps,
          content: "save tool settings",
          icon: "setting",
          ref: ref => (this.saveToolSettingsButton = ref),
          onClick: () => this.saveSettings()
        });
      }
    }

    controls.addComponent("webvr", ThreeWebVR, {
      ...buttonProps,
      renderer: this.webGLRenderer,
      hideOnUnsupported: true,
      onExitCallback: this.exitVR,
      onEnterCallback: this.enterVR,
      frameOfReference: "stage",
      className: "three-controls-button"
    });

    this.controls = (
      <layouts.THREE_GROUP_LAYOUT
        group={controls}
        groupClass="three-controls-container"
      />
    );
  }

  update() {
    this.updateCamera();
    this.renderWebGL();
    this.renderCSS();
  }

  renderWebGL() {
    this.webGLRenderer.clear();
    if (
      this.sceneComposer !== undefined &&
      this.modelComposer !== undefined &&
      this.effectComposer !== undefined &&
      this.state.vrActive === false
    ) {
      this.sceneComposer.render(0.01);
      this.modelComposer.render(0.01);
      this.guiComposer.render(0.01);
      this.effectComposer.render(0.01);
    } else {
      this.webGLRenderer.render(
        this.scene,
        this.state.vrActive === true ? this.vrCamera : this.camera
      );
    }
  }

  renderCSS() {
    //render css
    this.css2DRenderer.render(
      this.overlayScene,
      this.state.vrActive === true ? this.vrCamera : this.overlayCamera
    );
  }

  animate() {
    if (this.vrSupported) {
      this.webGLRenderer.setAnimationLoop(this.animate);
    } else {
      window.requestAnimationFrame(this.animate);
    }
    this.update();
  }

  computeAxisGuides() {
    let axes = ["x", "y", "z"];
    let colors = ["rgb(180,0,0)", "rgb(0,180,0)", "rgb(0,0,180)"];
    this.axisGuides = axes.map((axis, index) => {
      let bbox = this.bboxMesh;
      let max = {};
      max[axis] = this.bboxMesh.max[axis];
      let startVec = bbox.min.clone();
      let end = { ...bbox.min, ...max };
      let endVec = new THREE.Vector3().fromArray(Object.values(end));
      let material = new THREE.LineDashedMaterial({
        color: colors[index],
        linewidth: 4,
        dashSize: 1,
        gapSize: 1
      });
      let geometry = new THREE.Geometry();
      geometry.vertices.push(startVec, endVec);
      let line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      line.visible = false;
      line.userData = {
        start: startVec.clone(),
        end: endVec.clone(),
        axis: axis
      };
      return line;
    });
  }

  addAxisLabels() {
    let { modelUnits } = this.props.options;
    let dimensions = [this.meshWidth, this.meshHeight, this.meshDepth];
    this.axisGuides.forEach((axisGuide, index) => {
      let sprite = new LabelSprite(
        128,
        128,
        "#fff",
        convertUnits(modelUnits, this.state.units, dimensions[index])
          .toFixed(2)
          .toString() +
          " " +
          this.state.units.toLowerCase()
      ).toSprite();
      // Need to set based on actual size of model somehow
      sprite.scale.multiplyScalar(this.spriteScaleFactor);
      axisGuide.add(sprite);
      let { x, y, z } = axisGuide.userData.end;
      sprite.position.set(x, y, z);
    });
  }

  removeAxisLabels() {
    this.axisGuides.forEach((axisGuide, index) => {
      axisGuide.remove(...axisGuide.children);
    });
  }

  drawAxisGuides(showLabels) {
    if (showLabels) this.addAxisLabels();
    if (this.axisGuides.length > 0) {
      this.axisGuides.forEach(axisGuide => {
        this.guiScene.add(axisGuide);
      });
    } else {
      console.warn("Axis guides not computed. Please run computeAxisGuides");
    }
  }

  computeSpriteScaleFactor() {
    if (this.bboxMesh) {
      /* assuming sprite is 1x1 plane as per constructor, we want it no more
        than 1/4 of the mesh. A divisor of 4 seems to work best */
      this.spriteScaleFactor = Math.ceil(
        this.bboxMesh.max.distanceTo(this.bboxMesh.min) / 4
      );
    } else {
      console.warn(
        "this.bboxMesh hasn't been computed yet. spriteScaleFactor is set to 1"
      );
      this.spriteScaleFactor = 1;
    }
  }

  drawSpriteTarget(position) {
    let sprite = this.labelSprite.clone();
    sprite.position.copy(position);
    sprite.scale.multiplyScalar(this.spriteScaleFactor);
  }

  drawMeasurement(points) {
    if (points) {
      let { modelUnits } = this.props.options;
      let { a, b, distance } = points;
      let sphere = this.labelSphere.clone();
      if (a && !b) {
        sphere.position.copy(a);
        this.measurement.add(sphere);
      } else if (a && b) {
        sphere.position.copy(b);
        this.measurement.add(sphere);
        if (distance) {
          let material = new THREE.LineBasicMaterial({
            color: "#ccc",
            linewidth: 3,
            opacity: 0.3,
            transparent: true,
            depthWrite: false,
            depthTest: false
          });
          let geometry = new THREE.Geometry();
          geometry.vertices.push(a, b);
          let line = new THREE.Line(geometry, material);
          line.computeLineDistances();
          this.measurement.add(line);

          // draw label sprite for distance
          let distanceLabel = new LabelSprite(
            128,
            128,
            "#fff",
            convertUnits(modelUnits, this.state.units, distance)
              .toFixed(2)
              .toString() +
              " " +
              this.state.units.toLowerCase()
          ).toSprite();
          distanceLabel.scale.multiplyScalar(this.spriteScaleFactor / 2);
          a = a.clone();
          b = b.clone();
          distanceLabel.position.copy(a.add(b).divideScalar(2));
          this.measurement.add(distanceLabel);
        }
      }
    } else {
      this.measurement.remove(...this.measurement.children);
    }
  }

  drawAnnotations(annotations) {
    const {
      currentAnnotationCSSObj,
      currentAnnotationCSSReadOnlyBodyObj
    } = this.state;
    for (let i = 0; i < this.annotationMarkers.children.length; i++) {
      this.annotationMarkers.children[i].remove(
        ...this.annotationMarkers.children[i].children
      );
      this.annotationMarkers.remove(...this.annotationMarkers.children);
    }
    if (currentAnnotationCSSObj) {
      this.overlayScene.remove(currentAnnotationCSSObj);
    }
    if (currentAnnotationCSSReadOnlyBodyObj) {
      this.overlayScene.remove(currentAnnotationCSSReadOnlyBodyObj);
    }
    if (annotations) {
      for (let i = 0; i < annotations.length; i++) {
        const annotationMarker = this.annotationSprite.clone();
        annotationMarker.material = this.annotationSprite.material.clone();
        annotationMarker.position.copy(annotations[i].point);
        annotationMarker.position.add(this.annotationSpriteOffset);
        annotationMarker.scale.multiplyScalar(this.spriteScaleFactor / 10);
        if (annotations[i].open) {
          annotationMarker.material.color.setHex(0x21ba45);
          const cssObj = new CSS2DObject(annotations[i].node);
          const bodyNode = annotations[i].bodyNode;
          const cssBodyObj = bodyNode
            ? new CSS2DObject(annotations[i].bodyNode)
            : null;
          this.overlayScene.add(cssObj);
          if (cssBodyObj) {
            this.overlayScene.add(cssBodyObj);
          }
          this.setState({
            currentAnnotationIndex: i,
            currentAnnotationCSSObj: cssObj,
            currentAnnotationCSSReadOnlyBodyObj: cssBodyObj
          });
        } else {
          annotationMarker.material.color.setHex(0x000000);
        }
        annotationMarker.needsUpdate = true;
        this.annotationMarkers.add(annotationMarker);
      }
    }
  }

  onAnnotationPresentationToggle(val) {
    this.setState({
      controllable: !val,
      cameraControlPaused: val,
      annotationPresentationMode: val
    });
  }

  hideAnnotations() {
    const {
      currentAnnotationIndex,
      currentAnnotationCSSObj,
      currentAnnotationCSSReadOnlyBodyObj
    } = this.state;
    const annotation = this.annotationMarkers.children[currentAnnotationIndex];
    if (annotation) {
      const cssDiv = currentAnnotationCSSObj;
      if (cssDiv) {
        cssDiv.element.style.opacity = 0;
      }
      if (currentAnnotationCSSReadOnlyBodyObj) {
        currentAnnotationCSSReadOnlyBodyObj.element.style.opacity = 0;
      }
    }
  }

  positionAnnotations(alpha = 0) {
    //Make annotations position smartly to stay in camera -- use raycaster prob
    const distance = 0.05 * this.spriteScaleFactor;
    const {
      currentAnnotationIndex,
      currentAnnotationCSSObj,
      currentAnnotationCSSReadOnlyBodyObj
    } = this.state;
    const annotation = this.annotationMarkers.children[currentAnnotationIndex];
    if (annotation) {
      const cssDiv = currentAnnotationCSSObj;
      if (cssDiv) {
        const annotationPos = annotation.position.clone().project(this.camera);
        let offset = annotationPos.x > 0 ? distance : -distance;
        this.annotationOffsetPlaceholder = THREE.Math.lerp(
          this.annotationOffsetPlaceholder,
          offset,
          this.state.deltaTime / this.dampingFactor
        );
        offset = this.annotationOffsetPlaceholder;
        if (alpha > 0) {
          cssDiv.element.style.opacity = THREE.Math.lerp(0, 1, alpha);
          if (currentAnnotationCSSReadOnlyBodyObj) {
            currentAnnotationCSSReadOnlyBodyObj.element.style.opacity = THREE.Math.lerp(
              0,
              1,
              alpha
            );
          }
        }
        // If we run into any performance issues we can change this
        annotationPos.add(new THREE.Vector3(offset, 0, 0));
        annotationPos.unproject(this.overlayCamera);
        // set annotationPos.y so that the top of the div doesn't extend beyond the viewport
        cssDiv.position.set(annotationPos.x, annotationPos.y, annotationPos.z);
      }
    }
  }

  initMesh() {
    this.mesh = this.props.mesh.object3D;
    const setMicrosurface = material => {
      if (material.type === THREE_MESH_STANDARD_MATERIAL) {
        material.metalness = 0.0;
        material.roughness = 1.0;
      }
      material.needsUpdate = true;
    };
    // rewrite this to a function to abstract  out a lot of this boilerplate
    if (this.mesh instanceof THREE.Group) {
      this.mesh.children.forEach(child => {
        child.receiveShadow = true;
        child.castShadow = true;
        if (child.material) {
          if (child.material instanceof Array) {
            child.material.forEach(material => {
              if (material.map !== null) {
                material.map.anisotropy = this.webGLRenderer.capabilities.getMaxAnisotropy();
              }
              setMicrosurface(material);
              if (this.props.renderDoubleSided) {
                material.side = THREE.DoubleSide;
              }
            });
          } else {
            setMicrosurface(child.material);
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material.map !== null) {
              child.material.map.anisotropy = this.webGLRenderer.capabilities.getMaxAnisotropy();
            }
            if (this.props.renderDoubleSided) {
              child.material.side = THREE.DoubleSide;
            }
          }
        }
      });
    } else if (this.mesh instanceof THREE.Mesh) {
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      let material = this.mesh.material;
      if (material.constructor !== Array) {
        material = [material];
      }
      material.forEach(currentMaterial => {
        if (this.props.renderDoubleSided) {
          currentMaterial.side = THREE.DoubleSide;
          if (currentMaterial.map !== null) {
            currentMaterial.map.anisotropy = this.webGLRenderer.capabilities.getMaxAnisotropy();
          }
          setMicrosurface(currentMaterial);
        }
      });
    }

    this.scene.add(this.mesh);

    this.bboxMesh = new THREE.Box3().setFromObject(this.mesh);
    this.meshHeight = this.bboxMesh.max.y - this.bboxMesh.min.y;
    this.meshWidth = this.bboxMesh.max.x - this.bboxMesh.min.x;
    this.meshDepth = this.bboxMesh.max.z - this.bboxMesh.min.z;
    this.computeSpriteScaleFactor();
    this.pointLights.addHelpers(this.guiScene, this.spriteScaleFactor);
    this.pointLights.setTarget(this.mesh);
    this.pointLights.setLightPositions(this.bboxMesh);

    this.computeAxisGuides();
    this.drawAxisGuides(true);

    this.environmentRadius = Math.max(
      this.meshWidth,
      this.meshHeight,
      this.meshDepth
    ); // diameter of sphere =  2 * meshHeight

    this.maxDistance = this.environmentRadius * 2;
    this.minDistance = Math.ceil(this.meshDepth - this.bboxMesh.max.z);
    this.minDistance = this.minDistance <= 0 ? 0.1 : this.minDistance;

    let labelSphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      depthTest: false,
      depthWrite: false,
      opacity: 0.8,
      transparent: true
    });

    let labelSphereGeometry = new THREE.SphereGeometry(
      this.environmentRadius / 200,
      16,
      16
    );
    this.labelSphere = new THREE.Mesh(labelSphereGeometry, labelSphereMaterial);
    // We need the mesh to exist if we're going to export it
    this.initControls();
    this.setState((prevState, props) => {
      return {
        loadProgress: prevState.loadProgress + 25,
        loadText: "Loading Environment"
      };
    }, this.initEnvironment());
  }

  initEnvironment() {
    let { skybox } = this.props.options;
    // Skybox
    let cubeSize = this.environmentRadius * 4;
    this.skyboxGeom = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    if (this.props.skyboxTexture.image) {
      let equirectShader = THREE.ShaderLib["equirect"];
      this.skyboxMaterial = new THREE.ShaderMaterial({
        dithering: true,
        fragmentShader: equirectShader.fragmentShader,
        vertexShader: equirectShader.vertexShader,
        uniforms: equirectShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
      });
      this.skyboxMaterial.uniforms[
        "tEquirect"
      ].value = this.props.skyboxTexture.image;
    }

    let innerColor;
    let outerColor;

    if (skybox.gradient) {
      innerColor = skybox.gradient.innerColor
        ? skybox.gradient.innerColor
        : DEFAULT_GRADIENT_COLORS.inner;
      outerColor = skybox.gradient.outerColor
        ? skybox.gradient.outerColor
        : DEFAULT_GRADIENT_COLORS.outer;
    } else {
      innerColor = DEFAULT_GRADIENT_COLORS.inner;
      outerColor = DEFAULT_GRADIENT_COLORS.outer;
    }

    // need to clean this up, it's a radial gradient not a linear gradient
    this.skyboxMaterialShader = new LinearGradientShader(
      innerColor,
      outerColor,
      this.width,
      this.height
    );
    this.skyboxMesh = new THREE.Mesh(
      this.skyboxGeom,
      this.skyboxMaterial !== undefined
        ? this.skyboxMaterial
        : this.skyboxMaterialShader.shaderMaterial
    );
    this.envScene.add(this.skyboxMesh);
    this.bboxSkybox = new THREE.Box3().setFromObject(this.skyboxMesh);
    this.setEnvMap();
    loadPostProcessor(THREE).then(values => {
      this.setState((prevState, props) => {
        return {
          loadProgress: prevState.loadProgress + 15,
          loadText: "Loading Shaders"
        };
      }, this.initPostprocessing());
    });
  }

  //{
  /** WEBGL Postprocessing
   *****************************************************************************/

  // TODO make this a separate component

  addShaderPass(pass) {
    this.setState({ shaderPasses: { ...this.state.shaderPasses, ...pass } });
  }

  hydrateSettings() { //: Promise
    const tasks = [];
    if (this.props.options.viewerSettings !== undefined) {
      const { lights, materials, shaders } = this.props.options.viewerSettings;
      tasks.push(this.updateLights(lights, () => Promise.resolve()));
      tasks.push(this.updateMaterials(materials, () => Promise.resolve()));
      const { shaderPasses } = this.state;
      const updatedPasses = {};
      // Need to copy prototype properties too, hence the use of Object.assign
      for (let key in shaders) {
        const pass = Object.assign(shaderPasses[key]);
        pass.uniforms = Object.assign(pass.uniforms, shaders[key]);
        updatedPasses[key] = pass;
      }
      tasks.push(this.updateShaders(updatedPasses, () => Promise.resolve()));
    }
    return Promise.all(tasks);
  }

  setEnvMap() {
    let mesh = this.mesh;
    if (mesh.constructor === THREE.Group) {
      mesh = mesh.children[0];
    }

    const setEnv = material => {
      if (material.type === THREE_MESH_STANDARD_MATERIAL) {
        if (this.props.skyboxTexture.image) {
          material.envMap = this.props.skyboxTexture.image;
          material.envMap.mapping = THREE.EquirectangularReflectionMapping;
          material.envMap.minFilter = THREE.LinearMipMapLinearFilter;
          material.envMap.magFilter = THREE.LinearFilter;
          material.envMapIntensity = 1;
        } else {
          let tex = new RadialGradientCanvas(
            1024,
            1024,
            this.skyboxMaterialShader.outerColor,
            this.skyboxMaterialShader.innerColor
          ).toTexture();
          material.envMap = tex;
          material.envMap.minFilter = THREE.LinearMipMapLinearFilter;
          material.envMap.magFilter = THREE.LinearFilter;
          material.envMap.mapping = THREE.EquirectangularReflectionMapping;
        }
      }
      material.needsUpdate = true;
      return material;
    };
    mesh.material = mapMaterials(mesh.material, setEnv);
  }

  initPostprocessing() {
    const rtParams = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: true
    };

    this.effectComposer = new THREE.EffectComposer(
      this.webGLRenderer,
      new THREE.WebGLRenderTarget(this.width, this.height, rtParams)
    );

    this.sceneComposer = new THREE.EffectComposer(
      this.webGLRenderer,
      new THREE.WebGLRenderTarget(this.width, this.height, rtParams)
    );

    this.modelComposer = new THREE.EffectComposer(
      this.webGLRenderer,
      new THREE.WebGLRenderTarget(this.width, this.height, rtParams)
    );

    this.guiComposer = new THREE.EffectComposer(
      this.webGLRenderer,
      new THREE.WebGLRenderTarget(this.width, this.height, rtParams)
    );

    //The environment
    const envRenderPass = new THREE.RenderPass(this.envScene, this.camera);

    // the model
    const modelRenderPass = new THREE.RenderPass(this.scene, this.camera);

    // the gui
    const guiRenderPass = new THREE.RenderPass(this.guiScene, this.camera);

    const mask = new THREE.MaskPass(this.scene, this.camera);
    const maskInverse = new THREE.MaskPass(this.scene, this.camera);
    maskInverse.inverse = true;

    const envMask = new THREE.MaskPass(this.envScene, this.camera);
    const guiMask = new THREE.MaskPass(this.guiScene, this.camera);

    const copyPass = new THREE.ShaderPass(THREE.CopyShader);
    copyPass.renderToScreen = true;

    const vignettePass = new THREE.VignettePass(
      new THREE.Vector2(this.width, this.height),
      0.1,
      new THREE.Color(0.045, 0.045, 0.045)
    );

    this.addShaderPass({ vignette: vignettePass });

    const clearMask = new THREE.ClearMaskPass();

    const brightnessShader = THREE.BrightnessContrastShader;
    const brightnessPass = new THREE.ShaderPass(brightnessShader);
    brightnessPass.uniforms["contrast"].value = 0.15;

    const modelBloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      0.2,
      0,
      0.3,
      this.modelComposer.renderTarget2.texture
    );

    const EDLParams = {
      screenWidth: this.width,
      screenHeight: this.height,
      opacity: 1.0,
      edlStrength: 0,
      enableEDL: false,
      onlyEDL: false,
      radius: 0
    };

    const EDLPass = new THREE.EDLPass(this.scene, this.camera, EDLParams);
    const chromaKeyPass = new THREE.ChromaKeyPass(
      false,
      new THREE.Color(0),
      0.5,
      false
    );
    chromaKeyPass.renderToScreen = false;
    this.addShaderPass({ EDL: EDLPass });
    this.addShaderPass({ ChromaKey: chromaKeyPass });

    const SSAOPass = new THREE.SSAOPass(this.scene, this.camera);

    SSAOPass.renderToScreen = false;

    this.sceneComposer.addPass(envRenderPass);
    this.sceneComposer.addPass(brightnessPass);
    this.sceneComposer.addPass(vignettePass);

    this.modelComposer.addPass(modelRenderPass);

    this.guiComposer.addPass(guiRenderPass);

    const rawScene = new THREE.TexturePass(
      this.sceneComposer.renderTarget2.texture
    );
    const rawModel = new THREE.TexturePass(
      this.modelComposer.renderTarget2.texture
    );
    const rawGui = new THREE.TexturePass(
      this.guiComposer.renderTarget2.texture,
      0.8
    );
    this.addShaderPass({ GUI: rawGui });

    this.effectComposer.addPass(rawModel);
    this.effectComposer.addPass(chromaKeyPass);
    this.effectComposer.addPass(SSAOPass);
    this.effectComposer.addPass(EDLPass);
    this.effectComposer.addPass(maskInverse);
    this.effectComposer.addPass(rawScene);
    this.effectComposer.addPass(clearMask);
    this.effectComposer.addPass(modelBloomPass);
    this.effectComposer.addPass(guiMask);
    this.effectComposer.addPass(rawGui);
    this.effectComposer.addPass(clearMask);
    this.effectComposer.addPass(copyPass);

    this.updateCamera();
    this.centerCamera();
    this.setState(
      (prevState, props) => {
        return {
          loadProgress: prevState.loadProgress + 25,
          loadText: "Loading Tools"
        };
      },
      () => {
        this.hydrateSettings().then(this.initTools);
      }
    );
  }
  //}

  /** Rendering / Updates / Camera
   *****************************************************************************/
  //{
  getScale(dstScale) {
    let { maxScale } = this.state;
    if (dstScale > maxScale) dstScale = maxScale;
    if (dstScale <= 0) dstScale = 0;
    return dstScale;
  }

  panBounds(targetPosition) {
    return this.bboxSkybox.containsPoint(targetPosition);
  }

  fitPerspectiveCamera() {
    let distance = this.camera.position.distanceTo(this.bboxMesh.min);
    let fovV =
      2 *
      Math.atan((this.bboxMesh.max.y - this.bboxMesh.max.y) / (2 * distance)) *
      (180 / Math.PI);
  }

  pan(deltaX, deltaY) {
    let offset = new THREE.Vector3();
    let position = this.camera.position;
    offset.copy(position).sub(this.camera.target);

    let targetDistance = offset.length();
    targetDistance *= Math.tan(((this.camera.fov / 2) * Math.PI) / 180.0);
    let dstX = (2 * deltaX * targetDistance) / this.height;
    let dstY = (2 * deltaY * targetDistance) / this.height;

    let left = panLeft(dstX, this.camera.matrix, 0.5);
    let up = panUp(dstY, this.camera.matrix, 0.5);

    this.setState({ panOffset: this.state.panOffset.add(left.add(up)) });
  }

  *animateZoom(pos, duration, cameraPos, storeLastPosition = false) {
    // TODO should clean this up and abstract a lot of this away into another method that can also be used in controlCamera
    const { spherical } = this;
    if (storeLastPosition) {
      this.setState({ lastCameraPosition: this.camera.position.clone() });
    }
    this.hideAnnotations();
    const distance = 10;
    let dest;
    if (!cameraPos) {
      dest = pos.clone().normalize();
      dest.multiplyScalar(distance);
    } else {
      dest = cameraPos.clone();
    }
    const animationTarget = pos.clone();
    const startTarget = this.camera.target.toArray();
    const endTarget = [0, 0, 0];
    const start = new THREE.Vector3(
      spherical.radius,
      spherical.phi,
      spherical.theta
    ).toArray();
    const sphericalDest = new THREE.Spherical().setFromVector3(dest);
    const end = new THREE.Vector3(
      sphericalDest.radius,
      sphericalDest.phi,
      sphericalDest.theta
    ).toArray();
    // should yield at every frame
    let tempSpherical = new THREE.Spherical();
    for (let i = 0; i < duration; i += this.state.deltaTime) {
      this.camera.target.set(
        ...lerpArrays(startTarget, endTarget, i / duration)
      );
      this.offset.copy(this.camera.position).sub(this.camera.target);
      this.offset.applyQuaternion(this.quat);
      tempSpherical.set(...lerpArrays(start, end, i / duration));
      spherical.setFromVector3(this.offset);
      spherical.theta = tempSpherical.theta;
      spherical.phi = tempSpherical.phi;
      spherical.theta = Math.max(
        this.minAzimuthAngle,
        Math.min(this.maxAzimuthAngle, spherical.theta)
      );
      spherical.phi = Math.max(
        this.minPolarAngle,
        Math.min(this.maxPolarAngle, spherical.phi)
      );
      spherical.makeSafe();
      spherical.radius = tempSpherical.radius;
      spherical.radius = Math.max(
        this.minDistance,
        Math.min(this.maxDistance, spherical.radius)
      );
      this.offset.setFromSpherical(spherical);
      this.offset.applyQuaternion(this.quatInverse);
      this.camera.position.copy(this.camera.target).add(this.offset);
      this.camera.lookAt(this.lastTarget.lerp(animationTarget, i / duration));
      if (!this.state.dynamicLightProps.lock) {
        this.dynamicLight.position
          .copy(this.camera.position)
          .add(this.state.dynamicLightProps.offset);
        this.dynamicLight.needsUpdate = true;
      }
      yield null;
    }
    for (let i = 0; i < duration / 2; i += this.state.deltaTime) {
      this.positionAnnotations(i / (duration / 2));
      yield null;
    }
    this.setState({
      cameraTargetTransitionRequired: true,
      cameraControlPaused: true
    });
    yield null;
  }

  *cameraTargetTransition(duration) {
    this.hideAnnotations();
    const { lastCameraPosition } = this.state;
    const end = this.camera.target.toArray();
    const start = this.lastTarget.toArray();
    const posAnimation = this.animateZoom(
      this.camera.target,
      duration,
      lastCameraPosition.clone()
    );
    for (let i = 0; i < duration; i += this.state.deltaTime) {
      this.lastTarget.set(...lerpArrays(start, end, i / duration));
      this.camera.lookAt(this.lastTarget);
      posAnimation.next();
      yield null;
    }
    // wait for the animation to finish if things go out of sync
    while (!posAnimation.next().done) {
      yield null;
    }
    this.camera.target.copy(this.lastTarget);
    this.setState({ cameraTargetTransitionRequired: false });
  }

  controlAnimation() {
    const { controllable, animator, annotationPresentationMode } = this.state;
    if (!controllable) {
      if (animator != null) {
        if (animator.next().done) {
          this.setState({
            controllable: annotationPresentationMode ? false : true,
            target: undefined,
            animator: null
          });
        }
      }
    }
  }

  rotate(deltaX, deltaY) {
    let { sphericalDelta } = this.state;
    sphericalDelta.theta -=
      ((2 * Math.PI * deltaX) / this.width) * this.rotateSpeed;
    sphericalDelta.phi -=
      ((2 * Math.PI * deltaY) / this.height) * this.rotateSpeed;
  }

  zoom(zoomDelta) {
    let { scale, cameraControlPaused } = this.state;
    const sign = zoomDelta < 0 ? -1 : zoomDelta > 0 ? 1 : 0;
    scale = (1 - Math.pow(0.95, this.zoomSpeed)) * sign;
    this.setState({
      scale: scale,
      cameraControlPaused: false
    });
  }

  orbit(x, y) {
    if (this.state.dragging) {
      if (this.state.shiftDown || this.state.rmbDown || this.state.pinching) {
        const { panStart, panEnd, panDelta } = this.state;
        panEnd.set(x, y);
        panDelta.subVectors(panEnd, panStart);
        this.pan(panDelta.x, panDelta.y);
        this.setState({
          panEnd: panEnd,
          panDelta: panDelta,
          panStart: panStart.copy(panEnd)
        });
      } else {
        const { rotateStart, rotateEnd, rotateDelta } = this.state;
        rotateEnd.set(x, y);
        rotateDelta.subVectors(rotateEnd, rotateStart);
        this.rotate(rotateDelta.x, rotateDelta.y);
        this.setState({
          rotateEnd: rotateEnd,
          rotateDelta: rotateDelta,
          rotateStart: rotateStart.copy(rotateEnd)
        });
      }
    }
  }

  centerCamera() {
    this.setState({
      controllable: false,
      animator: this.center(2),
      cameraControlPaused: true
    });
  }

  *center(duration) {
    const resetVector = new THREE.Vector3(0, 0, this.maxDistance);
    const zero = new THREE.Vector3(0, 0, 0);
    const start = this.camera.position.clone().toArray();
    const end = resetVector.toArray();
    const startTarget = this.lastTarget.toArray();
    const endTarget = [0, 0, 0];
    for (let i = 0; i < duration; i += this.state.deltaTime) {
      this.camera.position.set(...lerpArrays(start, end, i / duration));
      this.camera.target.set(
        ...lerpArrays(startTarget, endTarget, i / duration)
      );
      this.camera.lookAt(this.camera.target);
      yield null;
    }
    this.camera.position.copy(resetVector);
    this.lastTarget.copy(zero);
    this.offset.copy(zero);
    this.spherical = new THREE.Spherical();
    this.camera.updateProjectionMatrix();
    yield null;
  }

  updateCamera() {
    if (this.state.controllable) this.controlCamera();
    else this.controlAnimation();
    this.setState({ deltaTime: this.clock.getDelta() });
  }

  controlCamera() {
    // Borrowed from THREEJS OrbitControls
    const { sphericalDelta, panOffset, cameraControlPaused } = this.state;
    const { spherical } = this;
    let {
      scale,
      cameraTargetTransitionRequired,
      animator,
      lastScale
    } = this.state;

    if (cameraTargetTransitionRequired) {
      if (!cameraControlPaused) {
        if (!animator) {
          this.setState({
            animator: this.cameraTargetTransition(1),
            controllable: false
          });
          return;
        }
      }
    }

    this.offset.copy(this.camera.position).sub(this.camera.target);
    this.offset.applyQuaternion(this.quat);
    spherical.setFromVector3(this.offset);
    spherical.theta += sphericalDelta.theta;
    spherical.phi += sphericalDelta.phi;
    spherical.theta = Math.max(
      this.minAzimuthAngle,
      Math.min(this.maxAzimuthAngle, spherical.theta)
    );
    spherical.phi = Math.max(
      this.minPolarAngle,
      Math.min(this.maxPolarAngle, spherical.phi)
    );
    spherical.makeSafe();
    spherical.radius *= 1 + scale;
    spherical.radius = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, spherical.radius)
    );
    this.camera.target.add(panOffset);
    this.offset.setFromSpherical(spherical);
    this.offset.applyQuaternion(this.quatInverse);
    this.camera.position.copy(this.camera.target).add(this.offset);
    if (this.origCameraPos === undefined)
      this.origCameraPos = this.camera.position;
    if (this.state.dragging) {
      sphericalDelta.theta *= 1 - this.dampingFactor;
      sphericalDelta.phi *= 1 - this.dampingFactor;
      panOffset.multiplyScalar(1 - this.dampingFactor);
    } else {
      sphericalDelta.set(0, 0, 0);
      panOffset.set(0, 0, 0);
    }
    if (!cameraTargetTransitionRequired) {
      this.camera.lookAt(this.camera.target);
    }
    if (!this.state.dynamicLightProps.lock) {
      this.dynamicLight.position
        .copy(this.camera.position)
        .add(this.state.dynamicLightProps.offset);
      this.dynamicLight.needsUpdate = true;
    }
    scale *= 1.0 - this.dampingFactor;
    this.setState({
      scale: scale
    });
    this.positionAnnotations();
  }

  updateThreeMaterial(material, prop, scale) {
    if (material[prop] !== null || material[prop] !== undefined) {
      if (prop === "normalScale") {
        material[prop].set(scale, scale, 0);
      } else {
        material[prop] = scale;
      }
      material.needsUpdate = true;
    }
    return material;
  }

  deepUpdateThreeMaterial(obj) {
    let children = this.mesh.children;
    if (children.length === 0) {
      children = [this.mesh];
    }
    for (let key in obj) {
      const val = obj[key];
      if (val.constructor === Object) {
        this.deepUpdateThreeMaterial(val);
      } else {
        for (let i = 0; i < children.length; i++) {
          const mesh = children[i];
          mesh.material = mapMaterials(mesh.material, _material =>
            this.updateThreeMaterial(_material, key, val)
          );
        }
      }
    }
  }

  updateMaterials(obj, cb) {
    const { materialsInfo } = this.state;
    const updated = { ...materialsInfo, ...obj };
    this.setState(
      {
        materialsInfo: updated
      },
      () => {
        this.deepUpdateThreeMaterial(obj);
        if (cb !== undefined) {
          cb();
        }
      }
    );
  }

  updateDynamicMaterials(scale, prop) {
    const updated = { ...this.state.materialsInfo };
    const update = (scale, prop, obj) => {
      for (let key in obj) {
        const val = obj[key];
        if (val.constructor === Object) {
          update(scale, prop, obj[key]);
        } else {
          if (key === prop) {
            obj[key] = scale;
          }
        }
      }
    };
    update(scale, prop, updated);
    this.updateMaterials(updated);
  }

  updateRenderSize(resolution, updateCSSRenderer = true) {
    const [width, height] = resolution.map(val =>
      Math.floor(val / this.state.quality.current.value)
    );
    this.webGLRenderer.setSize(width, height, false);
    const { clientWidth, clientHeight } = this.webGLRenderer.domElement;
    if (updateCSSRenderer) {
      this.css2DRenderer.setSize(clientWidth, clientHeight, false);
    }
    this.sceneComposer.setSize(width, height, false);
    this.modelComposer.setSize(width, height, false);
    this.guiComposer.setSize(width, height, false);
    this.effectComposer.setSize(width, height, false);
    // also do the other stuff dependent on resolution - should maybe dispatch an event?
    this.skyboxMaterialShader.updateUniforms(
      "resolution",
      new THREE.Vector2(width, height)
    );
    this.updateDynamicShaders(width, "EDL", "screenWidth");
    this.updateDynamicShaders(height, "EDL", "screenHeight");
    this.updateDynamicShaders(
      new THREE.Vector2(width, height),
      "vignette",
      "resolution"
    );
    this.camera.aspect = clientWidth / clientHeight;
    this.overlayCamera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.overlayCamera.updateProjectionMatrix();
    this.positionAnnotations();
  }

  updateShaders(obj, cb) {
    const { shaderPasses } = this.state;
    this.setState(
      {
        shaderPasses: { ...shaderPasses, ...obj }
      },
      () => {
        if (cb !== undefined) {
          cb();
        }
      }
    );
  }

  updateDynamicShaders(
    value,
    shaderName,
    uniformProp
  ) {
    const { shaderPasses } = this.state;
    // Need to copy prototype properties too
    const pass = Object.assign(shaderPasses[shaderName]);
    const uniforms = { ...pass.uniforms };
    uniforms[uniformProp].value = value;
    pass.uniforms = uniforms;
    switch (uniformProp) {
      case "screenWidth":
        if (pass.depthRenderTarget !== undefined) {
          pass.depthRenderTarget.width = value;
        }
        break;

      case "screenHeight":
        if (pass.depthRenderTarget !== undefined) {
          pass.depthRenderTarget.height = value;
        }
        break;

      case "useTexture":
        if (value) {
          this.EDLRadiusRangeSlider.updateThreshold(
            0,
            this.EDL_TEXTURE_RADIUS,
            this.EDL_TEXTURE_STEP
          );
          this.EDLStrengthRangeSlider.updateThreshold(
            0,
            this.EDL_TEXTURE_RADIUS,
            this.EDL_TEXTURE_STEP
          );
        } else {
          this.EDLRadiusRangeSlider.resetToDefaults();
          this.EDLStrengthRangeSlider.resetToDefaults();
        }
        break;

      case "replacementColor":
        pass.setReplacementColor(value);
        break;

      default:
        break;
    }
    const updatedPasses = { ...shaderPasses };
    updatedPasses[shaderName] = pass;
    this.updateShaders(updatedPasses);
  }

  updateLights(obj, cb) {
    const { dynamicLightProps } = this.state;
    this.setState(
      {
        dynamicLightProps: { ...dynamicLightProps, ...obj }
      },
      () => {
        if (!this.state.dynamicLightProps.lock) {
          this.dynamicLight.position
            .copy(this.camera.position)
            .add(this.state.dynamicLightProps.offset);
        }
        for (let key in this.state.dynamicLightProps) {
          if (key !== "lock") {
            this.dynamicLight[key] = this.state.dynamicLightProps[key];
          }
        }
        this.dynamicLight.needsUpdate = true;
        if (cb !== undefined) {
          cb();
        }
      }
    );
  }

  updateDynamicLighting(
    value,
    prop
  ) {
    const { dynamicLightProps } = this.state;
    let updated = {};
    if (!prop.includes("offset")) {
      updated[prop] = value;
    } else {
      if (value.constructor.name === THREE_VECTOR3) {
        updated[prop] = value;
      } else {
        const axis = prop.split("offset")[1];
        const offset = dynamicLightProps.offset.clone();
        switch (axis) {
          case "X":
            offset.x = value;
            break;

          case "Y":
            offset.y = value;
            break;

          case "Z":
            offset.z = value;
            break;

          default:
            break;
        }
        prop = "offset";
        updated.offset = offset;
      }
    }
    if (dynamicLightProps[prop] !== undefined) {
      this.updateLights(updated);
    }
  }

  /** UI
   *****************************************************************************/
  initTools() {
    const layouts = this.GUI.layouts;
    const components = this.GUI.components;
    //let panelGroup = new ThreeGUIGroup("tools");

    /***************** ANNOTATIONS *********************************************/

    if (this.props.enableAnnotations || true) {
      //Set enableAnnotations in props
      const annotationGroup = new ThreeGUIGroup("annotations");
      annotationGroup.addComponent(
        "controller",
        components.THREE_ANNOTATION_CONTROLLER,
        {
          drawCallback: this.drawAnnotations,
          updateCallback: this.updateAnnotationShortcuts,
          cameraCallback: this.viewAnnotation,
          onActiveCallback: val => this.toggleRaycasting(val),
          camera: this.camera,
          mesh: this.mesh,
          annotations: this.annotations,
          webGL: this.webGLRenderer.domElement,
          css: this.css2DRenderer.domElement,
          threeViewId: this.props.threeViewId,
          onTogglePresentationMode: this.onAnnotationPresentationToggle,
          presentationRef: this.threeView
        }
      );

      this.panelGroup.addGroup("annotations", annotationGroup);
    }

    /***************** MEASUREMENT *********************************************/
    if (this.props.options.enableMeasurement) {
      let measurementGroup = new ThreeGUIGroup("measurement");

      measurementGroup.addComponent("measure", components.THREE_MEASURE, {
        updateCallback: this.drawMeasurement,
        onActiveCallback: val => this.toggleRaycasting(val),
        camera: this.camera,
        mesh: this.mesh,
        target: this.webGLRenderer.domElement
      });

      measurementGroup.addComponent("show axes", components.THREE_TOGGLE, {
        callback: this.showAxes,
        defaultVal: this.state.showAxes,
        title: "show axes"
      });

      const unitButtons = [
        {
          label: "mm",
          defaultVal: true,
          toggle: false,
          callback: () => this.setState({ units: MM })
        },
        {
          label: "cm",
          defaultVal: true,
          toggle: false,
          callback: () => this.setState({ units: CM })
        },
        {
          label: "in",
          defaultVal: false,
          toggle: false,
          callback: () => this.setState({ units: IN })
        },
        {
          label: "ft",
          defaultVal: false,
          toggle: false,
          callback: () => this.setState({ units: FT })
        }
      ];
      measurementGroup.addComponent("units", components.THREE_TOGGLE_MULTI, {
        buttons: unitButtons,
        title: "units"
      });

      this.panelGroup.addGroup("measurement", measurementGroup);
    }
    // ***************************** LIGHTS ************************************
    if (this.props.options.enableLight) {
      const { dynamicLightProps } = this.state;
      const offsetMax = Number(this.environmentRadius.toFixed(2)) * 2;
      const step = Number((offsetMax / 100).toFixed(2));

      const lightGroup = new ThreeGUIGroup("lights");
      lightGroup.addComponent("helper", components.THREE_TOGGLE, {
        callback: this.showLightHelper,
        defaultVal: this.state.showLightHelper,
        title: "show light helper"
      });
      lightGroup.addComponent("intensity", components.THREE_RANGE_SLIDER, {
        min: 0.0,
        max: 4.0,
        step: 0.1,
        title: "intensity",
        defaultVal: dynamicLightProps.intensity,
        callback: value => this.updateDynamicLighting(value, "intensity")
      });
      lightGroup.addComponent("color", components.THREE_COLOR_PICKER, {
        title: "color",
        color: "#" + dynamicLightProps.color.getHexString(),
        callback: color => this.updateDynamicLighting(color, "color")
      });
      let offsetGroup = new ThreeGUIGroup("three-tool-group");
      offsetGroup.addComponent("lock", components.THREE_TOGGLE, {
        title: "lock",
        defaultVal: dynamicLightProps.lock,
        callback: value => this.updateDynamicLighting(value, "lock")
      });
      let offsetProps = {
        key: 0,
        min: -offsetMax,
        max: offsetMax,
        step: step,
        title: "x-axis",
        defaultVal: dynamicLightProps.offset.x,
        callback: value => this.updateDynamicLighting(value, "offsetX")
      };
      offsetGroup.addComponent("x-axis", components.THREE_RANGE_SLIDER, {
        ...offsetProps
      });
      offsetGroup.addComponent("y-axis", components.THREE_RANGE_SLIDER, {
        ...offsetProps,
        key: 1,
        title: "y-axis",
        defaultVal: dynamicLightProps.offset.y,
        callback: value => this.updateDynamicLighting(value, "offsetY")
      });
      offsetGroup.addComponent("z-axis", components.THREE_RANGE_SLIDER, {
        ...offsetProps,
        key: 2,
        title: "z-axis",
        defaultVal: dynamicLightProps.offset.z,
        callback: value => this.updateDynamicLighting(value, "offsetZ")
      });
      lightGroup.addGroup("offset", offsetGroup);
      this.panelGroup.addGroup("lights", lightGroup);
    }

    /****************************** SHADERS ***********************************/

    if (this.props.options.enableShaders) {
      const { EDL, ChromaKey } = this.state.shaderPasses;
      const shaderGroup = new ThreeGUIGroup("shaders");
      const edlGroup = new ThreeGUIGroup("edl");

      edlGroup.addComponent("enable", components.THREE_TOGGLE, {
        key: 0,
        title: "enable",
        callback: value => this.updateDynamicShaders(value, "EDL", "enableEDL"),
        defaultVal: EDL.uniforms.enableEDL.value
      });

      this.settingsMask.shaders.add("enableEDL");

      const edlShadingGroup = new ThreeGUIGroup("edlShading");

      edlShadingGroup.addComponent("edlOnly", components.THREE_TOGGLE, {
        key: 10,
        callback: value => this.updateDynamicShaders(value, "EDL", "onlyEDL"),
        defaultVal: EDL.uniforms.onlyEDL.value,
        title: "edl only"
      });

      this.settingsMask.shaders.add("onlyEDL");

      edlShadingGroup.addComponent(
        "geometryAndTexture",
        components.THREE_TOGGLE,
        {
          key: 11,
          callback: value =>
            this.updateDynamicShaders(value, "EDL", "useTexture"),
          defaultVal: EDL.uniforms.useTexture.value,
          title: "geometry + texture"
        }
      );

      this.settingsMask.shaders.add("useTexture");
      edlShadingGroup.addComponent(
        "color",
        components.THREE_MICRO_COLOR_PICKER,
        {
          title: "color",
          color: "#" + EDL.uniforms.onlyEDLColor.value.getHexString(),
          callback: color =>
            this.updateDynamicShaders(color, "EDL", "onlyEDLColor")
        }
      );

      this.settingsMask.shaders.add("onlyEDLColor");

      edlGroup.addComponent("strength", components.THREE_RANGE_SLIDER, {
        key: 2,
        min: 0.0,
        max: 100.0,
        step: 0.01,
        title: "strength",
        defaultVal: EDL.uniforms.edlStrength.value,
        ref: ref => (this.EDLStrengthRangeSlider = ref),
        callback: value =>
          this.updateDynamicShaders(value, "EDL", "edlStrength")
      });

      this.settingsMask.shaders.add("edlStrength");

      edlGroup.addComponent("radius", components.THREE_RANGE_SLIDER, {
        key: 3,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        title: "radius",
        defaultVal: EDL.uniforms.radius.value,
        ref: ref => (this.EDLRadiusRangeSlider = ref),
        callback: value => this.updateDynamicShaders(value, "EDL", "radius")
      });
      this.settingsMask.shaders.add("radius");

      edlGroup.addGroup("edl shading", edlShadingGroup);

      // Chroma Key

      const chromaKeyGroup = new ThreeGUIGroup("chromaKey");

      chromaKeyGroup.addComponent("enable", components.THREE_TOGGLE, {
        key: 1,
        callback: value =>
          this.updateDynamicShaders(value, "ChromaKey", "enable"),
        defaultVal: ChromaKey.uniforms.enable.value,
        title: "enable"
      });
      this.settingsMask.shaders.add("enable");
      chromaKeyGroup.addComponent(
        "eyedropper",
        components.THREE_EYEDROPPER_COLOR_PICKER,
        {
          renderer: this.webGLRenderer,
          // pull from the model pass only so we ignore all the edl effects other shaders
          renderTarget: this.modelComposer.renderTarget2,
          threeRef: this.threeView,
          title: "chroma",
          color: "#" + ChromaKey.uniforms.chroma.value.getHexString(),
          onActiveCallback: val => this.toggleRaycasting(val),
          callback: color =>
            this.updateDynamicShaders(color, "ChromaKey", "chroma")
        }
      );
      this.settingsMask.shaders.add("chroma");

      chromaKeyGroup.addComponent(
        "replacement_color",
        components.THREE_MICRO_COLOR_PICKER,
        {
          title: "replacement color",
          // add this to state somehow
          callback: color => {
            this.updateDynamicShaders(color, "ChromaKey", "replacementColor");
          }
        }
      );
      this.settingsMask.shaders.add("replacementColor");
      // TODO Figure something out for replacement color
      chromaKeyGroup.addComponent("invert", components.THREE_TOGGLE, {
        key: 1,
        callback: value =>
          this.updateDynamicShaders(value, "ChromaKey", "invert"),
        defaultVal: ChromaKey.uniforms.invert.value,
        title: "invert"
      });
      this.settingsMask.shaders.add("invert");
      chromaKeyGroup.addComponent("threshold", components.THREE_RANGE_SLIDER, {
        key: 2,
        min: -1.0,
        max: 1.0,
        step: 0.01,
        title: "threshold",
        defaultVal: ChromaKey.uniforms.threshold.value,
        callback: value =>
          this.updateDynamicShaders(value, "ChromaKey", "threshold")
      });
      this.settingsMask.shaders.add("threshold");
      shaderGroup.addGroup("eye dome lighting", edlGroup);
      shaderGroup.addGroup("chroma key", chromaKeyGroup);
      this.panelGroup.addGroup("shaders", shaderGroup);
    }

    /****************** MATERIALS *********************************************/
    if (this.props.options.enableMaterials) {
      const { materialsInfo } = this.state;
      const materialsGroup = new ThreeGUIGroup("materials");
      const materialsProps = {
        min: 0,
        max: 1,
        step: 0.01,
        defaultVal: 1.0,
        title: "normal scale"
      };
      let children = this.mesh.children;
      if (children.length === 0) {
        children = [this.mesh];
      }
      for (let i = 0; i < children.length; i++) {
        const mesh = children[i];
        let material = mesh.material;
        if (material.constructor !== Array) {
          material = [material];
        }
        for (let j = 0; j < material.length; j++) {
          const currentMaterial = material[j];
          if (
            currentMaterial.normalMap &&
            !materialsGroup.find("normalScale")
          ) {
            materialsGroup.addComponent(
              "normalScale",
              components.THREE_RANGE_SLIDER,
              {
                ...materialsProps,
                defaultVal: materialsInfo.normalScale,
                title: "normal scale",
                callback: value =>
                  this.updateDynamicMaterials(value, "normalScale")
              }
            );
          }
          if (currentMaterial.bumpMap && !materialsGroup.find("bumpScale")) {
            materialsGroup.addComponent(
              "bumpScale",
              components.THREE_RANGE_SLIDER,
              {
                ...materialsProps,
                title: "bump scale",
                callback: value =>
                  this.updateDynamicMaterials(value, "bumpScale")
              }
            );
          }
          if (
            currentMaterial.type === THREE_MESH_STANDARD_MATERIAL &&
            !materialsGroup.find("microsurface")
          ) {
            const pbrGroup = new ThreeGUIGroup("pbrTool");
            pbrGroup.addComponent("metalness", components.THREE_RANGE_SLIDER, {
              ...materialsProps,
              title: "metalness",
              defaultVal: materialsInfo.pbr.metalness,
              callback: value => this.updateDynamicMaterials(value, "metalness")
            });
            pbrGroup.addComponent("roughness", components.THREE_RANGE_SLIDER, {
              ...materialsProps,
              title: "roughness",
              defaultVal: materialsInfo.pbr.roughness,
              callback: value => this.updateDynamicMaterials(value, "roughness")
            });
            materialsGroup.addGroup("microsurface", pbrGroup);
          }
        }
      }
      this.panelGroup.addGroup("materials", materialsGroup);
    }
    const toolsRef = React.createRef();
    this.panelLayout = (
      <layouts.THREE_PANEL_LAYOUT
        group={this.panelGroup}
        elementClass="three-tool"
        groupClass="three-tool-container"
        menuClass="three-tool-menu"
        dropdownClass="three-tool-menu-dropdown"
        ref={ref => (this.toolsMenu = ref)}
        innerRef={toolsRef}
      />
    );
    this.setState(
      (prevState, props) => {
        return {
          loadProgress: prevState.loadProgress + 10,
          loadText: "Updating Scene"
        };
      },
      () => {
        this.animate();
      }
    );
  }

  viewAnnotation(
    point,
    cameraPos,
    storeLastPosition = false
  ) {
    this.setState({
      controllable: false,
      target: point,
      animator: this.animateZoom(point, 3, cameraPos, storeLastPosition)
    });
  }

  // TODO make this thing resize properly
  toggleTools() {
    if (this.toolsMenu) {
      this.toolsMenu.expandMenu(this.handleToolMenuExpanded);
    }
  }

  *animateAnnotationTransition(duration) {
    const { deltaTime } = this.state;
    for (let i = 0; i < duration; i += deltaTime) {
      const { clientWidth, clientHeight } = this.webGLRenderer.domElement;
      this.css2DRenderer.setSize(clientWidth, clientHeight, false);
      this.positionAnnotations();
      yield null;
    }
  }

  handleToolMenuTransition(duration) {
    this.setState({
      controllable: false,
      animator: this.animateAnnotationTransition(duration)
    });
  }

  handleToolMenuExpanded(status) {
    this.setState({ toolsActive: status }, () => {
      let { clientWidth, clientHeight } = this.webGLRenderer.domElement;
      if (!status) {
        this.updateRenderSize([clientWidth, clientHeight]);
      } else {
        this.updateRenderSize([this.width, this.height]);
      }
    });
  }

  toggleQuality() {
    let { options, current } = this.state.quality;
    let currentIndex = options.findIndex(option => {
      return option.label === current.label;
    });
    let nextIndex = currentIndex + 1 < options.length ? currentIndex + 1 : 0;
    this.setState(
      {
        quality: {
          options: options,
          current: options[nextIndex]
        }
      },
      () => {
        this.updateRenderSize([this.width, this.height]);
        this.toggleQualityButton.updateLabel(
          "quality: " + this.state.quality.current.label
        );
      }
    );
  }

  toggleBackground() {
    let { detailMode } = this.state;
    let { skyboxTexture } = this.props;

    if (!detailMode) {
      this.skyboxMesh.material = this.skyboxMaterialShader.shaderMaterial;
      this.setState({
        detailMode: true
      });
    } else {
      this.skyboxMesh.material = this.skyboxMaterial;
      this.axisGuides.forEach(axisGuide => {
        axisGuide.visible = false;
      });
      this.setState({
        detailMode: false
      });
    }
  }

  captureScreenshot() {}

  showAxes(show) {
    this.setState({ showAxes: show }, () =>
      this.axisGuides.forEach(axisGuide => {
        axisGuide.visible = show;
      })
    );
  }

  showLightHelper(show) {
    this.setState(
      { showLightHelper: show },
      () => (this.lightHelper.visible = this.state.showLightHelper)
    );
  }

  toggleDynamicLighting() {
    this.setState(
      {
        dynamicLighting: !this.state.dynamicLighting
      },
      () => {
        const { dynamicLighting } = this.state;
        this.dynamicLight.visible = dynamicLighting;
        if (dynamicLighting) {
          this.pointLights.traverse(light => (light.intensity = 0.0));
          this.ambientLight.intensity = 0.8;
          this.enableLightButton.updateLabel("lighting: on");
        } else {
          this.pointLights.traverse(
            light => (light.intensity = this.pointLights.DEFAULT_INTENSITY)
          );
          this.ambientLight.intensity = 1.0;
          this.enableLightButton.updateLabel("lighting: off");
        }
      }
    );
  }

  toggleInfo() {
    if (this.state.showInfo) {
      this.setState({ showInfo: false });
    } else {
      this.setState({ showInfo: true });
    }
  }

  exportObj() {
    const exporter = new THREE.OBJExporter();
    const result = exporter.parse(this.mesh);
  }

  saveSettings() {
    const { shaderPasses, dynamicLightProps, materialsInfo } = this.state;
    const settings = { lights: {}, shaders: {}, materials: {} };
    for (let key in shaderPasses) {
      settings.shaders[key] = serializeThreeTypes(
        shaderPasses[key].uniforms,
        this.settingsMask.shaders
      );
    }
    settings.lights = serializeThreeTypes(dynamicLightProps);
    settings.materials = serializeThreeTypes(materialsInfo);
    const id =
      this.props.options._id === undefined
        ? this.props.options.id
        : this.props.options._id;
    // TODO should likely change _id to id in the saga
    this.props.onSave(id, settings);
  }

  updateButtonLabel(
    buttonRef,
    neutral,
    success,
    failure
  ) {
    const { saveStatus } = this.props;
    if (buttonRef !== undefined) {
      let statusClass = "save-status ";
      let textContent = neutral;
      if (saveStatus === true) {
        statusClass += "success";
        textContent = success;
      }
      if (saveStatus === false) {
        statusClass += "failure";
        textContent = failure;
      }
      const label = <div className={statusClass}>{textContent}</div>;
      this.saveToolSettingsButton.updateLabel(label);
    }
  }

  toggleRaycasting(val) {
    this.setState({
      isRaycasting: val
    });
  }

  enterVR() {
    this.setState({
      vrActive: true
    });
  }

  exitVR() {
    this.setState({
      vrActive: false
    });
    this.centerCamera();
  }
  //}

  /** EVENT HANDLERS
   *****************************************************************************/

  handleMouseDown(event) {
    if (this.state.shiftDown) {
      this.setState({
        dragging: true,
        panStart: this.state.panStart.set(event.clientX, event.clientY)
      });
    }

    if (event.nativeEvent) {
      if (event.nativeEvent.which === 3) {
        this.setState({
          dragging: true,
          rmbDown: true,
          panStart: this.state.panStart.set(event.clientX, event.clientY),
          cameraControlPaused: false
        });
      } else {
        this.setState({
          dragging: true,
          rmbDown: false,
          rotateStart: this.state.rotateStart.set(event.clientX, event.clientY),
          cameraControlPaused: false
        });
      }
    }
  }

  handleMouseMove(event) {
    if (this.state.controllable) this.orbit(event.clientX, event.clientY);
  }

  handleMouseWheel(event) {
    const { cameraControlPaused } = this.state;
    event.preventDefault();
    this.zoom(event.deltaY);
  }

  handleMouseUp(event) {
    if (this.state.dragging) {
      this.setState({ dragging: false });
    } else {
      this.setState({ dragging: true });
    }
  }

  handleWindowResize(event) {
    let { clientWidth, clientHeight } = this.webGLRenderer.domElement;
    // we're concerned with client height + client width of our canvas
    if (!this.state.toolsActive) {
      this.width = clientWidth;
      this.height = clientHeight;
      this.updateRenderSize([this.width, this.height]);
    } else {
      this.updateRenderSize([clientWidth, clientHeight]);
    }
  }

  handleKeyDown(event) {
    // TODO redo rotation
    // this.mesh.getWorldQuaternion(this.rotationTarget);
    switch (event.keyCode) {
      /*case 39:
        this.mesh.rotateY(this.rotationTarget.y + this.ROTATION_STEP);
        break;

      case 37:
        this.mesh.rotateY(this.rotationTarget.y - this.ROTATION_STEP);
        break;
      */
      case 16:
        this.setState({ shiftDown: true });
        break;

      default:
        break;
    }
  }

  handleKeyUp(event) {
    switch (event.keyCode) {
      case 16:
        this.setState({ shiftDown: false });

      default:
        break;
    }
  }

  // touch methods

  handlePinch(pinchInfo, type) {
    switch (type) {
      case "pinchstart":
        this.setState({
          pinching: true,
          panStart: this.state.panStart.set(
            pinchInfo.clientCenter.x,
            pinchInfo.clientCenter.y
          )
        });
        break;

      case "pinchend":
        this.setState({
          pinching: false
        });
        break;

      default:
        break;
    }
  }

  handlePinchMove(pinchInfo, type) {
    let { pinchDelta, normalizedDistance } = pinchInfo;
    if (normalizedDistance > ZOOM_PINCH_DISTANCE_SIZE) {
      this.zoom(pinchDelta);
    } else {
      this.orbit(pinchInfo.clientCenter.x, pinchInfo.clientCenter.y);
    }
  }

  handleTouch(touch, type) {
    switch (type) {
      case "touchstart":
        this.setState({
          dragging: true,
          rotateStart: this.state.rotateStart.set(touch.clientX, touch.clientY)
        });
        break;

      case "touchend":
        this.setState({
          dragging: false
        });
        break;

      default:
        break;
    }
  }

  handleTouchMove(touch) {
    this.orbit(touch.clientX, touch.clientY);
  }

  // Static methods
}
