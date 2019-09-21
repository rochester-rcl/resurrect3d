/* @flow */

// React
import React, { Component } from "react";
import ReactDom from "react-dom";

// THREEJS
import * as THREE from "three";

// ThreeToggle
import ThreeToggle from "./../ThreeToggle";

//ThreeAnnotation
import ThreeAnnotation from './ThreeAnnotation';
import PortalElement from "./PortalElement";

export default class ThreeAnnotationController extends Component
{
	raycaster: THREE.RayCaster;

	defaultState = {
		mousedown: false,
		dragging: false,
	    active: false,
	    open: false,
	    annotations: []
  	};

  	state = {
  		mousedown: false,
  		dragging: false,
    	active: false,
    	open: false,
    	annotations: []
  	};

	constructor(props: Object)
  	{
	    super(props);

	    (this: any).handleDown = this.handleDown.bind(this);
	    (this: any).handleMove = this.handleMove.bind(this);
	    (this: any).handleUp = this.handleUp.bind(this);
	    (this: any).handleIntersection = this.handleIntersection.bind(this);
	    (this: any).makeAnnotation = this.makeAnnotation.bind(this);
	    (this: any).updateAnnotation = this.updateAnnotation.bind(this);
	    (this: any).toggle = this.toggle.bind(this);
	    (this: any).raycaster = new THREE.Raycaster();

	    this.state = {
	    	dragging: false,
	    	active: false,
	    	annotations: []
	    }
  	}

	componentDidMount(): void 
	{
		this.props.webGL.addEventListener("mousedown", this.handleDown, true);
		this.props.webGL.addEventListener("mousemove", this.handleMove, true);
		this.props.webGL.addEventListener("mouseup", this.handleUp, true);
	}

	componentWillUnmount(): void 
	{
		this.props.webGL.removeEventListener("mousedown", this.handleDown, true);
		this.props.webGL.removeEventListener("mousemove", this.handleMove, true);
		this.props.webGL.removeEventListener("mouseup", this.handleUp, true);
	}

	toggle(): void
	{
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

	handleDown(event: MouseEvent): void
	{
		this.setState({
			mousedown: true
		});
	}

	handleMove(event: MouseEvent): void
	{
		if (this.state.mousedown)
			this.setState({
				dragging: true
			});
	}

	handleUp(event: MouseEvent): void 		//Hard to check if mousedown and mouseup on same object
	{
		if (this.state.active && !this.state.dragging) 
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
			if (intersections.length > 0 )
				this.handleIntersection(intersections[0]);
		}
		this.setState({
			mousedown: false,
			dragging: false
		});
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

			this.makeAnnotation(intersection.point);
		}

		this.props.drawCallback(this.state.annotations);
	}

	makeAnnotation(point)
	{
		let annotation = {
			div: document.createElement("div"),
			title: "Untitled",
			text: "",
			point: point,
			open: true
		};

		annotation.div.contentEditable = 'false';

		let annotations = this.state.annotations;
		annotations.push(annotation);
		this.setState({
			annotations: annotations
		});
	}

	updateAnnotation(index, data)
	{
		let annotations = this.state.annotations;

		annotations[index] = {...annotations[index], ...data};

		this.setState({
			annotations: annotations
		}, this.props.updateCallback(this.state.annotations));
	}

	render() 
	{
		let annotations = this.state.annotations.map((annotation, index) => {
			let component = <ThreeAnnotation title = {annotation.title} text = {annotation.text} callback = {this.updateAnnotation} index = {index}/>;
			return <PortalElement component = {component} domElement = {annotation.div}/>
		});

    	return (
      		<div className="three-annotation-tool-container">
        		<ThreeToggle title="annotation" callback={this.toggle} />
        		{annotations}
      		</div>
    	);
    }
}