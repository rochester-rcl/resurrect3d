/* @flow */

// React
import React, { Component } from 'react';

// THREEJS
import * as THREE from 'three';

// Semantic UI
import LoaderModal from './LoaderModal';
import InfoModal from './InfoModal';
import { Button, Label, Icon } from 'semantic-ui-react';

// GUI
import ThreeGUI, { ThreeGUIPanelLayout, ThreeGUILayout, ThreeGUIGroup, ThreeGUINestedGroup } from './ThreeGUI';

// postprocessing
import loadPostProcessor from '../utils/postprocessing';

// Utils
import { panLeft, panUp, rotateLeft, rotateUp } from '../utils/camera';
import { fitBoxes, mapMaterials } from '../utils/mesh';
import { LabelSprite } from '../utils/image';
import { LinearGradientShader, RadialGradientCanvas } from '../utils/image';
import ThreePointLights from '../utils/lights';

// Controls
import ThreeControls from './ThreeControls';
import ThreeMeasure from './ThreeMeasure';
import ThreeRangeSlider from './ThreeRangeSlider';
import ThreeToggle from './ThreeToggle';
import ThreeColorPicker, { ThreeMicroColorPicker } from './ThreeColorPicker';
import ThreeTools from './ThreeTools';

export default class ThreeView extends Component {

  /* Flow - declare all instance property types here */

  // settings
  height: number;
  width: number;
  pixelRatio: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minDistance: number;
  maxDistance: number;
  rotateSpeed: number;
  environmentRadius: number;
  maxPan: number;
  minPan: number;
  spriteScaleFactor: number;

  // objects
  bboxMesh: THREE.Vector3;
  axisGuides: Array<Object>;
  bboxSkybox: THREE.MESH;
  mesh: THREE.Group;
  labelSprite: THREE.Sprite;
  labelSphere: THREE.Sphere;

  // mesh properties
  measurement: THREE.Group;
  meshDepth: number;
  meshWidth: number;
  meshHeight: number;

  // environments
  scene: THREE.Scene;
  envScene: THREE.Scene;
  guiScene: THREE.Scene;
  ambientLight: THREE.AmbientLight;
  pointLights: ThreePointLights;
  dynamicLight: THREE.SpotLight;
  skyboxGeom: THREE.SphereGeometry;
  skyboxMaterial: THREE.ShaderMaterial;
  skyboxMaterialShader: THREE.ShaderMaterial;
  skyboxMesh: THREE.Mesh;

  // cameras
  lastCameraPosition: THREE.Vector3;
  lastCameraTarget: THREE.Vector3;
  camera: THREE.PerspectiveCamera;

  // Rendering
  webGLRenderer: THREE.WebGLRenderer;
  envRenderPass: THREE.RenderPass;
  effectComposer: THREE.EffectComposer;
  bokehPass: THREE.BokehPass;
  bloomPass: THREE.BloomPass;
  brightnessPass: THREE.BrightnessPass;

  // GUI
  panelLayout: ThreeGUIPanelLayout;
  controls: ThreeGUILayout;

  // DOM
  threeContainer: HTMLElement;

  state = {

    // interaction
    dragging: false,
    shiftDown: false,
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
    scale: 1,
    zoomScale: Math.pow(0.95, 1.0),
    maxScale: 2.5,
    // spherical coords
    spherical: new THREE.Spherical(),
    sphericalDelta: new THREE.Spherical(0,1.5,1),
    // interface
    loadProgress: 0,
    loadText: '',
    detailMode: false,
    showInfo: false,
    showAxes: false,
    showLightHelper: false,
    dynamicLighting: false,
    toolsActive: false,
    dynamicLightProps: {
      color: 0xc9e2ff,
      intensity: 0.8,
      distance: 0,
      decay: 2,
      offset: new THREE.Vector3(),
      lock: false,
    },
    shaderPasses: {
      EDL: {},
    },
    units: 'cm',
  };
  ROTATION_STEP = 0.0174533; // 1 degree in radians
  constructor(props: Object){

    super(props);

    /** Properties
    ***************************************************************************/

    (this: any).height = window.innerHeight;
    (this: any).width = window.innerWidth;
    (this: any).pixelRatio = window.devicePixelRatio;
    (this: any).minAzimuthAngle = - Infinity;
    (this: any).maxAzimuthAngle = Infinity;
    (this: any).minPolarAngle = 0;
    (this: any).maxPolarAngle = Math.PI;
    (this: any).minDistance = 0;
    (this: any).maxDistance = Infinity;
    (this: any).rotateSpeed = 0.5;
    (this: any).environmentRadius = 0;
    (this: any).maxPan;
    (this: any).minPan;
    (this: any).bboxMesh = null;
    (this: any).axisGuides = [];
    (this: any).bboxSkybox = null;
    (this: any).lastCameraPosition = new THREE.Vector3();
    (this: any).lastCameraTarget = new THREE.Vector3();


    /** Methods
    ***************************************************************************/

    // Initialization

    (this: any).initEnvironment = this.initEnvironment.bind(this);
    (this: any).initMesh = this.initMesh.bind(this);
    (this: any).initPostprocessing = this.initPostprocessing.bind(this);
    (this: any).initThree = this.initThree.bind(this);
    (this: any).initControls = this.initControls.bind(this);
    (this: any).initTools = this.initTools.bind(this);
    (this: any).addShaderPass = this.addShaderPass.bind(this);

    // Updates / Geometry / Rendering

    (this: any).animate = this.animate.bind(this);
    (this: any).update = this.update.bind(this);
    (this: any).updateCamera = this.updateCamera.bind(this);
    (this: any).updateEnv = this.updateEnv.bind(this);
    (this: any).pan = this.pan.bind(this);
    (this: any).rerenderWebGLScene = this.rerenderWebGLScene.bind(this);
    (this: any).getScale = this.getScale.bind(this);
    (this: any).fitPerspectiveCamera = this.fitPerspectiveCamera.bind(this);
    (this: any).panBounds = this.panBounds.bind(this);
    (this: any).centerCamera = this.centerCamera.bind(this);
    (this: any).computeAxisGuides = this.computeAxisGuides.bind(this);
    (this: any).drawAxisGuides = this.drawAxisGuides.bind(this);
    (this: any).addAxisLabels = this.addAxisLabels.bind(this);
    (this: any).toggleBackground = this.toggleBackground.bind(this);
    (this: any).showAxes = this.showAxes.bind(this);
    (this: any).showLightHelper = this.showLightHelper.bind(this);
    (this: any).toggleDynamicLighting = this.toggleDynamicLighting.bind(this);
    (this: any).updateDynamicLight = this.updateDynamicLighting.bind(this);
    (this: any).toggleInfo = this.toggleInfo.bind(this);
    (this: any).toggleTools = this.toggleTools.bind(this);
    (this: any).drawMeasurement = this.drawMeasurement.bind(this);
    (this: any).drawSpriteTarget = this.drawSpriteTarget.bind(this);
    (this: any).computeSpriteScaleFactor = this.computeSpriteScaleFactor.bind(this);
    (this: any).updateMaterials = this.updateMaterials.bind(this);
    (this: any).updateShaders = this.updateShaders.bind(this);
    (this: any).setEnvMap = this.setEnvMap.bind(this);

    // event handlers

    (this: any).handleMouseDown = this.handleMouseDown.bind(this);
    (this: any).handleMouseMove = this.handleMouseMove.bind(this);
    (this: any).handleMouseUp = this.handleMouseUp.bind(this);
    (this: any).handleMouseWheel = this.handleMouseWheel.bind(this);
    (this: any).handleWindowResize = this.handleWindowResize.bind(this);
    (this: any).handleKeyDown = this.handleKeyDown.bind(this);
    (this: any).handleKeyUp = this.handleKeyUp.bind(this);

  }

