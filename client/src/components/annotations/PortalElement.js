import React from 'react';
import ReactDom from 'react-dom';

const style = {
	backgroundColor: 'green',
	width: '50px',
	height: '50px'
}

const PortalElement = (props) =>
{
	return ReactDom.createPortal(props.component, props.domElement);
}

export default PortalElement;