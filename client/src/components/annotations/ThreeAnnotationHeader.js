import React from 'react';

const headerStyle = {
	color: 'white',
	backgroundColor: '#1b1b1b',
	textAlign: 'center',
	display: 'flex',
	flex: '1',
	flexWrap: 'wrap',
	alignItems: 'center'
}

const inputStyle = {
	background: 'none',
	fontFamily: '"Source Code Pro", monospace !important',
	color: 'white',
	textAlign: 'center',
	margin: 'auto',
	border: 'none',
	outline: 'none',
	resize: 'none'
}

const ThreeAnnotationHeader = (props) =>
{
	const handleChange = (event) =>
	{
		props.callback(event.target.data);
	}

	let style = props.style ? {...headerStyle, ...props.style} : headerStyle;

	return (
		<div style = {style}>
			<textarea type = 'text' defaultValue = {props.text} onChange = {handleChange} style = {inputStyle}/>
		</div>
	);
}

export default ThreeAnnotationHeader;