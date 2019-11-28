/* @flow */

// React
import React, { Component } from "react";
import ReactDom from "react-dom";

// THREEJS
import * as THREE from "three";

// UI
import ThreeToggle from "./../ThreeToggle";
import ThreeGUI from "./../ThreeGUI";

//ThreeAnnotation
import ThreeAnnotation from './ThreeAnnotation';
import ThreeAnnotationShortcut from './ThreeAnnotationShortcut';
import PortalElement from "./PortalElement";

export default class ThreeAnnotationController extends Component
{
	raycaster: THREE.RayCaster;

	constructor(props: Object)
  	{
	    super(props);

	    (this: any).handleDown = this.handleDown.bind(this);
	    (this: any).handleMove = this.handleMove.bind(this);
	    (this: any).handleUp = this.handleUp.bind(this);
	    (this: any).handleIntersection = this.handleIntersection.bind(this);
	    (this: any).makeAnnotation = this.makeAnnotation.bind(this);
	    (this: any).updateAnnotation = this.updateAnnotation.bind(this);
	    (this: any).viewAnnotation = this.viewAnnotation.bind(this);
	    (this: any).deleteAnnotation = this.deleteAnnotation.bind(this);
	    (this: any).toggle = this.toggle.bind(this);
	    (this: any).toggleEdit = this.toggleEdit.bind(this);
	    (this: any).raycaster = new THREE.Raycaster();

	    this.state = {
	    	mousedown: false,
	  		dragging: false,
	    	active: false,
	    	open: false,
	    	editable: true,
	    	annotations: props.annotations ? props.annotations : []
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

	toggleEdit(): void
	{
		this.setState({
			editable: !this.state.editable
		});
	}

	reset(): void
	{
		this.props.drawCallback();
		this.setState({ annotations: [] });

		if (this.props.onActiveCallback)
			this.props.onActiveCallback(this.state.active);
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
		    	let annotations = this.state.annotations;

		    	for (let j = 0; j < annotations.length; j++)
		    		if (j == i)
		    			annotations[j].open = !annotations[j].open;
		    		else
		    			annotations[j].open = false;

    			this.setState({
    				annotations: annotations
    			});
			}

		if (!clickedExisting && this.state.editable)
			this.makeAnnotation(intersection.point);
	}

	makeAnnotation(point)
	{
		let annotations = this.state.annotations;

		for (let i = 0; i < annotations.length; i++)
			annotations[i].open = false;

		let annotation = {
			div: document.createElement("div"),
			title: "Untitled",
			text: "",
			point: point,
			open: true
		};

		annotation.div.contentEditable = 'false';
		annotations.push(annotation);

		this.setState({
			annotations: annotations
		}, this.props.drawCallback(this.state.annotations));
	}

	updateAnnotation(index, data)
	{
		let annotations = this.state.annotations;

		annotations[index] = {...annotations[index], ...data};

		this.setState({
			annotations: annotations
		});
	}

	deleteAnnotation(index)
	{
		this.setState({
			annotations: this.state.annotations.length == 1 ? [] : this.state.annotations.splice(index, 1)
		}, () => { this.props.drawCallback(this.state.annotations); });
	}

	viewAnnotation(index)
	{
		let annotations = this.state.annotations;
		annotations.forEach((annotation) => annotation.open = false);
		annotations[index].open = true;

		this.props.cameraCallback(annotations[index].point);

		this.setState({
			annotations: annotations
		}, this.props.drawCallback(this.state.annotations));
	}

	render() 
	{
		console.log("Rerendering");

		let annotations = this.state.annotations.map((annotation, index) => {
			let component = <ThreeAnnotation 
								title = {annotation.title} 
								text = {annotation.text} 
								callback = {this.updateAnnotation} 
								index = {index} 
								div = {annotation.div}
								editable = {this.state.editable}
							/>;
			return <PortalElement component = {component} domElement = {annotation.div}/>
		});

		let editToggle;
		if (this.state.active)
			editToggle = <ThreeToggle title="edit mode" callback={this.toggleEdit} defaultVal={true}/>;

		let shortcuts = this.state.annotations.map((annotation, index) => 
			<ThreeAnnotationShortcut 
				title={annotation.title} 
				index={index}
				focus={this.viewAnnotation}
				delete={this.deleteAnnotation}
			/>);

		console.log('shortcuts has length' + shortcuts.length + ' and annotations has length ' + annotations.length);

		let shortcutContainer;
		if (this.state.active)
			shortcutContainer = <div className={"three-gui-group"}>
			              			<h4 className="three-gui-group-title">shortcuts</h4>
			              			{shortcuts}
			            		</div>;

    	return (
      		<div className="three-annotation-tool-container">
        		<ThreeToggle title="annotations" callback={this.toggle} />
        		{editToggle}
        		{shortcutContainer}
        		{annotations}
      		</div>
    	);
    }
}