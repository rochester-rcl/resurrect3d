import React from 'react';
import { Form } from 'semantic-ui-react';
import ThreeAnnotationHeader from './ThreeAnnotationHeader';
import ThreeAnnotationBody from './ThreeAnnotationBody';

const style = {
	width: '175px',
	height: '250px',
	resize: 'both',
	overflow: 'auto',
	textAlign: 'center',
	backgroundColor: '#1b1b1b'
}

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
			<div style = {style}>
				<ThreeAnnotationHeader callback = {this.updateTitle} style = {headerStyle} text = {this.props.title}/>
				<ThreeAnnotationBody callback = {this.updateText} style = {bodyStyle} text = {this.props.text}/>
			</div>
		);
	}
}