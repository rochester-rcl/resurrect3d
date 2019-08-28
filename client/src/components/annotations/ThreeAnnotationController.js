/* @flow */

// React
import React, { Component } from "react";
import ReactDom from "react-dom";

// THREEJS
import * as THREE from "three";

// ThreeToggle
import ThreeToggle from "./../ThreeToggle";

//ThreeAnnotation
import ThreeAnnotation from "./ThreeAnnotation";

export default class ThreeAnnotationController extends Component
{
	raycaster: THREE.RayCaster;

	defaultState = {
	    active: false,
	    open: false,
	    annotations: []
  	};

  	state = {
    	active: false,
    	open: false,
    	annotations: []
  	};

	constructor(props: Object)
  	{
	    super(props);

	    (this: any).handleClick = this.handleClick.bind(this);
	    (this: any).handleIntersection = this.handleIntersection.bind(this);
	    (this: any).toggle = this.toggle.bind(this);
	    (this: any).raycaster = new THREE.Raycaster();

	    this.state = {
	    	active: false,
	    	annotations: []
	    }
  	}

	componentDidMount(): void 
	{
		this.props.webGL.addEventListener("click", this.handleClick, true);
		this.props.css.addEventListener("click", this.handleClick, true);
	}

	componentWillUnmount(): void 
	{
		this.props.webGL.removeEventListener("click", this.handleClick, true);
		this.props.css.removeEventListener("click", this.handleClick, true);
	}

	toggle(): void
	{
		console.log("toggle");
		this.setState({
			active: !this.state.active
		}, this.reset);
	}

	reset(): void
	{
		if (!this.state.active)
			this.setState({...this.defaultState});
	}

	componentDidUpdate(prevProps): void {
  		if (this.props.open != prevProps.open)
    		this.setState({ open: this.props.open });
	}

	handleClick(event: MouseEvent): void 		//Hard to check if mousedown and mouseup on same object
	{
		if (this.state.active) 
		{
			let { camera, mesh } = this.props;

			let res = this.props.webGL.getBoundingClientRect();

			let mouseVector = new THREE.Vector2();
			mouseVector.x = ((event.clientX - res.x) / res.width) * 2 - 1;
			mouseVector.y = -((event.clientY - res.top) / res.height) * 2 + 1;

			this.raycaster.setFromCamera(mouseVector, camera);

			let meshArray = [];
			if (mesh.type === THREE.Group)
			  meshArray = mesh.children;
			else
			  meshArray.push(mesh);

			let intersections = this.raycaster.intersectObjects(meshArray, true);
			// Only take the best result
			if (intersections.length > 0) 
				this.handleIntersection(intersections[0]);
		}
	}

	handleIntersection(intersection: Object): void 
	{
		var clickedExisting = false;
		for (let i = 0; i < this.state.annotations.length && !clickedExisting; i++) //Checked if clicked on existing annotation
			if (this.state.annotations[i].point.distanceTo(intersection.point) <= 0.2)
		  	{
		    	clickedExisting = true;
		    	this.state.annotations[i].open = !this.state.annotations[i].open;
		  	}

		if (!clickedExisting)
		{
			for (let i = 0; i < this.state.annotations.length; i++)
				this.state.annotations[i].open = false;

			this.state.annotations.push({
				point: intersection.point,
				open: true,
				annotation: <ThreeAnnotation title = "Untitled" text = ""/>,
			});
		}

		this.doCallback();
	}

	doCallback() {
		this.props.updateCallback(this.state.annotations);
	}

	render() 
	{
    	return (
      		<div className="three-annotation-tool-container">
        		<ThreeToggle title="annotation" callback={this.toggle} />
      		</div>
    	);
    }
}