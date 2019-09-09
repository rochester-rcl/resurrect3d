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
	let style = props.style ? {...headerStyle, ...props.style} : headerStyle;

	const handleChange = (event) =>
	{
		props.callback(event.target.data);
		style = {...style, ...{height: 'auto'}};
		style = {...style, ...{height: event.target.scrollHeight + 'px'}};
		console.log(style);
	}

	return (
		<div style = {style}>
			<textarea type = 'text' defaultValue = {props.text} onChange = {handleChange} style = {inputStyle}/>
		</div>
	);
}

export default ThreeAnnotationHeader;