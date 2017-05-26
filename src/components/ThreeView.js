/* @flow */

// React
import React, { Component } from 'react';

// THREEJS
import * as THREE from 'three';
window.THREE = THREE;

export default class ThreeView extends Component {
  state = {
    dragging: false,
    shiftDown: false,
    mouseDownX: 0,
    mouseDownY: 0,
    mouseDownLat: 0,
    mouseDownLong: 0,
    lat: 0,
    long: 0,
  };
  ROTATION_STEP = 0.0174533; // 1 degree in radians
  POSITION_STEP = 1;
  constructor(props: Object){
    super(props);
    (this: any).initThree = this.initThree.bind(this);
    (this: any).height = window.innerHeight;
    (this: any).width = window.innerWidth;
    (this: any).pixelRatio = window.devicePixelRatio;
    (this: any).animate = this.animate.bind(this);
    (this: any).update = this.update.bind(this);
    (this: any).updateOrbit = this.updateOrbit.bind(this);
    (this: any).updatePan = this.updatePan.bind(this);
    (this: any).getNewCameraFOV = this.getNewCameraFOV.bind(this);
    (this: any).setCameraPosition = this.setCameraPosition.bind(this);
    (this: any).loadSkyboxTexture = this.loadSkyboxTexture.bind(this);
    (this: any).loadMesh = this.loadMesh.bind(this);
    (this: any).initEnvironment = this.initEnvironment.bind(this);
    (this: any).initMesh = this.initMesh.bind(this);
    (this: any).handleMouseDown = this.handleMouseDown.bind(this);
    (this: any).handleMouseMove = this.handleMouseMove.bind(this);
    (this: any).handleMouseUp = this.handleMouseUp.bind(this);
    (this: any).handleMouseWheel = this.handleMouseWheel.bind(this);
    (this: any).handleWindowResize = this.handleWindowResize.bind(this);
    (this: any).handleKeyDown = this.handleKeyDown.bind(this);
    (this: any).handleKeyUp = this.handleKeyUp.bind(this);
  }

  componentDidMount(): void {
    this.initThree();
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  initThree(): void {
    this.threeContainer = this.refs.threeView;

    // init camera
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 1, 800);

    // center camera
    this.camera.target = new THREE.Vector3(0, 0, 0);
    this.scene = new THREE.Scene();

    // Skybox
    this.skyboxGeom = new THREE.SphereGeometry(200, 100, 60);
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
    this.animate();
  }

  update(): void {
    if (this.state.shiftDown) {
      this.updatePan();
    } else {
      this.updateOrbit();
    }
  }

  updateOrbit(): void {
    let lat = Math.max(-85, Math.min(85, this.state.lat));
    let phi = THREE.Math.degToRad(90 - lat);
    let theta = THREE.Math.degToRad(this.state.long);
    if (this.props.invertControls) {
      this.camera.position.x = 400 * Math.sin(phi) * Math.cos(theta);
      this.camera.position.y = 400 * Math.cos(-phi);
    } else {
      this.camera.position.x = 400 * Math.sin(-phi) * Math.cos(theta);
      this.camera.position.y = 400 * Math.cos(phi);
    }
    this.camera.position.z = 400 * Math.sin(phi) * Math.sin(theta);
    this.camera.lookAt(this.scene.position);
    this.webGLRenderer.render(this.scene, this.camera);
  }

  updatePan(): void {
    let lat = Math.max(-85, Math.min(85, this.state.lat));
    let phi = THREE.Math.degToRad(90 - lat);
    let theta = THREE.Math.degToRad(this.state.long);
    if (this.props.invertControls) {
      this.mesh.position.x = lat;
      this.mesh.position.y = theta;
    } else {
      this.mesh.position.x = 100 * Math.sin(-phi) * Math.cos(theta);
      this.mesh.position.y = 100 * Math.cos(phi);
    }
    this.camera.lookAt(this.scene.position);
    this.webGLRenderer.render(this.scene, this.camera);
    //this.camera.position.set( new THREE.Vector3(...currentPosition, ...newPos));
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

  handleMouseDown(event: typeof SyntheticEvent): void {
    this.setState({
      dragging: true,
      mouseDownX: event.clientX,
      mouseDownY: event.clientY,
      mouseDownLong: this.state.long,
      mouseDownLat: this.state.lat,
    });
  }

  handleMouseMove(event: typeof SyntheticEvent): void {
    if (this.state.dragging) {
      this.setState({
        lat: (this.state.mouseDownY - event.clientY) * 0.1 + this.state.mouseDownLat,
        long: (this.state.mouseDownX - event.clientX) * 0.1 + this.state.mouseDownLong,
      })
    }
  }

  getNewCameraFOV(dstFOV: Number): Number {
    let max = this.props.maxFOV;
    let min = this.props.minFOV;
    if (dstFOV >= max) return max;
    if (dstFOV <= min) return min;
    return dstFOV;
  }

  setCameraPosition(): void {
    let currentPosition = this.camera.position;
    console.log(currentPosition);
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
    console.log(event.keyCode);
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
}
