import React from 'react';
import ThreeAnnotationHeader from './ThreeAnnotationHeader';
import ThreeAnnotationBody from './ThreeAnnotationBody';
import GrowingTextArea from './GrowingTextArea';

export default class ThreeAnnotation extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			title: props.title,
			titleStyle: {},
			text: props.text,
			textStyle: {}
		};

		(this: any).updateTitle = this.updateTitle.bind(this);
		(this: any).updateText = this.updateText.bind(this);
	}

	updateTitle(event): void
	{
		this.setState({
			title: event.target.value
		}, () => { this.props.callback(this.props.index, this.state); });
	}

	updateText(event): void
	{
		this.setState({
			text: event.target.value
		}, this.props.callback(this.props.index, this.state));
	}

	render()
	{
		return (
			<div className="annotation">
				<div className="annotation-head" style={this.state.titleStyle}>
					<textarea defaultValue = {this.state.title} type = 'text' onChange = {this.updaetTitle} className="text-area" readOnly = {!this.props.editable}/>
				</div>
				<div className="annotation-body" style={this.state.textStyle}>
					<textarea defaultValue = {this.state.text} type = 'text' onChange = {this.updateText} className="text-area" readOnly = {!this.props.editable}/>
				</div>
			</div>
		)
	}
}