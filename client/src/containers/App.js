/* @flow */

// React
import React, { Component } from "react";

// Redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// Actions
import * as AppActionCreators from "../actions/actions";

// Semantic UI
import { Icon } from "semantic-ui-react";

// CSS
import "semantic-ui-css/semantic.css";

// Containers
import ThreeContainer from "./ThreeContainer";

class App extends Component {
  render() {
    const { children, data, match, embedded } = this.props;
    let path = window.rootUrl ? window.rootUrl : "/";
    return (
      <div className="app-root-container">
        <ThreeContainer
          viewerId={match.params.id}
          url={path}
          embedded={embedded}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    data: state.data
  };
}

function mapActionCreatorsToProps(dispatch: Object) {
  return bindActionCreators(AppActionCreators, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(App);
