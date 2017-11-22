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
import LoaderModal from '../components/LoaderModal';

const skyboxTexture = 'test_pano.jpg';
const meshPath = 'skull_blender_normals.js';

class ThreeContainer extends Component {

  componentDidMount(): void {

    this.props.loadMeshAction(meshPath);
    this.props.loadTextureAction(skyboxTexture);

  }
  render(): Object {
    const { mesh, texture } = this.props;
    if (mesh.progress === 'Complete' && texture.progress === 'Complete') {
      return(
        <ThreeView
          skyboxTexture={texture}
          mesh={mesh}
          renderDoubleSided={true}
        />
      );
    } else {
      let progressStatus = 'Loading Mesh: ' + mesh.progress + ' | ' + ' Loading Texture: ' + texture.progress;
      return(
        <LoaderModal
          text={progressStatus}
          className="three-loader-dimmer"
          active={true}
          progress={progressStatus}
          progressColor={"#21ba45"}
        />);
    }
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
