/* @flow */

// React
import React, { Component } from 'react';

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// Actions
import * as AppActionCreators from '../actions/actions';

// Components
import ThreeView from '../components/ThreeView';

const skyboxTexture = 'Image-003.jpg';
const mesh = 'male_example.js'

window.someTest = 'test';

class ThreeContainer extends Component {
  render(): Object {
    return(
      <ThreeView
        skyboxTexture={skyboxTexture}
        mesh={mesh}
        minFOV={10}
        maxFOV={90}
      />
    );
  }
}

function mapStateToProps(state: Object): Object {
  return {

  }
}

function mapActionCreatorsToProps(dispatch: Object) {
  return bindActionCreators(AppActionCreators, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(ThreeContainer);
