/* @flow */

// React
import React, { Component } from 'react';

// THREEJS
import * as THREE from 'three';

// Semantic UI
import LoaderModal from './LoaderModal';

// postprocessing
import loadPostProcessor from '../utils/postprocessing';

// Utils
import { panLeft, panUp, rotateLeft, rotateUp } from '../utils/camera';
import { fitBoxes } from '../utils/mesh';

export default class ThreeView extends Component {
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
    // spherical coords
    spherical: new THREE.Spherical(),
    sphericalDelta: new THREE.Spherical(0,1.5,1),
    // interface
    loadProgress: 0,
    loadingText: '',

  };
  ROTATION_STEP = 0.0174533; // 1 degree in radians
  constructor(props: Object){

    super(props);
    (this: any).initThree = this.initThree.bind(this);
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
    (this: any).maxFov = 0;
    (this: any).minFov = 10;
    (this: any).bboxMesh = null;
    (this: any).animate = this.animate.bind(this);
    (this: any).update = this.update.bind(this);
    (this: any).updateCamera = this.updateCamera.bind(this);
    (this: any).pan = this.pan.bind(this);
    (this: any).rerenderWebGLScene = this.rerenderWebGLScene.bind(this);
    (this: any).getNewCameraFOV = this.getNewCameraFOV.bind(this);
    (this: any).fitPerspectiveCamera = this.fitPerspectiveCamera.bind(this);
    (this: any).loadSkyboxTexture = this.loadSkyboxTexture.bind(this);
    (this: any).loadMesh = this.loadMesh.bind(this);
    (this: any).initEnvironment = this.initEnvironment.bind(this);
    (this: any).initMesh = this.initMesh.bind(this);
    (this: any).initPostprocessing = this.initPostprocessing.bind(this);
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
    return false;

  }

  componentWillUnmount(): void {

    window.removeEventListener('resize', this.handleWindowResize);

  }

  render(): Object {

    const { loadProgress } = this.state;
    console.log(loadProgress);
    return(
      <div className="three-view-container">
        <LoaderModal text='loading' active={loadProgress !== 100} />
        <div className="three-view-toolbar"></div>
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

    // center camera
    this.scene = new THREE.Scene();
    this.envScene = new THREE.Scene();
    this.camera.target = new THREE.Vector3();

    this.textureLoader = new THREE.TextureLoader();

    // Mesh
    this.meshLoader = new THREE.ObjectLoader();

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.pointLight = new THREE.PointLight(0xfffffff, 0.2, 0.5);
    this.pointLight.y = this.environmentRadius;
    this.scene.add(this.ambientLight);
    this.scene.add(this.pointLight);

    // WebGL Renderer
    this.webGLRenderer = new THREE.WebGLRenderer({ alpha: true, autoClear: false });
    this.webGLRenderer.setPixelRatio(this.pixelRatio);
    this.webGLRenderer.setSize(this.width, this.height);
    this.webGLRenderer.autoClear = false;
    this.threeContainer.appendChild(this.webGLRenderer.domElement);

    this.setState({ loadProgress: 25 }, this.loadMesh());

  }

  update(): void {

    if (this.state.dragging) {
      this.updateCamera();
    }
    this.rerenderWebGLScene();

  }

  rerenderWebGLScene(): void {

    this.webGLRenderer.clear();
    if (this.envComposer !== undefined) this.envComposer.render(0.1);
    this.webGLRenderer.clearDepth();
    this.webGLRenderer.render(this.scene, this.camera);

  }

  animate(): void {

    window.requestAnimationFrame(this.animate);
    this.update();

  }

  loadSkyboxTexture(): void {

    this.textureLoader.load(this.props.skyboxTexture, this.initEnvironment, this.logProgress, (error) => {
      console.log(error);
    });

  }

  loadMesh(): void {

    this.meshLoader.load(this.props.mesh, this.initMesh, this.logProgess, (error) => console.log(error));

  }

  logProgess(request: typeof XmlHttpRequest): void {

    console.log('completed: ', request.loaded, ' total: ', request.total);

  }

  initMesh(mesh: Object): void {

      this.mesh = mesh;
      this.scene.add(this.mesh);
      this.bboxMesh = new THREE.Box3().setFromObject(this.mesh);
      let meshHeight = Math.ceil(this.bboxMesh.max.y - this.bboxMesh.min.y);
      this.environmentRadius = meshHeight; // diameter of sphere =  2 * meshHeight
      this.mesh.position.y = this.mesh.position.y - Math.floor(meshHeight / 2);
      this.setState({
        loadProgress: 50,
      }, this.loadSkyboxTexture());

  }

  initEnvironment(texture: Object): void {

    // Skybox
    this.skyboxGeom = new THREE.SphereGeometry(this.environmentRadius, 100, 60);
    this.skyboxGeom.scale(-1, 1, 1);
    this.skyboxMaterial = new THREE.MeshBasicMaterial({
      map: texture,
    });
    this.skyboxMesh = new THREE.Mesh(this.skyboxGeom, this.skyboxMaterial);
    this.envScene.add(this.skyboxMesh);
    this.fitPerspectiveCamera();
    loadPostProcessor(THREE).then((values) => {
      this.setState({
        loadProgress: 75,
      }, this.initPostprocessing());
    });

  }

  /** WEBGL Postprocessing
  *****************************************************************************/
  initPostprocessing(): void {

    this.renderPass = new THREE.RenderPass(this.envScene, this.camera);
    this.bokehPass = new THREE.BokehPass(this.envScene, this.camera, {
      focus: 0.015,
      aperture: 0.025,
      maxBlur: 15.0,
      width: this.width,
      height: this.height,
    });
    this.bokehPass.renderToScreen = true;

    this.envComposer = new THREE.EffectComposer(this.webGLRenderer);
    this.envComposer.addPass(this.renderPass);
    this.envComposer.addPass(this.bokehPass);

    this.updateCamera();
    this.setState({
      loadProgress: 100,
    }, this.animate());

  }


  /** CAMERA
  *****************************************************************************/

  getNewCameraFOV(dstFOV: Number): Number {

    let max = this.maxFov;
    let min = this.minFov;
    if (dstFOV >= max) return max;
    if (dstFOV <= min) return min;
    return dstFOV;

  }

  fitPerspectiveCamera(): void {

    let distance = this.camera.position.distanceTo(this.bboxMesh.min);
    let meshWidth = this.bboxMesh.max.x - this.bboxMesh.min.x;
    let meshHeight = this.bboxMesh.max.y - this.bboxMesh.min.y;
    let fovV = 2 * Math.atan(meshHeight / (2 * distance)) * (180 / Math.PI);
    let aspect = this.width / this.height;
    let fovH = 2 * Math.atan((meshWidth / aspect) / (2 * distance)) * (180 / Math.PI);
    let avgFov = (fovV + fovH) / 2;
    this.camera.fov = avgFov;
    this.maxFov = avgFov;
    this.camera.updateProjectionMatrix();

  }

  pan(deltaX: Number, deltaY: Number): void {

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

  rotate(deltaX: Number, deltaY: Number): void {

    let { sphericalDelta } = this.state;
    sphericalDelta.theta -= 2 * Math.PI * deltaX / this.width * this.rotateSpeed;
    sphericalDelta.phi -= 2 * Math.PI * deltaY / this.height * this.rotateSpeed;

    this.setState({
      sphericalDelta: sphericalDelta,
    });

  }

  updateCamera(): void {

    const { spherical, sphericalDelta, panOffset } = this.state;
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

    this.camera.target.add(panOffset);
    offset.setFromSpherical(spherical);
    offset.applyQuaternion(quatInverse);

    if (this.state.dragging) {
      this.camera.position.copy(this.camera.target).add(offset);
      this.camera.lookAt(this.camera.target);
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
  }

  /** EVENT HANDLERS
  *****************************************************************************/

  handleMouseDown(event: typeof SyntheticEvent): void {

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

  handleMouseMove(event: typeof SyntheticEvent): void {

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

  handleMouseWheel(event: typeof SyntheticEvent): void {
    let fov = this.camera.fov + event.deltaY * 0.05;
    this.camera.fov = this.getNewCameraFOV(fov);
    this.camera.updateProjectionMatrix();
  }

  handleMouseUp(event: typeof SyntheticEvent): void {
    if (this.state.dragging) {
      this.setState({ dragging: false });
    } else {
      this.setState({ dragging: true });
    }
  }

  handleWindowResize(event: typeof Event): void {

    let { innerWidth, innerHeight } = event.target;
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.webGLRenderer.setSize(innerWidth, innerHeight);

  }

  handleKeyDown(event: typeof SyntheticEvent): void {
    let currentRotation = this.mesh.getWorldRotation();
    switch(event.keyCode) {
      case 39:
        console.log(currentRotation)
        this.mesh.rotateY(currentRotation.y + this.ROTATION_STEP);
      case 37:
        console.log(currentRotation)
        this.mesh.rotateY(currentRotation.y - this.ROTATION_STEP);

      case 16:
        this.setState({ shiftDown: true });

      default:
        return
    }
  }

  handleKeyUp(event: typeof SyntheticEvent): void {
    switch(event.keyCode) {
      case 16:
        this.setState({ shiftDown: false });

      default:
        return
    }
  }

}
