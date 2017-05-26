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
    orbit: {
      x: 0,
      y: 0,
      z: 0,
    },
    pan: {
      x: 0,
      y: 0,
    },
    mouseDownX: 0,
    mouseDownY: 0,
    mouseDownLat: 0,
    mouseDownLong: 0,
    lat: 0,
    long: 0,
  };
  ROTATION_STEP = 0.0174533; // 1 degree in radians
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
    (this: any).rerenderWebGLScene = this.rerenderWebGLScene.bind(this);
    (this: any).getNewCameraFOV = this.getNewCameraFOV.bind(this);
    (this: any).centerCameraPosition = this.centerCameraPosition.bind(this);
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
    this.animate();
  }

  update(): void {
    if (this.state.dragging) {
      if (this.state.shiftDown) {
        this.updatePan();
      } else {
        this.updateOrbit();
      }
    }
    this.rerenderWebGLScene();
  }

  updateOrbit(): void {
    this.camera.position.x = this.state.orbit.x;
    this.camera.position.y = this.state.orbit.y;
    this.camera.position.z = this.state.orbit.z;
    this.camera.lookAt(this.scene.position);
  }

  updatePan(): void {
    this.camera.position.x = this.state.pan.x;
    this.camera.position.y = this.state.pan.y;
    this.camera.lookAt(this.camera.target);
  }

  rerenderWebGLScene(): void {
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
      let lat = (this.state.mouseDownY - event.clientY) * 0.1 + this.state.mouseDownLat;
      let long = (this.state.mouseDownX - event.clientX) * 0.1 + this.state.mouseDownLong;
      if (this.state.shiftDown) {
        this.setState({
          pan: { x: long, y: lat, }
        });
      } else {
        let orbit = {};
        let sphericalLat = Math.max(-85, Math.min(85, this.state.lat));
        let phi = THREE.Math.degToRad(90 - sphericalLat);
        let theta = THREE.Math.degToRad(this.state.long);
        if (this.props.invertControls) {
          orbit.x = 400 * Math.sin(phi) * Math.cos(theta);
          orbit.y = 400 * Math.cos(-phi);
        } else {
          orbit.x = 400 * Math.sin(-phi) * Math.cos(theta);
          orbit.y = 400 * Math.cos(phi);
        }
        orbit.z = 400 * Math.sin(phi) * Math.sin(theta);
        this.setState({ orbit: {...orbit}, lat: lat, long: long });
      }
    }
  }

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
