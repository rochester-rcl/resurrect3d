/* @flow */

// React
import React, { Component } from 'react';

// THREEJS
import * as THREE from 'three';

// postprocessing
import loadPostProcessor from '../utils/postprocessing';

// Utils
import { panLeft, panUp, rotateLeft, rotateUp } from '../utils/camera';

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
    spherical: new THREE.Spherical({phi: 0, radius: 400, theta: 0}),
    sphericalDelta: new THREE.Spherical(),
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
    (this: any).animate = this.animate.bind(this);
    (this: any).update = this.update.bind(this);
    (this: any).updateCamera = this.updateCamera.bind(this);
    (this: any).pan = this.pan.bind(this);
    (this: any).rerenderWebGLScene = this.rerenderWebGLScene.bind(this);
    (this: any).getNewCameraFOV = this.getNewCameraFOV.bind(this);
    (this: any).centerCameraPosition = this.centerCameraPosition.bind(this);
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

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  render(): Object {
    return(
      <div className="three-view-container">
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
    )
  }

  /** THREE JS 'LIFECYCYLE'
  *****************************************************************************/
  initThree(): void {

    let { spherical, sphericalDelta } = this.state;
    this.threeContainer = this.refs.threeView;

    // init camera
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 1, 800);

    // center camera
    this.scene = new THREE.Scene();
    this.camera.target = new THREE.Vector3();

    // Skybox
    this.skyboxGeom = new THREE.SphereGeometry(400, 100, 60);
    this.skyboxGeom.scale(-1, 1, 1);
    this.textureLoader = new THREE.TextureLoader();

    // Mesh
    this.meshLoader = new THREE.ObjectLoader();

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.pointLight = new THREE.PointLight(0xfffffff, 0.2, 0.5);
    this.pointLight.y = 800;

    // WebGL Renderer
    this.webGLRenderer = new THREE.WebGLRenderer();
    this.webGLRenderer.setPixelRatio(this.pixelRatio);
    this.webGLRenderer.setSize(this.width, this.height);
    this.threeContainer.appendChild(this.webGLRenderer.domElement);

    this.loadSkyboxTexture();
    this.loadMesh();
    loadPostProcessor(THREE).then((values) => {
      this.initPostprocessing();
    });
    this.animate();
  }

  update(): void {
    if (this.state.dragging) {
      this.updateCamera();
    }
    this.rerenderWebGLScene();
  }

  rerenderWebGLScene(): void {
    this.webGLRenderer.render(this.scene, this.camera);
    this.composer.render(0.1);
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
    this.meshLoader.load(this.props.mesh, this.initMesh, this.logProgess, (error) => console.log(error))
  }

  logProgess(request: typeof XmlHttpRequest): void {
    console.log('completed: ', request.loaded, ' total: ', request.total);
  }

  initMesh(mesh: Object): void {
    this.mesh = mesh;
    this.scene.add(this.mesh);
    this.update();
  }

  initEnvironment(texture: Object): void {
    this.skyboxMaterial = new THREE.MeshBasicMaterial({
      map: texture,
    });
    this.skyboxMesh = new THREE.Mesh(this.skyboxGeom, this.skyboxMaterial);
    this.scene.add(this.ambientLight);
    this.scene.add(this.pointLight);
    this.scene.add(this.skyboxMesh);
    this.update();
  }

  /** WEBGL Postprocessing
  *****************************************************************************/
  initPostprocessing(): void {

    this.renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.bokehPass = new THREE.BokehPass(this.scene, this.camera, {
      focus: 0.075,
      aperture: 0.025,
      maxBlur: 5.0,
      width: this.width,
      height: this.height,
    });
    this.bokehPass.renderToScreen = true;

    this.composer = new THREE.EffectComposer(this.webGLRenderer);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bokehPass);

  }


  /** CAMERA
  *****************************************************************************/

  getNewCameraFOV(dstFOV: Number): Number {
    let max = this.props.maxFOV;
    let min = this.props.minFOV;
    if (dstFOV >= max) return max;
    if (dstFOV <= min) return min;
    return dstFOV;
  }

  centerCameraPosition(): void {
    let currentPosition = this.camera.position;
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
    spherical.radius = 400;
    let offset = new THREE.Vector3();
		let quat = new THREE.Quaternion().setFromUnitVectors( this.camera.up, new THREE.Vector3(0, 1, 0));
		let quatInverse = quat.clone().inverse();

		let lastPosition = new THREE.Vector3();
		let lastQuaternion = new THREE.Quaternion();

    let position = this.camera.position;
    offset.copy(position).sub(this.camera.target);
    offset.applyQuaternion(quat);
    spherical.setFromVector3(offset);
    spherical.radius = 400.0;
    spherical.theta += sphericalDelta.theta;
    spherical.phi += sphericalDelta.phi;
    spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, spherical.theta));
    spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, spherical.phi));
    spherical.makeSafe();
    spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, spherical.radius));

    this.camera.target.add(panOffset);
    offset.setFromSpherical(spherical);
    offset.applyQuaternion(quatInverse);
    this.camera.position.copy(this.camera.target).add(offset);
    this.camera.lookAt(this.camera.target);

    this.setState({
      sphericalDelta: sphericalDelta.set(0, 0, 0),
      panOffset: this.state.panOffset.set(0, 0, 0),
    });

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
    console.log('resize');
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
