/* @flow */

// React
import React, { Component } from 'react';

// THREEJS
import * as THREE from 'three';

// Semantic UI
import LoaderModal from './LoaderModal';
import InfoModal from './InfoModal';

// postprocessing
import loadPostProcessor from '../utils/postprocessing';

// Utils
import { panLeft, panUp, rotateLeft, rotateUp } from '../utils/camera';
import { fitBoxes, mapMaterials } from '../utils/mesh';
import { LabelSprite } from '../utils/image';
import { LinearGradientShader } from '../utils/image';

// Controls
import ThreeControls from './ThreeControls';
import ThreeMeasure from './ThreeMeasure';
import ThreeRangeSlider from './ThreeRangeSlider';
import ThreeToggle from './ThreeToggle';
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
  pointLight: THREE.PointLight;
  skyboxGeom: THREE.SphereGeometry;
  skyboxMaterialBasic: THREE.MeshBasicMaterial;
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
    dynamicLighting: false,
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
    (this: any).initTools = this.initTools.bind(this);

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
    (this: any).toggleDynamicLighting = this.toggleDynamicLighting.bind(this);
    (this: any).toggleInfo = this.toggleInfo.bind(this);
    (this: any).drawMeasurement = this.drawMeasurement.bind(this);
    (this: any).drawSpriteTarget = this.drawSpriteTarget.bind(this);
    (this: any).computeSpriteScaleFactor = this.computeSpriteScaleFactor.bind(this);
    (this: any).updateMaterials = this.updateMaterials.bind(this);

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

    const { loadProgress, loadText, showInfo, dynamicLighting, detailMode } = this.state;
    const info = [
      { key: 'Key:', val: 'Value'},
    ];

    let tools = [];
    if (this.mesh) tools = this.initTools();

    return(
      <div className="three-view-container">
        <ThreeControls
          handleResetCamera={this.centerCamera}
          handleToggleBackground={this.toggleBackground}
          handleToggleInfo={this.toggleInfo}
          handleToggleDynamicLighting={this.toggleDynamicLighting}
          toggleState={ { detailMode: detailMode, dynamicLighting: dynamicLighting } }
        />
        <ThreeTools tools={tools} />
        <InfoModal className="three-info-modal" active={showInfo} info={info} />
        <LoaderModal
          text={loadText + loadProgress}
          className="three-loader-dimmer"
          active={loadProgress !== 100}
        />
        <div ref="threeView" className="three-view"
          contentEditable
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onWheel={this.handleMouseWheel}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
        >
        </div>
      </div>
    );

  }

  /** THREE JS 'LIFECYCYLE'
  *****************************************************************************/
  initThree(): void {

    let { spherical, sphericalDelta } = this.state;
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
    this.pointLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1.5);
    this.pointLight.target = new THREE.Vector3();
    this.pointLight.visible = false;

    this.scene.add(this.ambientLight);
    this.camera.add(this.pointLight);
    this.scene.add(this.camera);
    this.scene.add(this.ambientLight);

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

    this.webGLRenderer.setPixelRatio(this.pixelRatio);
    this.webGLRenderer.setSize(this.width, this.height);
    this.threeContainer.appendChild(this.webGLRenderer.domElement);

    this.setState((prevState, props) => {
      return { loadProgress: prevState.loadProgress + 25, loadText: "Loading Mesh" }
    }, this.initMesh());

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
      if (this.props.renderDoubleSided) {
        if (this.mesh instanceof THREE.Group) {
          this.mesh.children.forEach((child) => {
            if (child.material) {
              if (child.material instanceof Array) {
                child.material.forEach((material) => {
                  material.side = THREE.DoubleSide;
                });
              } else {
                child.material.side = THREE.DoubleSide;
              }
            }

          });
        } else if (this.mesh instanceof THREE.Mesh) {
          this.mesh.material.forEach((material) => {
            material.side = THREE.DoubleSide;
          });
        }
      }
      this.scene.add(this.mesh);

      this.bboxMesh = new THREE.Box3().setFromObject(this.mesh);
      this.meshHeight = this.bboxMesh.max.y - this.bboxMesh.min.y;
      this.meshWidth = this.bboxMesh.max.x - this.bboxMesh.min.x;
      this.meshDepth = this.bboxMesh.max.z - this.bboxMesh.min.z;
      this.computeSpriteScaleFactor();
      let distance = this.camera.position.distanceTo(this.bboxMesh.max);
      this.pointLight.distance = distance;

      this.computeAxisGuides();
      this.drawAxisGuides(true);

      this.environmentRadius = this.meshHeight; // diameter of sphere =  2 * meshHeight

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

    // Skybox
    this.skyboxGeom = new THREE.SphereGeometry(this.environmentRadius * 2, 100, 60);
    this.skyboxGeom.scale(-1, 1, 1);
    this.skyboxMaterialBasic = new THREE.MeshBasicMaterial({
      map: this.props.skyboxTexture.image,
    });
    this.skyboxMaterialShader = new LinearGradientShader("rgb(35,35,35)", "rgb(45,45,45)", this.width, this.height).shaderMaterial();
    this.skyboxMesh = new THREE.Mesh(this.skyboxGeom, this.skyboxMaterialBasic);
    this.envScene.add(this.skyboxMesh);
    this.bboxSkybox = new THREE.Box3().setFromObject(this.skyboxMesh);
    this.fitPerspectiveCamera();
    loadPostProcessor(THREE).then((values) => {
      this.setState((prevState, props) => {
        return { loadProgress: prevState.loadProgress + 25, loadText: "Loading Shaders" }
      }, this.initPostprocessing());
    });

  }

  /** WEBGL Postprocessing
  *****************************************************************************/

  // TODO make this a separate component

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

    let blurPass = new THREE.ShaderPass(THREE.HorizontalBlurShader);
    blurPass.uniforms['h'].value = 2 / (this.width / 2);

    let clearMask = new THREE.ClearMaskPass();

    let brightnessShader = THREE.BrightnessContrastShader;
    let brightnessPass = new THREE.ShaderPass(brightnessShader);
    brightnessPass.uniforms['contrast'].value = 0.15;

    let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.width, this.height), 2.5, 0.8, 0.6);

    let bokeh2Pass = new THREE.Bokeh2Pass(this.envScene, this.camera, {
      textureWidth: this.width,
      textureHeight: this.height,
    });
    bokeh2Pass.renderToScreen = true;

    this.EDLPass = new THREE.EDLPass(this.scene, this.camera,
      { screenWidth: this.width,
        screenHeight: this.height,
        opacity: 1.0,
        edlStrength: 10.4,
        enableEDL: false,
        radius: 1.4, }
    );

    let SSAOPass = new THREE.SSAOPass(this.scene, this.camera);

    SSAOPass.renderToScreen = false;

    this.sceneComposer.addPass(envRenderPass);
    this.sceneComposer.addPass(brightnessPass);
    this.sceneComposer.addPass(bloomPass);
    this.sceneComposer.addPass(blurPass);
    //this.sceneComposer.addPass(bokeh2Pass);

    this.modelComposer.addPass(modelRenderPass);

    this.guiComposer.addPass(guiRenderPass);

    let rawScene = new THREE.TexturePass(this.sceneComposer.renderTarget2.texture);
    let rawModel = new THREE.TexturePass(this.modelComposer.renderTarget2.texture);
    let rawGui = new THREE.TexturePass(this.guiComposer.renderTarget2.texture);

    this.effectComposer.addPass(rawModel);
    this.effectComposer.addPass(SSAOPass);
    this.effectComposer.addPass(this.EDLPass);
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
    let fovV = 2 * Math.atan(this.meshHeight / (2 * distance)) * (180 / Math.PI);
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
    this.pointLight.position.copy(this.camera.position);
    this.pointLight.target.copy(this.camera.target);
  }

  updateMaterials(scale: Number, prop: string): void {
    let mesh = this.mesh.children[0];
    const updateFunc = (material) => {
      if (material[prop] !== null || material[prop] !== undefined) {
        material[prop] = scale;
        material.needsUpdate = true;
      }
      return material;
    }
    mesh.material = mapMaterials(mesh.material, updateFunc);
  }

  updateEnv(): void {


  }

  /** UI
  *****************************************************************************/
  initTools(): Array<Object> {
    let defaultTools = [{
        group: 'measurement',
        components: [
          {
            title: 'measure',
            component: <ThreeMeasure
                        updateCallback={this.drawMeasurement}
                        camera={this.camera}
                        mesh={this.mesh}
                        resolution={
                          {
                            width: this.webGLRenderer ? this.webGLRenderer.domElement.clientWidth : this.width,
                            height: this.webGLRenderer ? this.webGLRenderer.domElement.clientHeight : this.height,
                          }
                        }
                      />,
           },
           {
             title: 'show axes',
             component: <ThreeToggle
                          callback={this.showAxes}
                          checked={this.state.showAxes}
                          title="show axes"
                        />
           }
        ],
    }];

    let bumpMapTool = {
      group: 'materials',
      components: [
        {
          title: 'bump scale',
          component: <ThreeRangeSlider
                      min={0}
                      max={1}
                      step={0.01}
                      title="bump scale"
                      callback={(value) => this.updateMaterials(value, 'bumpScale')}
                     />,
        },
      ]
    };

    let mesh = this.mesh.children[0];
    if (mesh.material.constructor === Array) {
      for (let i=0; i < mesh.material.length; i++) {
        let material = mesh.material[i];
        if (material.bumpMap) {
          defaultTools.push(bumpMapTool);
          break;
        }
      }
    } else {
      if (mesh.material.bumpMap) {
        defaultTools.push(bumpMapTool);
      }
    }
    return defaultTools;
  }

  toggleBackground(event: typeof SyntheticEvent): void {

    let { detailMode } = this.state;
    let { skyboxTexture } = this.props;

    if (!detailMode) {
      this.skyboxMesh.material = this.skyboxMaterialShader;
      this.setState({
        detailMode: true,
      });
    } else {
      this.skyboxMesh.material = this.skyboxMaterialBasic;
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

  toggleDynamicLighting(): void {

    if (this.state.dynamicLighting) {
      this.setState({ dynamicLighting: false });
      this.ambientLight.intensity = 1;
      this.pointLight.visible = false;
    } else {
      this.setState({ dynamicLighting: true });
      this.ambientLight.intensity = 0.2;
      this.pointLight.visible = true;
    }

  }

  toggleInfo(event: typeof SyntheticEvent): void {

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
    this.effectComposer.setSize(innerWidth, innerHeight);

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
