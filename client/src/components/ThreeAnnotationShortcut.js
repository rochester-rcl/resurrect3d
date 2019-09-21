/* @flow */

// React
import React from "react";

// semantic-ui-react
import { Label, Segment } from "semantic-ui-react";

const ThreeAnnotationShortcut = (props) =>
{
	var handleClick = () => {
		props.callback(props.annotation);
	}

	return (
		<Segment className="three-annotation-shortcut-container">
			<Label className="three-tool-title">{props.annotation.title}</Label>
			<button onClick={handleClick}>Focus</button>
		</Segment>
	);
}

export default ThreeAnnotationShortcut;

/*export default class ThreeAnnotationShortcut extends Component {
  render() {
    return (
      <Segment>
        <Label>Title</Label>
        <button>Focus</button>
      </Segment>
    );
  }
}*/
