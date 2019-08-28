import React from 'react';

const headerStyle = {
	width: '50px',
	color: 'white',
	backgroundColor: 'black',
	textAlign: 'center'
}

const ThreeAnnotationHeader = (props) =>
{
	const handleChange = (event) =>
	{
		props.callback(event.target.data);
	}


	return (
		<div style = {headerStyle}>
			<input type = 'text' value = {props.text} onChange = {handleChange}/>
		</div>
	);
}

export default ThreeAnnotationHeader;