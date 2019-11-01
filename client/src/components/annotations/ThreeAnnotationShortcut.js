/* @flow */

// React
import React from "react";

// semantic-ui-react
import { Label, Segment, Icon } from "semantic-ui-react";

const ThreeAnnotationShortcut = (props) =>
{
	var focus = () => {
		props.focus(props.index);
	}

	var del = () => {
		props.delete(props.index);
	}

	return (
		<Segment className="annotation-shortcut-container">
			<Label className="annotation-shortcut-title">{props.title}</Label>
			<div className="annotation-shortcut-button-container">
				<button onClick={focus} className="annotation-shortcut-button">
					<Icon className="annotation-shortcut-icon" name="eye"/>
				</button>
				<button onClick={del} className="annotation-shortcut-button">
					<Icon className="annotation-shortcut-icon" name="close"/>
				</button>
			</div>
		</Segment>
	);
}

export default ThreeAnnotationShortcut;
