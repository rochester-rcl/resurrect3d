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
const meshPath = 'parrot.js';

window.someTest = 'test';

class ThreeContainer extends Component {
  componentDidMount(): void {

    this.props.loadMeshAction(meshPath);
    this.props.loadTextureAction(skyboxTexture);

  }
  render(): Object {
    const { mesh, texture } = this.props;
    console.log(mesh, texture);
    return(
      <ThreeView
        skyboxTexture={skyboxTexture}
        mesh={meshPath}
        minFOV={10}
        maxFOV={90}
      />
    );

  }
}

function mapStateToProps(state: Object): Object {

  return {
    mesh: state.mesh,
    texture: state.texture,
  }

}

function mapActionCreatorsToProps(dispatch: Object) {

  return bindActionCreators(AppActionCreators, dispatch);

}

export default connect(mapStateToProps, mapActionCreatorsToProps)(ThreeContainer);