  /** COMPONENT LIFECYCYLE
  *****************************************************************************/

  componentDidMount(): void {

    this.initThree();
    window.addEventListener('resize', this.handleWindowResize);

  }

  shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

    if (nextProps.mesh !== this.props.mesh) return true;
    if (nextState.loadProgress !== this.state.loadProgress) return true;
    if (nextState.showInfo !== this.state.showInfo) return true;
    if (nextState.dynamicLighting !== this.state.dynamicLighting) return true;
    if (nextState.detailMode !== this.state.detailMode) return true;
    return false;

  }

  componentWillUnmount(): void {

    window.removeEventListener('resize', this.handleWindowResize);

  }

  render(): Object {

    const { loadProgress, loadText, showInfo, dynamicLighting, detailMode, toolsActive } = this.state;
    const { info } = this.props;

    if (this.mesh && !this.panelLayout) this.initTools();

    return(
      <div className="three-view-container">
        {this.panelLayout ? this.panelLayout : <span></span>}
        <InfoModal className="three-info-modal" active={showInfo} info={info} />
        <LoaderModal
          text={loadText + loadProgress}
          className="three-loader-dimmer"
          active={loadProgress !== 100}
        />
        {this.controls ? this.controls : <span></span>}
        <div ref="threeView" className="three-view"
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onWheel={this.handleMouseWheel}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
          contentEditable
        >
        </div>
      </div>
    );

  }

  /** THREE JS 'LIFECYCYLE'
  *****************************************************************************/
  initThree(): void {
    this.GUI = new ThreeGUI();
    this.GUI.registerComponent('THREE_RANGE_SLIDER', ThreeRangeSlider);
    this.GUI.registerComponent('THREE_BUTTON', Button);
    this.GUI.registerComponent('THREE_TOGGLE', ThreeToggle);
    this.GUI.registerComponent('THREE_COLOR_PICKER', ThreeColorPicker);
    this.GUI.registerComponent('THREE_MICRO_COLOR_PICKER', ThreeMicroColorPicker);
    this.GUI.registerComponent('THREE_MEASURE', ThreeMeasure);
    this.GUI.registerLayout('THREE_GROUP_LAYOUT', ThreeGUILayout);
    this.GUI.registerLayout('THREE_PANEL_LAYOUT', ThreeGUIPanelLayout);
    this.initControls();
    let { color, intensity, decay, distance } = this.state.dynamicLightProps;
    this.threeContainer = this.refs.threeView;

    // init camera
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height); // use defaults for fov and near and far frustum;


    // Scenes
    this.scene = new THREE.Scene();
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

    // Label Sprite that we can just copy for all the measurement
    this.labelSprite = new LabelSprite(128, 128,'#fff', '+').toSprite();

    this.measurement = new THREE.Group();
    this.guiScene.add(this.measurement);

    // WebGL Renderer
    this.webGLRenderer = new THREE.WebGLRenderer({
      alpha: true,
      autoClear: false,
      antialias: true,
      gammaInput: true,
      gammaOutput: true,
    });
    this.webGLRenderer.shadowMap.enabled = true,
    this.webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.webGLRenderer.setPixelRatio(this.pixelRatio);
    this.webGLRenderer.setSize(this.width, this.height);
    this.threeContainer.appendChild(this.webGLRenderer.domElement);

    this.setState((prevState, props) => {
      return { loadProgress: prevState.loadProgress + 25, loadText: "Loading Mesh" }
    }, this.initMesh());

  }

  initControls(): void {
    let components = this.GUI.components;
    let layouts = this.GUI.layouts;
    let controls = new ThreeGUIGroup('controls');
    const checkTools = () => {
      for (let key in this.props.options) {
        if (key.includes('enable')) {
          let value = this.props.options[key];
          if (value) return true;
        }
      }
      return false;
    }

    let buttonProps = {
      content: "re-center",
      className: "three-controls-button",
      icon: "crosshairs",
      onClick: () => this.centerCamera(),
      labelPosition: "right",
      color: "grey",
    }

    controls.addComponent('resetCamera', components.THREE_BUTTON, {
      ...buttonProps,
    });

    if (this.props.options.enableLights) {
      controls.addComponent('lighting', components.THREE_BUTTON, {
        ...buttonProps,
        content: "lighting",
        icon: 'lightbulb',
        onClick: () => this.toggleDynamicLighting(),
      });
    }

    if (this.props.skyboxTexture.image) {
      controls.addComponent('background', components.THREE_BUTTON, {
        ...buttonProps,
        content: "background",
        icon: 'image',
        onClick: () => this.toggleBackground(),
      });
    }

    if (this.props.info) {
      controls.addComponent('info', components.THREE_BUTTON, {
        ...buttonProps,
        content: "info",
        icon: 'info',
        onClick: () => this.toggleInfo(),
      });
    }

    if (checkTools()) {
      controls.addComponent('tools', components.THREE_BUTTON, {
        ...buttonProps,
        content: 'tools',
        icon: 'wrench',
        onClick: () => this.toggleTools(),
      });
    }

    this.controls = <layouts.THREE_GROUP_LAYOUT
        group={controls}
        groupClass='three-controls-container'
      />
  }

  update(): void {

    if (this.state.dragging) {
      this.updateCamera();
      this.updateEnv();
    }
    this.rerenderWebGLScene();

  }

  rerenderWebGLScene(): void {
    if (this.sceneComposer !== undefined && this.modelComposer !== undefined && this.effectComposer !== undefined) {
      this.sceneComposer.render(0.01);
      this.modelComposer.render(0.01);
      this.guiComposer.render(0.01);
      this.effectComposer.render(0.01);
    } else {
      this.webGLRenderer.render(this.scene, this.camera);
    }

  }

  animate(): void {

    window.requestAnimationFrame(this.animate);
    this.update();

  }

  computeAxisGuides(): void {

    let axes = ['x', 'y', 'z'];
    let colors = ["rgb(180,0,0)", "rgb(0,180,0)", "rgb(0,0,180)"];
    this.axisGuides = axes.map((axis, index) => {
      let bbox = this.bboxMesh;
      let max = {};
      max[axis] = this.bboxMesh.max[axis];
      let startVec = bbox.min.clone();
      let end = {...bbox.min, ...max};
      let endVec = new THREE.Vector3().fromArray(Object.values(end));
      let material = new THREE.LineDashedMaterial({
        color: colors[index],
        linewidth: 4,
        dashSize: 1,
        gapSize: 1,
      });
      let geometry = new THREE.Geometry();
      geometry.vertices.push(
        startVec,
        endVec
      );
      geometry.computeLineDistances();
      let line = new THREE.Line(geometry, material);
      line.visible = false;
      line.userData = { start: startVec.clone(), end: endVec.clone(), axis: axis };
      return line;
    });

  }

  addAxisLabels(): void {

    let dimensions = [this.meshWidth, this.meshHeight, this.meshDepth];
    this.axisGuides.forEach((axisGuide, index) => {
      let sprite = new LabelSprite(128, 128,'#fff',
        dimensions[index].toFixed(2).toString() + ' ' + this.state.units).toSprite();
      // Need to set based on actual size of model somehow
      sprite.scale.multiplyScalar(this.spriteScaleFactor);
      axisGuide.add(sprite);
      let { x, y, z} = axisGuide.userData.end;
      sprite.position.set(x, y, z);
    });

  }

  drawAxisGuides(showLabels: boolean): void {

    if (showLabels) this.addAxisLabels();
    if (this.axisGuides.length > 0) {
      this.axisGuides.forEach((axisGuide) => {
        this.guiScene.add(axisGuide);
      });
    } else {
      console.warn("Axis guides not computed. Please run computeAxisGuides");
    }

  }

  computeSpriteScaleFactor(): void {
    if (this.bboxMesh) {
      /* assuming sprite is 1x1 plane as per constructor, we want it no more
        than 1/4 of the mesh. A divisor of 4 seems to work best */
      this.spriteScaleFactor = Math.ceil(this.bboxMesh.max.distanceTo(this.bboxMesh.min) / 4);
    } else {
      console.warn("this.bboxMesh hasn't been computed yet. spriteScaleFactor is set to 1")
      this.spriteScaleFactor = 1;
    }
  }

  drawSpriteTarget(position: THREE.Vector3): THREE.Sprite {
    let sprite = this.labelSprite.clone();
    sprite.position.copy(position);
    sprite.scale.multiplyScalar(this.spriteScaleFactor);
  }

  drawMeasurement(points?: Object): void {
    if (points) {
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
            color: '#ccc',
            linewidth: 3,
            opacity: 0.3,
            transparent: true,
            depthWrite: false,
            depthTest: false
          });
          let geometry = new THREE.Geometry();
          geometry.vertices.push(a,b);
          geometry.computeLineDistances();
          let line = new THREE.Line(geometry, material);
          this.measurement.add(line);

          // draw label sprite for distance
          let distanceLabel = new LabelSprite(128, 128,'#fff',
            distance.toFixed(2).toString() + ' ' + this.state.units).toSprite();
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

  initMesh(): void {
      this.mesh = this.props.mesh.object3D;
      const setMicrosurface = (material) => {
        if (material.type === 'MeshStandardMaterial') {
          material.metalness = 0.0;
          material.roughness = 1.0;
        }
        material.needsUpdate = true;
      }
      // rewrite this to a function to abstract  out a lot of this boilerplate
        if (this.mesh instanceof THREE.Group) {
          this.mesh.children.forEach((child) => {
            child.receiveShadow = true;
            child.castShadow = true;
            if (child.material) {
              if (child.material instanceof Array) {
                child.material.forEach((material) => {
                  setMicrosurface(material);
                  if (this.props.renderDoubleSided) {
                    material.side = THREE.DoubleSide;
                  }
                });
              } else {
                setMicrosurface(child.material);
                child.castShadow = true;
                child.receiveShadow = true;
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
          material.forEach((currentMaterial) => {
            if (this.props.renderDoubleSided) {
              currentMaterial.side = THREE.DoubleSide;
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

      this.environmentRadius = Math.max(this.meshWidth, this.meshHeight, this.meshDepth); // diameter of sphere =  2 * meshHeight

      let labelSphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xCCCCCC,
        depthTest: false,
        depthWrite: false,
        opacity: 0.8,
        transparent: true
      });
      let labelSphereGeometry = new THREE.SphereGeometry((this.meshHeight / 125), 16, 16);
      this.labelSphere = new THREE.Mesh(labelSphereGeometry, labelSphereMaterial);
      this.setState((prevState, props) => {
        return { loadProgress: prevState.loadProgress + 25, loadText: "Loading Environment" }
      }, this.initEnvironment());

  }

  initEnvironment(): void {
    let { gradient } = this.props.options.skybox;
    // Skybox
    let cubeSize = this.environmentRadius * 4;
    this.skyboxGeom = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    if (this.props.skyboxTexture.image) {
      let equirectShader = THREE.ShaderLib['equirect'];
      this.skyboxMaterial = new THREE.ShaderMaterial({
        fragmentShader: equirectShader.fragmentShader,
        vertexShader: equirectShader.vertexShader,
        uniforms: equirectShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide,
      });
      this.skyboxMaterial.uniforms['tEquirect'].value = this.props.skyboxTexture.image;
    }
    let innerColor = "rgb(35, 35, 35)";
    let outerColor = "rgb(105, 105, 105)";

    if (this.props.options.skybox.gradient) {
      innerColor = gradient.innerColor;
      outerColor = gradient.outerColor;
    }
    this.skyboxMaterialShader = new LinearGradientShader(innerColor, outerColor,
      this.width, this.height);
    this.skyboxMesh = new THREE.Mesh(this.skyboxGeom, this.skyboxMaterial !== undefined ?
      this.skyboxMaterial : this.skyboxMaterialShader.shaderMaterial);
    this.envScene.add(this.skyboxMesh);
    this.bboxSkybox = new THREE.Box3().setFromObject(this.skyboxMesh);
    this.fitPerspectiveCamera();
    this.setEnvMap();
    loadPostProcessor(THREE).then((values) => {
      this.setState((prevState, props) => {
        return { loadProgress: prevState.loadProgress + 25, loadText: "Loading Shaders" }
      }, this.initPostprocessing());
    });

  }

  /** WEBGL Postprocessing
  *****************************************************************************/

  // TODO make this a separate component

  addShaderPass(pass: Object): void {
    this.setState({ shaderPasses: {...this.state.shaderPasses, ...pass }});
  }

  setEnvMap(): void {

    let mesh = this.mesh;
    if (mesh.constructor === THREE.Group) {
      mesh = mesh.children[0];
    }

    const setEnv = (material) => {
      if (material.type === 'MeshStandardMaterial') {
        if (this.props.skyboxTexture.image) {
          material.envMap = this.props.skyboxTexture.image;
          material.envMap.mapping = THREE.EquirectangularReflectionMapping;
          material.envMap.minFilter = THREE.LinearMipMapLinearFilter;
          material.envMap.magFilter = THREE.LinearFilter;
          material.envMapIntensity = 1;
        } else {
          let tex = new RadialGradientCanvas(1024, 1024,
            "rgb(255, 255, 255)", "rgb(150, 150, 150)").toTexture();
          material.envMap = tex;
          material.envMap.minFilter = THREE.LinearMipMapLinearFilter;
          material.envMap.magFilter = THREE.LinearFilter;
          material.envMap.mapping = THREE.EquirectangularReflectionMapping;
        }
      }
      material.needsUpdate = true;
      return material;
    }
    mesh.material = mapMaterials(mesh.material, setEnv);
  }

  initPostprocessing(): void {

    let rtParams = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: true,
    };

    this.effectComposer = new THREE.EffectComposer(this.webGLRenderer,
      new THREE.WebGLRenderTarget(this.width, this.height, rtParams));

    this.sceneComposer = new THREE.EffectComposer(this.webGLRenderer,
      new THREE.WebGLRenderTarget(this.width, this.height, rtParams));

    this.modelComposer = new THREE.EffectComposer(this.webGLRenderer,
      new THREE.WebGLRenderTarget(this.width, this.height, rtParams));

    this.guiComposer = new THREE.EffectComposer(this.webGLRenderer,
      new THREE.WebGLRenderTarget(this.width, this.height, rtParams));

    //The environment
    let envRenderPass = new THREE.RenderPass(this.envScene, this.camera);

    // the model
    let modelRenderPass = new THREE.RenderPass(this.scene, this.camera);

    // the gui
    let guiRenderPass = new THREE.RenderPass(this.guiScene, this.camera);

    let mask = new THREE.MaskPass(this.scene, this.camera);
    let maskInverse = new THREE.MaskPass(this.scene, this.camera);
    maskInverse.inverse = true;

    let guiMask = new THREE.MaskPass(this.guiScene, this.camera);

    let copyPass = new THREE.ShaderPass(THREE.CopyShader);
    copyPass.renderToScreen = true;

    let gaussianPass = new THREE.GaussianPass({ v: 2 / (this.height / 2) , h: 2 / (this.width / 2)});
    let clearMask = new THREE.ClearMaskPass();

    let brightnessShader = THREE.BrightnessContrastShader;
    let brightnessPass = new THREE.ShaderPass(brightnessShader);
    brightnessPass.uniforms['contrast'].value = 0.15;

    let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.width, this.height), 2.5, 0.8, 0.6);

    let EDLParams = {
      screenWidth: this.width,
      screenHeight: this.height,
      opacity: 1.0,
      edlStrength: 0,
      enableEDL: false,
      onlyEDL: false,
      radius: 0,
    }

    // Set up env maps

    let EDLPass = new THREE.EDLPass(this.scene, this.camera, EDLParams);

    this.addShaderPass({ EDL: EDLPass });

    let SSAOPass = new THREE.SSAOPass(this.scene, this.camera);

    SSAOPass.renderToScreen = false;

    this.sceneComposer.addPass(envRenderPass);
    this.sceneComposer.addPass(brightnessPass);
    this.sceneComposer.addPass(bloomPass);
    this.sceneComposer.addPass(gaussianPass);

    this.modelComposer.addPass(modelRenderPass);

    this.guiComposer.addPass(guiRenderPass);

    let rawScene = new THREE.TexturePass(this.sceneComposer.renderTarget2.texture);
    let rawModel = new THREE.TexturePass(this.modelComposer.renderTarget2.texture);
    let rawGui = new THREE.TexturePass(this.guiComposer.renderTarget2.texture);

    this.effectComposer.addPass(rawModel);
    this.effectComposer.addPass(SSAOPass);
    this.effectComposer.addPass(EDLPass);
    this.effectComposer.addPass(maskInverse);
    this.effectComposer.addPass(rawScene);
    this.effectComposer.addPass(clearMask);
    this.effectComposer.addPass(guiMask);
    this.effectComposer.addPass(rawGui);
    this.effectComposer.addPass(clearMask);
    this.effectComposer.addPass(copyPass);

    this.updateCamera();
    this.setState((prevState, props) => {
      return { loadProgress: prevState.loadProgress + 25, loadText: "Updating Scene" }
    }, this.animate());

  }


  /** Rendering / Updates / Camera
  *****************************************************************************/

  getScale(dstScale: number): number {
    let { maxScale } = this.state;
    if (dstScale > maxScale) dstScale = maxScale;
    if (dstScale <= 0) dstScale = 0;
    return dstScale;
  }

  panBounds(targetPosition: typeof THREE.Vector3): boolean {

    return this.bboxSkybox.containsPoint(targetPosition);

  }

  fitPerspectiveCamera(): void {

    let distance = this.camera.position.distanceTo(this.bboxMesh.min);
    let fovV = 2 * Math.atan(this.environmentRadius / (2 * distance)) * (180 / Math.PI);
    this.camera.fov = fovV;
    this.camera.updateProjectionMatrix();

  }

  pan(deltaX: number, deltaY: number): void {

    let offset = new THREE.Vector3();
    let position = this.camera.position;
    offset.copy(position).sub(this.camera.target);

    let targetDistance = offset.length();
    targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);
    let dstX = 2 * deltaX * targetDistance / this.height;
    let dstY = 2 * deltaY * targetDistance / this.height;

    let left = panLeft(dstX, this.camera.matrix);
    let up = panUp(dstY, this.camera.matrix);

    this.setState({ panOffset: this.state.panOffset.add(left.add(up)) });

  }

  rotate(deltaX: number, deltaY: number): void {

    let { sphericalDelta } = this.state;
    sphericalDelta.theta -= 2 * Math.PI * deltaX / this.width * this.rotateSpeed;
    sphericalDelta.phi -= 2 * Math.PI * deltaY / this.height * this.rotateSpeed;

    this.setState({
      sphericalDelta: sphericalDelta,
    });

  }

  centerCamera(): void {

    const { spherical, sphericalDelta, panOffset } = this.state;
    let resetVector = new THREE.Vector3();
    this.camera.position.copy(resetVector);
    this.camera.target.copy(resetVector);
    this.camera.updateProjectionMatrix();

    this.setState({
      sphericalDelta: sphericalDelta.set(0,1.5,1),
      spherical: spherical.set(0,0,0),
      panOffset: panOffset.set(0,0,0),
    }, this.updateCamera());

  }

  updateCamera(): void {

    // Borrowed from THREEJS OrbitControls

    const { spherical, sphericalDelta, panOffset, scale } = this.state;
    spherical.radius = this.environmentRadius;
    let offset = new THREE.Vector3();
		let quat = new THREE.Quaternion().setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0));
		let quatInverse = quat.clone().inverse();

    let position = this.camera.position;
    offset.copy(position).sub(this.camera.target);
    offset.applyQuaternion(quat);
    spherical.setFromVector3(offset);
    spherical.radius = this.environmentRadius;
    spherical.theta += sphericalDelta.theta;
    spherical.phi += sphericalDelta.phi;
    spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, spherical.theta));
    spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, spherical.phi));
    spherical.makeSafe();
    spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, spherical.radius));
    spherical.radius *= scale;
    this.camera.target.add(panOffset);
    offset.setFromSpherical(spherical);
    offset.applyQuaternion(quatInverse);

    if (this.state.dragging) {
      if (this.state.shiftDown) {
        this.lastCameraPosition.copy(this.camera.position);
        this.camera.position.copy(this.camera.target).add(offset);
        if (!this.panBounds(this.camera.position)) {
          this.camera.position.copy(this.lastCameraPosition);
          this.camera.target.sub(panOffset);
          this.camera.lookAt(this.camera.target);
        } else {
          this.camera.lookAt(this.camera.target);
        }
      } else {
        this.camera.position.copy(this.camera.target).add(offset);
        this.camera.lookAt(this.camera.target);
      }
      this.setState({
        sphericalDelta: sphericalDelta.set(0, 0, 0),
        panOffset: this.state.panOffset.set(0, 0, 0),
      });
    } else {
      this.camera.position.copy(this.camera.target).add(offset);
      this.camera.lookAt(this.camera.target);
      this.setState({
        sphericalDelta: sphericalDelta.set(0, 0, 0),
        panOffset: this.state.panOffset.set(0, 0, 0),
      });
    }

    if (!this.state.dynamicLightProps.lock) {
      let distance = this.camera.position.distanceTo(this.bboxMesh.max);
      this.dynamicLight.position.copy(this.camera.position).add(this.state.dynamicLightProps.offset);
      this.dynamicLight.distance = distance * 5;
      this.dynamicLight.needsUpdate = true;
    }
  }

  updateMaterials(scale: Number, prop: string): void {
    const updateFunc = (material) => {
      if (material[prop] !== null || material[prop] !== undefined) {
        if (prop === 'normalScale') {
          material[prop].set(scale, scale, 0);
        } else {
          material[prop] = scale;
        }
        material.needsUpdate = true;
      }
      return material;
    }
    let children = this.mesh.children;
    if (children.length === 0) {
      children = [this.mesh];
    }
    for (let i=0; i < children.length; i++) {
      let mesh = children[i];
      mesh.material = mapMaterials(mesh.material, updateFunc);
    }
  }

  updateShaders(value: Number | boolean, shaderName: string, uniformProp: string): void {
    const { shaderPasses } = this.state;
    let pass = shaderPasses[shaderName];
    if (uniformProp === 'screenWidth') {
      if (pass.depthRenderTarget !== undefined) {
        pass.depthRenderTarget.width = value;
      }
    }

    if (uniformProp === 'screenHeight') {
      if (pass.depthRenderTarget !== undefined) {
        pass.depthRenderTarget.height = value;
      }
    }

    pass.uniforms[uniformProp].value = value;
  }

  updateDynamicLighting(value: string | number | THREE.Vector3, prop: string): void {
    let { dynamicLightProps } = this.state;
    let updated = {};
    if (!prop.includes('offset')) {
      updated[prop] = value;
    } else {
      let axis = prop.split('offset')[1];
      let offset = dynamicLightProps.offset.clone();
      switch(axis) {

        case('X'):
          offset.x = value;
          break;

        case('Y'):
          offset.y = value;
          break;

        case('Z'):
          offset.z = value;
          break;

        default:
          break;

      }
      prop = 'offset';
      updated.offset = offset;
    }
    if (dynamicLightProps[prop] !== undefined) {
      this.setState({
        dynamicLightProps: { ...dynamicLightProps, ...updated }
        }, () => {
          if (prop === 'offset') {
            if (!this.state.dynamicLightProps.lock) {
              this.dynamicLight.position.copy(this.camera.position).add(this.state.dynamicLightProps.offset);
            }
          } else if(prop !== 'lock') {
            this.dynamicLight[prop] = this.state.dynamicLightProps[prop];
          }
          this.dynamicLight.needsUpdate = true;
        });
    }
  }

  updateEnv(): void {


  }

  /** UI
  *****************************************************************************/
  initTools(): void {
    let { shaderPasses } = this.state;

    const layouts = this.GUI.layouts;
    const components = this.GUI.components;
    let panelGroup = new ThreeGUIGroup('tools');

    if (this.props.options.enableMeasurement) {
      let measurementGroup = new ThreeGUIGroup('measurement');

      measurementGroup.addComponent('measure', components.THREE_MEASURE, {
        updateCallback: this.drawMeasurement,
        camera: this.camera,
        mesh: this.mesh,
        target: this.webGLRenderer.domElement
      });

      measurementGroup.addComponent('show axes', components.THREE_TOGGLE, {
        callback: this.showAxes,
        checked: this.state.showAxes,
        title: "show axes",
      });

      panelGroup.addGroup('measurement', measurementGroup);
    }

    if (this.props.options.enableLights) {

      let offsetMax = Number(this.environmentRadius.toFixed(2)) * 2;
      let step = Number((offsetMax / 100).toFixed(2));

      let lightGroup = new ThreeGUIGroup('lights');
      lightGroup.addComponent('helper', components.THREE_TOGGLE, {
        callback: this.showLightHelper,
        checked: this.state.showLightHelper,
        title: "show light helper",
      });
      lightGroup.addComponent('intensity', components.THREE_RANGE_SLIDER, {
        min: 0.0,
        max: 4.0,
        step: 0.1,
        title: "intensity",
        defaultVal: this.dynamicLight.intensity,
        callback: (value) => this.updateDynamicLighting(value, 'intensity'),
      });
      lightGroup.addComponent('color', components.THREE_COLOR_PICKER, {
        title: "color",
        callback: (color) => this.updateDynamicLighting(color, 'color'),
      });
      let offsetGroup = new ThreeGUIGroup('three-tool-group');
      offsetGroup.addComponent('lock', components.THREE_TOGGLE, {
        title: "lock",
        checked: this.state.dynamicLightProps.lock,
        callback: (value) => this.updateDynamicLighting(value, 'lock'),
      });
      let offsetProps = {
        key: 0,
        min: -offsetMax,
        max: offsetMax,
        step: step,
        title: "x-axis",
        defaultVal: 0.0,
        callback: (value) => this.updateDynamicLighting(value, 'offsetX'),
      }
      offsetGroup.addComponent('x-axis', components.THREE_RANGE_SLIDER, {
        ...offsetProps,
      });
      offsetGroup.addComponent('y-axis', components.THREE_RANGE_SLIDER, {
        ...offsetProps,
        key: 1,
        title: "y-axis",
        callback: (value) => this.updateDynamicLighting(value, 'offsetY'),
      });
      offsetGroup.addComponent('z-axis', components.THREE_RANGE_SLIDER, {
        ...offsetProps,
        key: 2,
        title: "z-axis",
        callback: (value) => this.updateDynamicLighting(value, 'offsetZ'),
      });
      lightGroup.addGroup('offset', offsetGroup);
      panelGroup.addGroup('lights', lightGroup);
    }

    if (this.props.options.enableShaders) {
      let shaderGroup = new ThreeGUIGroup('shaders');
      let edlGroup = new ThreeGUIGroup('edl');
      edlGroup.addComponent('enable', components.THREE_TOGGLE, {
        key: 0,
        title: "enable",
        callback: (value) => this.updateShaders(value, 'EDL', 'enableEDL'),
        checked: shaderPasses.EDL.enableEDL ? shaderPasses.EDL.enableEDL : false
      });

      let edlShadingGroup = new ThreeGUIGroup('edlShading');

      edlShadingGroup.addComponent('edlOnly', components.THREE_TOGGLE, {
        key: 10,
        callback: (value) => this.updateShaders(value, 'EDL', 'onlyEDL'),
        checked: shaderPasses.EDL.onlyEDL ? shaderPasses.EDL.onlyEDL : false,
        title: 'edl only',
      });

      edlShadingGroup.addComponent('geometryAndTexture', components.THREE_TOGGLE, {
        key: 11,
        callback: (value) => this.updateShaders(value, 'EDL', 'useTexture'),
        checked: shaderPasses.EDL.useTexture ? shaderPasses.EDL.useTexture : false,
        title: "geometry + texture",
      });

      edlShadingGroup.addComponent('color', components.THREE_MICRO_COLOR_PICKER, {
        title: "color",
        callback: (color) => this.updateShaders(color, 'EDL', 'onlyEDLColor'),
      });

      edlGroup.addComponent('strength', components.THREE_RANGE_SLIDER, {
        key: 2,
        min: 0.0,
        max: 10.0,
        step: 0.01,
        title: "strength",
        defaultVal: 0.0,
        callback: (value) => this.updateShaders(value, 'EDL', 'edlStrength'),
      });

      edlGroup.addComponent('radius', components.THREE_RANGE_SLIDER, {
        key: 3,
        min: 0.0,
        max: 4.0,
        step: 0.01,
        title: "radius",
        defaultVal: 0.0,
        callback: (value) => this.updateShaders(value, 'EDL', 'radius'),
      });

      edlGroup.addGroup('edl shading', edlShadingGroup);
      shaderGroup.addGroup('eye dome lighting', edlGroup);
      panelGroup.addGroup('shaders', shaderGroup);
    }

    if (this.props.options.enableMaterials) {
      let materialsGroup = new ThreeGUIGroup('materials');
      let materialsProps = {
        min: 0,
        max: 1,
        step: 0.01,
        defaultVal: 1.0,
        title: "normal scale",
      }
      let children = this.mesh.children;
      if (children.length === 0) {
        children = [this.mesh];
      }
      for (let i=0; i < children.length; i++) {
        let mesh = children[i];
        let material = mesh.material;
        if (material.constructor !== Array) {
          material = [material];
        }
        for (let j=0; j < material.length; j++) {
          let currentMaterial = material[j];
          if (currentMaterial.normalMap && !materialsGroup.find('normalScale')) {
            materialsGroup.addComponent('normalScale', components.THREE_RANGE_SLIDER, {
              ...materialsProps,
              callback: (value) => this.updateMaterials(value, 'normalScale'),
            });
          }
          if (currentMaterial.bumpMap && !materialsGroup.find('bumpScale')) {
            materialsGroup.addComponent('bumpScale', components.THREE_RANGE_SLIDER, {
              ...materialsProps,
              title: "bump scale",
              callback: (value) => this.updateMaterials(value, 'bumpScale'),
            });
          }
          if (currentMaterial.type === 'MeshStandardMaterial' && !materialsGroup.find('microsurface')) {
            let pbrGroup = new ThreeGUIGroup('pbrTool');
            pbrGroup.addComponent('metalness', components.THREE_RANGE_SLIDER, {
              ...materialsProps,
              title: "metalness",
              defaultVal: 0.0,
              callback: (value) => this.updateMaterials(value, 'metalness'),
            });

            pbrGroup.addComponent('roughness', components.THREE_RANGE_SLIDER, {
              ...materialsProps,
              defaultVal: 1.0,
              title: "roughness",
              callback: (value) => this.updateMaterials(value, 'roughness'),
            });
            materialsGroup.addGroup('microsurface', pbrGroup);
          }
        }
      }
      panelGroup.addGroup('materials', materialsGroup);
    }

    this.panelLayout = <layouts.THREE_PANEL_LAYOUT
      group={panelGroup}
      elementClass='three-tool'
      groupClass='three-tool-container'
      menuClass='three-tool-menu'
      dropdownClass='three-tool-menu-dropdown'
      ref={(ref) => this.toolsMenu = ref}
    />
  }
  // TODO make this thing resize properly
  toggleTools(): void {
    if (this.toolsMenu) {
      this.toolsMenu.expandMenu((status) => {
        this.setState({ toolsActive: status }, () => {
          let width = this.width;
          if (status) {
            width -= this.width * 0.2;
          } else {
            width = this.width;
          }
          this.camera.aspect = width / this.height;
          this.camera.updateProjectionMatrix();
          this.webGLRenderer.setSize(width, this.height);
          this.sceneComposer.setSize(width, this.height);
          this.modelComposer.setSize(width, this.height);
          this.guiComposer.setSize(width, this.height);
          this.effectComposer.setSize(width, this.height);
          this.skyboxMaterialShader.updateUniforms('resolution', new THREE.Vector2(width, this.height));
          this.updateShaders(width, 'EDL', 'screenWidth');
        });
      });
    }
  }

  toggleBackground(): void {

    let { detailMode } = this.state;
    let { skyboxTexture } = this.props;

    if (!detailMode) {
      this.skyboxMesh.material = this.skyboxMaterialShader.shaderMaterial;
      this.setState({
        detailMode: true,
      });
    } else {
      this.skyboxMesh.material = this.skyboxMaterial;
      this.axisGuides.forEach((axisGuide) => { axisGuide.visible = false });
      this.setState({
        detailMode: false,
      });
    }

  }

  showAxes(show: bool): void {
    this.setState({ showAxes: show },
      () => this.axisGuides.forEach((axisGuide) => { axisGuide.visible = show })
    );
  }

  showLightHelper(show: bool): void {
    this.setState({ showLightHelper: show }, () =>
      this.lightHelper.visible = this.state.showLightHelper
    );
  }

  toggleDynamicLighting(): void {
    this.setState({
      dynamicLighting: !this.state.dynamicLighting,
    }, () => {
      const { dynamicLighting } = this.state;
      this.dynamicLight.visible = dynamicLighting;
      if (dynamicLighting) {
        this.pointLights.traverse((light) => light.intensity = 0.1);
        this.ambientLight.intensity = 0.8;
      } else {
        this.pointLights.traverse((light) => light.intensity = 0.25);
        this.ambientLight.intensity = 1.0;
      }

    });
  }

  toggleInfo(): void {

    if (this.state.showInfo) {
      this.setState({ showInfo: false });
    } else {
      this.setState({ showInfo: true });
    }

  }

  /** EVENT HANDLERS
  *****************************************************************************/

  handleMouseDown(event: SyntheticMouseEvent): void {

    if (this.state.shiftDown) {
      this.setState({
        dragging: true,
        panStart: this.state.panStart.set(event.clientX, event.clientY),
      });
    } else {
      this.setState({
        dragging: true,
        rotateStart: this.state.rotateStart.set(event.clientX, event.clientY),
      });
    }

  }

  handleMouseMove(event: SyntheticMouseEvent): void {

    if (this.state.dragging) {
      if (this.state.shiftDown) {
        let { panStart, panEnd, panDelta } = this.state;
        panEnd.set(event.clientX, event.clientY);
        panDelta.subVectors(panEnd, panStart);
        this.pan(panDelta.x, panDelta.y);
        this.setState({
          panEnd: panEnd,
          panDelta: panDelta,
          panStart: panStart.copy(panEnd),
        });
      } else {
        let { rotateStart, rotateEnd, rotateDelta } = this.state;
        rotateEnd.set(event.clientX, event.clientY);
        rotateDelta.subVectors(rotateEnd, rotateStart);
        this.rotate(rotateDelta.x, rotateDelta.y);
        this.setState({
          rotateEnd: rotateEnd,
          rotateDelta: rotateDelta,
          rotateStart: rotateStart.copy(rotateEnd),
        })
      }
    }

  }

  handleMouseWheel(event: SyntheticWheelEvent): void {
    let { scale, zoomScale } = this.state;
    let deltaY = event.deltaY;
    event.preventDefault();
    if (deltaY > 0) {
      scale = this.getScale(scale /= zoomScale);
    } else {
      scale = this.getScale(scale *= zoomScale);
    }
    this.setState({ scale: scale });
    this.camera.updateProjectionMatrix();
    this.updateCamera();

  }

  handleMouseUp(event: SyntheticEvent): void {

    if (this.state.dragging) {
      this.setState({ dragging: false });
    } else {
      this.setState({ dragging: true });
    }

  }

  handleWindowResize(event: Event): void {
    let windowObj: window.Window = event.target;
    let { innerWidth, innerHeight } = windowObj;
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.webGLRenderer.setSize(innerWidth, innerHeight);
    this.sceneComposer.setSize(innerWidth, innerHeight);
    this.modelComposer.setSize(innerWidth, innerHeight);
    this.guiComposer.setSize(innerWidth, innerHeight);
    this.effectComposer.setSize(innerWidth, innerHeight);
    this.width = innerWidth;
    this.height = innerHeight;
    this.skyboxMaterialShader.updateUniforms('resolution', new THREE.Vector2(this.width, this.height));
    this.updateShaders(this.width, 'EDL', 'screenWidth');
    this.updateShaders(this.height, 'EDL', 'screenHeight');
  }

  handleKeyDown(event: SyntheticKeyboardEvent): void {

    let currentRotation = this.mesh.getWorldRotation();
    switch(event.keyCode) {
      case 39:
        this.mesh.rotateY(currentRotation.y + this.ROTATION_STEP);
        break;

      case 37:
        this.mesh.rotateY(currentRotation.y - this.ROTATION_STEP);
        break;

      case 16:
        this.setState({ shiftDown: true });
        break;

      default:
        return
    }

  }

  handleKeyUp(event: SyntheticKeyboardEvent): void {

    switch(event.keyCode) {
      case 16:
        this.setState({ shiftDown: false });

      default:
        return
    }

  }

  // Static methods


}
