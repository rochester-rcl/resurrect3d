/* @flow */

// React
import React, { Component } from 'react';

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

//lodash
import lodash from 'lodash';

// Actions
import * as AppActionCreators from '../actions/actions';

// Components
import ThreeView from '../components/ThreeView';
import LoaderModal from '../components/LoaderModal';

const skyboxTexture = 'test_pano.jpg';
const meshPath = 'sphenodon.js';

class ThreeContainer extends Component {

  componentDidMount(): void {
    this.props.getThreeAssetAction(this.props.viewerId);
  }

  componentWillReceiveProps(nextProps: Object, nextState: Object): void {
    if (!lodash.isEqual(nextProps.threeAsset, this.props.threeAsset)) {
      this.props.loadMeshAction(nextProps.threeAsset.threeFile);
      if (nextProps.threeAsset.skybox.file) this.props.loadTextureAction(nextProps.threeAsset.skybox.file);
    }
  }
  render(): Object {
    const { mesh, texture, metadata, threeAsset } = this.props;

    if (mesh.progress === 'Complete' && texture.progress === 'Complete') {
      return(
        <ThreeView
          skyboxTexture={texture}
          mesh={mesh}
          renderDoubleSided={true}
          info={metadata}
          options={threeAsset}
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
    metadata: state.metadata,
    threeAsset: state.threeAsset,
  }

}

function mapActionCreatorsToProps(dispatch: Object) {

  return bindActionCreators(AppActionCreators, dispatch);

}

export default connect(mapStateToProps, mapActionCreatorsToProps)(ThreeContainer);
