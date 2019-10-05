import React from 'react';

export default class GrowingTextArea extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			rows: 2,
			minRows: 2,
			maxRows: 10
		};

		(this: any).handleInput = this.handleInput.bind(this);
	}

	handleInput(event): void
	{
		const lineHeight = 20;

		const prevRows = event.target.rows;
		event.target.rows = this.state.minRows;

		const currRows = ~~(event.target.scrollHeight / lineHeight);

		if (currRows === prevRows)
			event.target.rows = currRows;

		if (currRows >= this.state.maxRows)
		{
			event.target.rows = this.state.maxRows;
			event.target.scrollTop = event.target.scrollHeight;
		}

		this.setState({
			rows: currRows < this.state.maxRows ? currRows : this.state.maxRows
		});

		this.props.onChange(event);
	}

	render()
	{
		return (
			<textarea defaultValue = {this.props.children} type = 'text' rows = {this.state.rows} maxLength = {this.props.maxlength ? this.props.maxlength : "100"} onChange = {this.handleInput} className="text-area" readOnly = {this.props.readOnly}/>
		);
	}
}