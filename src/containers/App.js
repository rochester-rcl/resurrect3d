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

class App extends Component {
  componentDidMount() {
    // Call this here to load initial data
    this.props.loadAPIDataAction();
  }
  render() {
    const { children, data } = this.props;
    return (
      <div className="app-root-container">
        <h4>This app doesnt do much right now, but you should see a line below to show that redux / redux-saga is working</h4>
        {data[0]}
        <h4>Also if you dont see this --></h4><Icon name='thumbs outline up' size="huge"/><h4> semantic ui isnt working</h4>

        {children}
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
