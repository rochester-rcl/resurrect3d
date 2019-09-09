//material ui
import React from 'react';

const bodyStyle = {
	color: 'white',
	backgroundColor: '#0d0d0d',
	textAlign: 'center',
	display: 'flex',
	flex: '1',
	alignItems: 'center',
	resize: 'both',
	overflow: 'auto'
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
	height: '100%'
}

const ThreeAnnotationBody = (props) =>
{
	let style = props.style ? {...bodyStyle, ...props.style} : bodyStyle;
	let textStyle = inputStyle;

	const handleChange = (event) =>
	{
		props.callback(event.target.data);
		textStyle = {...textStyle, ...{height: 'auto'}};
		textStyle = {...textStyle, ...{height: event.target.scrollHeight + 'px'}};
		style = {...style, ...{height: 'auto'}};
		style = {...style, ...{height: event.target.scrollHeight + 'px'}};
		console.log(textStyle);
	}

	return (
		<div style = {style}>
			<textarea type = 'text' defaultValue = {props.text} onChange = {handleChange} style = {textStyle}/>
		</div>
	);
}

export default ThreeAnnotationBody;
