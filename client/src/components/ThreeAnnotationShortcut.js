/* @flow */

// React
import React from "react";

// semantic-ui-react
import { Label, Segment, Icon } from "semantic-ui-react";

const ThreeAnnotationShortcut = (props) =>
{
	var handleClick = () => {
		props.callback(props.annotations, props.index);
	}

	return (
		<Segment className="three-annotation-shortcut-container">
			<Label className="three-annotation-shortcut-title">{props.annotations[props.index].title}</Label>
			<button onClick={handleClick} className="three-annotation-shortcut-button">
				<Icon className="three-annotation-shortcut-icon" name="eye"/>
			</button>
		</Segment>
	);
}

export default ThreeAnnotationShortcut;
