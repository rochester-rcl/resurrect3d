import React from 'react';
import ReactDom from 'react-dom';

const style = {
	backgroundColor: 'green',
	width: '50px',
	height: '50px'
}

const PortalElement = (props) =>
{
	const { domElement } = props;
	return domElement ? ReactDom.createPortal(props.component, props.domElement) : null;
}

export default PortalElement;