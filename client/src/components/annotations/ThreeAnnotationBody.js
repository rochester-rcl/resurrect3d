import React from 'react';

const bodyStyle = {
	color: 'white',
	backgroundColor: '#0d0d0d',
	textAlign: 'center',
	display: 'flex',
	flex: '1',
	alignItems: 'center'
}

const inputStyle = {
	background: 'none',
	fontFamily: '"Source Code Pro", monospace !important',
	color: 'white',
	textAlign: 'center',
	margin: '0 auto',
	border: 'none',
	outline: 'none',
	resize: 'none',
}

const ThreeAnnotationBody = (props) =>
{
	const handleChange = (event) =>
	{
		props.callback(event.target.data);
	}

	let style = props.style ? {...bodyStyle, ...props.style} : bodyStyle;

	return (
		<div style = {style}>
			<textarea type = 'text' defaultValue = {props.text} onChange = {handleChange} style = {inputStyle}/>
		</div>
	);
}

export default ThreeAnnotationBody;
