/* @flow */

// React
import React, { Component } from "react";

// Redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

//lodash
import lodash from "lodash";

// Actions
import * as AppActionCreators from "../actions/actions";
import { changeAnnotationFocus } from "../actions/AnnotationActions";

// Components
import ThreeView from "../components/ThreeView";
import LoaderModal from "../components/LoaderModal";

// Constants
import { WEBGL_SUPPORT, PROGRESS_COMPLETE } from "../constants/application";

// images
import mapPin from "../images/map-pin.png";

class ThreeContainer extends Component {
  componentDidMount(): void {
    const {
      embedded,
      viewerId,
      url,
      getThreeAssetAction,
      loadLocalTextureAsset
    } = this.props;
    if (!embedded) {
      getThreeAssetAction(viewerId, url);
    } else {
      getThreeAssetAction(viewerId, url, embedded);
    }
    loadLocalTextureAsset(mapPin, "annotationSpriteTexture");
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
    const {
      mesh,
      texture,
      metadata,
      threeAsset,
      saveViewerSettings,
      user,
      saveStatus,
      viewerId
    } = this.props;
    // TODO Need to put some logic in here -- if the user is logged in AND they own the mesh
    // TODO Complete needs to be a constant
    if (
      mesh.progress === PROGRESS_COMPLETE &&
      texture.progress === PROGRESS_COMPLETE &&
      WEBGL_SUPPORT
    ) {
      return (
        <ThreeView
          skyboxTexture={texture}
          mesh={mesh}
          renderDoubleSided={true}
          info={metadata}
          options={threeAsset}
          onSave={saveViewerSettings}
          saveStatus={saveStatus}
          loggedIn={user.loggedIn}
          threeViewId={viewerId}
          localAssets={this.props.localAssets}
          changeAnnotationFocus={this.props.changeAnnotationFocus}
          embedded={this.props.embedded}
        />
      );
    } else {
      let progressStatus;
      if (!WEBGL_SUPPORT) {
        progressStatus = "Your Browser Does Not Currently Support WebGL";
      } else {
        progressStatus = mesh.progress.label;
      }
      return (
        <LoaderModal
          text={progressStatus}
          className="three-loader-dimmer"
          active={true}
          percent={mesh.progress.percent}
          progress={progressStatus}
          progressColor={"#21ba45"}
        />
      );
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
    saveStatus: state.ui.saveStatus,
    localAssets: state.ui.localAssets
  };
}

function mapActionCreatorsToProps(dispatch: Object) {
  return bindActionCreators(
    {
      ...AppActionCreators,
      ...{ changeAnnotationFocus: changeAnnotationFocus }
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(ThreeContainer);
