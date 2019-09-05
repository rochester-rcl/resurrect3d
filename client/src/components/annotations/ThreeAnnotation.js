import React from 'react';
import ThreeAnnotationHeader from './ThreeAnnotationHeader';
import ThreeAnnotationBody from './ThreeAnnotationBody';

const headerStyle = {
	width: '50px',
	color: 'white',
	backgroundColor: 'black',
	textAlign: 'center'
}

const bodyStyle = {
	width: '50px',
	color: 'white',
	backgroundColor: 'black',
	textAlign: 'center'
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

		(this: any).updateTitle = this.updateTitle.bind(this)
		(this: any).updateText = this.updateText.bind(this);
	}

	updateTitle(event): void
	{
		console.log('updating title');
		this.setState({
			title: event.target.value
		}, this.props.callback(this.state));
	}

	updateText(event): void
	{
		this.setState({
			text: event.target.value
		}, this.props.callback(this.state));
	}

	render()
	{
		return (
			<div>
				<div style = {headerStyle}>
					<input type = 'text' value = {this.state.title} onChange = {this.updateTitle}/>
				</div>
				<div style = {bodyStyle}>
					<input type = 'text' value = {this.state.text} onChange = {this.updateText}/>
				</div>
			</div>
		);
	}
}