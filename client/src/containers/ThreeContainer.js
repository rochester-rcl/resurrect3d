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
import Scene from "../components/ThreeViewFiber";
import LoaderModal from "../components/LoaderModal";
import EmbedModePlayButton from "../components/EmbedModePlayButton";

// Constants
import { WEBGL_SUPPORT, PROGRESS_COMPLETE } from "../constants/application";

// images
import mapPin from "../images/map-pin.png";

class ThreeContainer extends Component {
  state = {
    loadModel: false,
  };

  componentDidMount(): void {
    const {
      embedded,
      viewerId,
      url,
      getThreeAssetAction,
      loadLocalTextureAsset,
    } = this.props;
    if (!embedded) {
      this.setState({
        loadModel: true,
      });
      getThreeAssetAction(viewerId, url);
    }
    loadLocalTextureAsset(mapPin, "annotationSpriteTexture");
  }

  startLoadingModel = () => {
    const { embedded, viewerId, url, getThreeAssetAction } = this.props;
    this.setState(
      {
        loadModel: true,
      },
      () => {
        getThreeAssetAction(viewerId, url, embedded);
      }
    );
  };

  componentDidUpdate(prevProps: Object): void {
    if (!lodash.isEqual(prevProps.threeAsset, this.props.threeAsset)) {
      if (this.props.threeAsset.skyboxFile) {
        this.props.loadTextureAction(this.props.threeAsset.skyboxFile);
        // Need logic for null image for skybox
      } else {
        this.props.noSkyboxTexture();
      }

      if (this.props.threeAsset.alternateMaps !== null) {
        for (let i = 0; i < this.props.threeAsset.alternateMaps.length; i++) {
          this.props.loadAlternateMapAction(this.props.threeAsset.alternateMaps[i])
        }
      }
      else
        console.log(this.props.threeAsset);
    }
  }

  render(): Object {
    const {
      embedded,
      mesh,
      texture,
      alternateMaps,
      metadata,
      threeAsset,
      saveViewerSettings,
      user,
      saveStatus,
      viewerId,
    } = this.props;
    const { loadModel } = this.state;
    // TODO Need to put some logic in here -- if the user is logged in AND they own the mesh
    // TODO Complete needs to be a constant
    let options = threeAsset;
    // Admin gets all options
    if (user.loggedIn) {
      options = { ...threeAsset };
      for (let key in options) {
        if (key.includes("enable")) {
          options[key] = true;
        }
      }
    }
    if (embedded && !loadModel) {
      return (
        <EmbedModePlayButton
          onClick={this.startLoadingModel}
          thumbnail={threeAsset.threeThumbnail}
          message="Load Model"
        />
      );
    }
    if (
      mesh.progress === PROGRESS_COMPLETE &&
      texture.progress === PROGRESS_COMPLETE &&
      WEBGL_SUPPORT
    ) {
      return (
        <Scene {...mesh} {...texture} />
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
/*       <Scene props={mesh, texture}/>   <ThreeView
          skyboxTexture={texture}
          mesh={mesh}
          alternateMaps = {alternateMaps}
          renderDoubleSided={true}
          info={metadata}
          options={options}
          onSave={saveViewerSettings}
          saveStatus={saveStatus}
          loggedIn={user.loggedIn}
          threeViewId={viewerId}
          localAssets={this.props.localAssets}
          changeAnnotationFocus={this.props.changeAnnotationFocus}
          embedded={this.props.embedded}
        />*/
function mapStateToProps(state: Object): Object {
  return {
    mesh: state.ui.mesh,
    texture: state.ui.texture,
    alternateMaps: state.ui.alternateMaps,
    metadata: state.ui.metadata,
    threeAsset: state.ui.threeAsset,
    user: state.user,
    saveStatus: state.ui.saveStatus,
    localAssets: state.ui.localAssets,
  };
}

function mapActionCreatorsToProps(dispatch: Object) {
  return bindActionCreators(
    {
      ...AppActionCreators,
      ...{ changeAnnotationFocus: changeAnnotationFocus },
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(ThreeContainer);
