import React, { Component } from "react";
import { connect } from "react-redux";

class AnnotationsContainer extends Component
{
	constructor(props: Object) {
		super(props);
	}
}

const mapStateToProps = state =>
	return {
		annotations: state.annotations
	}

export default connect(mapStateToProps)(AnnotationsContainer)