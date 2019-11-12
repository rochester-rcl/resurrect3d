import React from 'react';

const ThreeAnnotationBody = (props) =>
{
	const handleChange = (event) =>
	{
		props.callback(event.target.data);
	}

	return (
		<div className="annotation-body">
			<textarea type = 'text' defaultValue = {props.text} onChange = {handleChange} className="text-area"/>
		</div>
	);
}

export default ThreeAnnotationBody;
