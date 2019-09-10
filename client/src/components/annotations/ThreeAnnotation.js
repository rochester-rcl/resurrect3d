import React from 'react';
import { Form, Divider } from 'semantic-ui-react';
import ThreeAnnotationHeader from './ThreeAnnotationHeader';
import ThreeAnnotationBody from './ThreeAnnotationBody';
import './annotation.css';

const headerStyle = {
	width: '100%',
	height: '25%',
	color: 'white',
}

const bodyStyle = {
	width: '100%',
	height: '75%',
	color: 'white',
}

export default class ThreeAnnotation extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			title: props.title,
			text: props.text
		};

		(this: any).updateTitle = this.updateTitle.bind(this);
		(this: any).updateText = this.updateText.bind(this);
	}

	updateTitle(title): void
	{
		this.setState({
			title: title
		}, this.props.callback(this.props.index, this.state));
	}

	updateText(text): void
	{
		this.setState({
			text: text
		}, this.props.callback(this.props.index, this.state));
	}

	render()
	{
		return (
			<div className="annotation">
				<div className="annotation-head">
					<textarea type = 'text' defaultValue = {this.state.title} onChange = {this.updateTitle} className="text-area"/>
				</div>
				<div className="annotation-body">
					<textarea type = 'text' defaultValue = {this.state.text} onChange = {this.updateText} className="text-area"/>
				</div>
			</div>
		);
	}
}