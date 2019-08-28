import React from 'react';

const bodyStyle = {
	width: '50px',
	color: 'white',
	backgroundColor: 'black',
	textAlign: 'center'
}

const ThreeAnnotationBody = (props) =>
{
	const handleChange = (event) =>
	{
		props.callback(event.target.data);
	}


	return (
		<div style = {bodyStyle}>
			<input type = 'text' value = {props.text} onChange = {handleChange}/>
		</div>
	);
}

export default ThreeAnnotationBody;
