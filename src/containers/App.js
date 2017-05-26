/* @flow */

// React
import React, { Component } from 'react';

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// Actions
import * as AppActionCreators from '../actions/actions';

// Semantic UI
import { Icon } from 'semantic-ui-react';

// CSS
import 'semantic-ui-css/semantic.css';

// Containers
import ThreeContainer from './ThreeContainer';

class App extends Component {
  componentDidMount() {
    // Call this here to load initial data
    this.props.loadAPIDataAction();
  }
  render() {
    const { children, data } = this.props;
    return (
      <div className="app-root-container">
        <ThreeContainer />
      </div>
    );
  }
}

function mapStateToProps(state) {
  // Do sorting here
  return {
    data: state.data,
  }
}

function mapActionCreatorsToProps(dispatch: Object) {
  return bindActionCreators(AppActionCreators, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(App);
