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

// Constants
import { WEBGL_SUPPORT } from '../constants/application';

class ThreeContainer extends Component {

  componentDidMount(): void {
    this.props.getThreeAssetAction(this.props.viewerId, this.props.url);
  }

  componentDidUpdate(prevProps: Object): void {
    if (!lodash.isEqual(prevProps.threeAsset, this.props.threeAsset)) {
      if (this.props.threeAsset.skybox.file !== null) {
        this.props.loadTextureAction(this.props.threeAsset.skybox.file);
        // Need logic for null image for skybox
      } else {
        this.props.noSkyboxTexture();
      }
    }
  }

  render(): Object {
    const { mesh, texture, metadata, threeAsset, saveViewerSettings, user } = this.props;
    // Need to put some logic in here -- if the user is logged in AND they own the mesh
    if (mesh.progress === 'Complete' && texture.progress === 'Complete' && WEBGL_SUPPORT) {
      return(
        <ThreeView
          skyboxTexture={texture}
          mesh={mesh}
          renderDoubleSided={true}
          info={metadata}
          options={threeAsset}
          onSave={saveViewerSettings}
          loggedIn={user.loggedIn}
        />
      );
    } else {
      let progressStatus;
      if (!WEBGL_SUPPORT) {
        progressStatus = "Your Browser Does Not Currently Support WebGL";
      } else {
        progressStatus = mesh.progress.label;
      }
      return(
        <LoaderModal
          text={progressStatus}
          className="three-loader-dimmer"
          active={true}
          percent={mesh.progress.percent}
          progress={progressStatus}
          progressColor={"#21ba45"}
        />);
    }
  }
}

function mapStateToProps(state: Object): Object {
  return {
    mesh: state.ui.mesh,
    texture: state.ui.texture,
    metadata: state.ui.metadata,
    threeAsset: state.ui.threeAsset,
    user: state.user,
  }

}

function mapActionCreatorsToProps(dispatch: Object) {

  return bindActionCreators(AppActionCreators, dispatch);

}

export default connect(mapStateToProps, mapActionCreatorsToProps)(ThreeContainer);
