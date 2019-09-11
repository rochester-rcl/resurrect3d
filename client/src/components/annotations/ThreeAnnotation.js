import React from 'react';
import { Form, Divider } from 'semantic-ui-react';
import ThreeAnnotationHeader from './ThreeAnnotationHeader';
import ThreeAnnotationBody from './ThreeAnnotationBody';
import GrowingTextArea from './GrowingTextArea';
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
			titleHeight: 40,
			text: props.text,
			textHeight: 80
		};

		(this: any).updateTitle = this.updateTitle.bind(this);
		(this: any).updateText = this.updateText.bind(this);
	}

	updateTitle(event): void
	{
		this.setState({
			title: event.target.value,
			titleHeight: event.target.scrollHeight
		}, this.props.callback(this.props.index, this.state));
	}

	updateText(event): void
	{
		this.setState({
			text: event.target.value,
			textHeight: event.target.scrollHeight
		}, this.props.callback(this.props.index, this.state));
	}

	render()
	{
		return (
			<div className="annotation">
				<div className="annotation-head" style={{height: this.state.titleHeight}}>
					<GrowingTextArea onChange = {this.updateTitle}>
						{this.state.title}
					</GrowingTextArea>
				</div>
				<div className="annotation-body" style={{height: this.state.textHeight}}>
					<GrowingTextArea onChange = {this.updateText}>
						{this.state.text}
					</GrowingTextArea>
				</div>
			</div>
		);
	}
}