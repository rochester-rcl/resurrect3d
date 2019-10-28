/* @flow */

// React
import React from "react";

// semantic-ui-react
import { Label, Segment, Icon } from "semantic-ui-react";

const ThreeAnnotationShortcut = (props) =>
{
	var focus = () => {
		props.focus(props.annotations, props.index);
	}

	var del = () => {
		props.delete(props.annotations, props.index);
	}

	return (
		<Segment className="three-annotation-shortcut-container">
			<Label className="three-annotation-shortcut-title">{props.annotations[props.index].title}</Label>
			<div className="three-annotation-shortcut-button-container">
				<button onClick={focus} className="three-annotation-shortcut-button">
					<Icon className="three-annotation-shortcut-icon" name="eye"/>
				</button>
				<button onClick={del} className="three-annotation-shortcut-button">
					<Icon className="three-annotation-shortcut-icon" name="close icon"/>
				</button>
			</div>
		</Segment>
	);
}

export default ThreeAnnotationShortcut;
