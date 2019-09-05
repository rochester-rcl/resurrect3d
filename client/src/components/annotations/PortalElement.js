import React from 'react';
import ReactDom from 'react-dom';

const style = {
	backgroundColor: 'green',
	width: '50px',
	height: '50px'
}

const PortalElement = (props) =>
{
	return ReactDom.createPortal(<TempElement/>, props.domElement);
}

const TempElement = (props) =>
{
	return (
		<div style = {style}/>
		);
}

export default PortalElement;