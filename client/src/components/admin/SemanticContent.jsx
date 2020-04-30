import React, { createRef } from "react";
import PropTypes from "prop-types";

// React-redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as ActionCreators from "../../actions/ThreeViewActions";
import ConverterContainer from "../../containers/converter/ConverterContainer";

import { Link } from "react-router-dom";

import {
  Button,
  Message,
  Confirm,
  Form,
  Grid,
  Header,
  Icon,
  Segment,
  Input,
  Select,
  Sticky,
  Ref,
  Label,
  List,
  Visibility,
  Divider,
} from "semantic-ui-react";

class SemanticContent extends React.Component {
  defaultState = {
    calculations: {
      direction: "none",
      height: 0,
      width: 0,
      topPassed: false,
      bottomPassed: false,
      pixelsPassed: 0,
      percentagePassed: 0,
      topVisible: false,
      bottomVisible: false,
      fits: false,
      passing: false,
      onScreen: false,
      offScreen: false,
    },
    threeFile: "",
    threeThumbnail: "",
    skyboxFile: "",
    threeFileUpload: "",
    threeThumbnailUpload: "",
    skyboxUpload: "",
    threeFileCancel: true,
    threeThumbnailCancel: true,
    skyboxCancel: true,
    measurements: [
      { value: "MM", text: "mm", key: "mm" },
      { value: "CM", text: "cm", key: "cm" },
      { value: "IN", text: "in", key: "in" },
      { value: "FT", text: "ft", key: "ft" },
    ],
    booleans: [
      { value: false, text: "Disable", key: "disable" },
      { value: true, text: "Enable", key: "enable" },
    ],

    enableLight: true,
    enableMaterials: true,
    enableShaders: true,
    enableMeasurement: true,
    enableAnnotations: true,
    enableDownload: true,
    enableEmbed: true,
    modelUnits: "MM",
    displayName: "",
    externalMaps: null,
    open: false,
    setOpen: false,
    isUpdate: false,
    _id: null,
    showConversionTool: false,
    formError: {
      status: false,
      message: "",
    },
    modelPendingDelete: null,
  };
  constructor(props: Object) {
    super(props);
    this.threeFileRef = React.createRef();
    this.threeThumbnailRef = React.createRef();
    this.skyboxRef = React.createRef();
    this.contextRef = React.createRef();
    this.context = null;
    this.contextRef = createRef();
    this.state = this.defaultState;
  }

  componentDidMount = () => {
    this.props.getViews();
  };

  handleVisablityUpdate = (e, { calculations }) =>
    this.setState({ calculations });

  editView(view) {
    const { viewerSettings, __v, ...rest } = view;
    rest.isUpdate = true;
    this.setState((prevState) => ({ ...prevState, ...rest }));
  }

  isFormElementSet = (element) => {
    return element !== "";
  };

  verifyForm = () => {
    const {
      displayName,
      threeFileUpload,
      enableLight,
      enableMaterials,
      enableShaders,
      enableMeasurement,
      enableAnnotations,
      enableEmbed,
      enableDownload,
      modelUnits,
      formError,
    } = this.state;
    // TODO refactor this
    const error = { status: false };
    let fieldName;
    const checkFields = () => {
      if (!this.isFormElementSet(displayName)) {
        error.status = true;
        fieldName = "Display Name";
        return;
      }
      if (!this.isFormElementSet(threeFileUpload)) {
        error.status = true;
        fieldName = "three.js File";
        return;
      }
      if (!this.isFormElementSet(enableLight)) {
        error.status = true;
        fieldName = "Enable Light Tools";
        return;
      }
      if (!this.isFormElementSet(enableMaterials)) {
        error.status = true;
        fieldName = "Enable Material Tools";
        return;
      }
      if (!this.isFormElementSet(enableShaders)) {
        error.status = true;
        fieldName = "Enable Shader Tools";
        return;
      }
      if (!this.isFormElementSet(enableMeasurement)) {
        error.status = true;
        fieldName = "Enable Measurement Tools";
        return;
      }
      if (!this.isFormElementSet(enableAnnotations)) {
        error.status = true;
        fieldName = "Enable Annotation Tools";
        return;
      }
      if (!this.isFormElementSet(enableEmbed)) {
        error.status = true;
        fieldName = "Enable User Embed";
        return;
      }
      if (!this.isFormElementSet(enableDownload)) {
        error.status = true;
        fieldName = "Enable User Download";
        return;
      }
      if (!this.isFormElementSet(modelUnits)) {
        error.status = true;
        fieldName = "Original Model Units";
        return;
      }
    };
    checkFields();
    if (error.status) {
      error.message = `${fieldName} is Required`;
      this.setState((prevState) => ({
        formError: error,
      }));
      return false;
    }
    return true;
  };

  resetAddForm = () => {
    this.setState((prevState) => ({
      ...prevState,
      ...this.defaultState,
    }));
  };

  handleFileUpload = (event) => {
    switch (event.target.name) {
      case "threeFile":
        this.setState({ [event.target.name]: event.target.files[0].name });
        this.setState({ threeFileUpload: event.target.files[0] });
        this.setState({ threeFileCancel: !this.state.threeFileCancel });
        break;
      case "threeThumbnail":
        this.setState({ [event.target.name]: event.target.files[0].name });
        this.setState({ threeThumbnailUpload: event.target.files[0] });
        this.setState({
          threeThumbnailCancel: !this.state.threeThumbnailCancel,
        });
        break;
      case "skyboxFile":
        this.setState({ [event.target.name]: event.target.files[0].name });
        this.setState({ skyboxUpload: event.target.files[0] });
        this.setState({ skyboxCancel: !this.state.skyboxCancel });
        break;
      default:
        break;
    }
  };

  handleMeshConverted = (threeFile, externalMaps) => {
    this.setState({
      threeFileUpload: threeFile,
      threeFileCancel: false,
      threeFile: threeFile.name,
      externalMaps: externalMaps,
    });
  };
  // TODO change this
  handleEnableChange = (event, { name, value }) => {
    // We probably don't need a switch here
    this.setState({ [name]: value });
  };

  handleFileDiscard = (target) => {
    switch (target) {
      case "threeFile":
        this.setState({ threeFile: "" });
        this.setState({ threeFileUpload: "" });
        this.setState({ threeFileCancel: !this.state.threeFileCancel });
        break;
      case "threeThumbnail":
        this.setState({ threeThumbnail: "" });
        this.setState({ threeThumbnailUpload: "" });
        this.setState({
          threeThumbnailCancel: !this.state.threeThumbnailCancel,
        });
        break;
      case "skyboxFile":
        this.setState({ skyboxFile: "" });
        this.setState({ skyboxUpload: "" });
        this.setState({ skyboxCancel: !this.state.skyboxCancel });
        break;
      default:
        console.log(target);
    }
  };
  // TODO make a decision whether we bind or use anonymous functions to avoid binding to this
  formatExternalMaps = () => {
    const { externalMaps } = this.state;
    if (externalMaps) {
      return {
        externalMapInfo: externalMaps.map((m) => {
          const { file, ...rest } = m;
          return rest;
        }),
        externalMaps: externalMaps.map((m) => m.file),
      };
    }
    return {};
  };
  handleSubmit = () => {
    if (!this.verifyForm()) return;
    const view = {
      displayName: this.state.displayName,
      threeFile: this.state.threeFileUpload,
      threeThumbnail: this.state.threeThumbnailUpload,
      skyboxFile: this.state.skyboxUpload,
      enableLight: this.state.enableLight,
      enableMaterials: this.state.enableMaterials,
      enableShaders: this.state.enableShaders,
      enableMeasurement: this.state.enableMeasurement,
      enableAnnotations: this.state.enableAnnotations,
      enableDownload: this.state.enableDownload,
      enableEmbed: this.state.enableEmbed,
      modelUnits: this.state.modelUnits,
      ...this.formatExternalMaps(),
    };
    this.props.addView(view);
    this.setState((prevState) => ({
      ...prevState,
      ...this.defaultState,
    }));
  };

  isUploadFile(val) {
    return val.constructor.name === "File";
  }

  filesNeedUpdate = () => {
    const { threeFileUpload, skyboxUpload, threeThumbnailUpload } = this.state;
    const needsUpdate = {};
    if (this.isUploadFile(threeFileUpload)) {
      needsUpdate.threeFile = threeFileUpload;
    }
    if (this.isUploadFile(skyboxUpload)) {
      needsUpdate.skyboxFile = skyboxUpload;
    }
    if (this.isUploadFile(threeThumbnailUpload)) {
      needsUpdate.threeThumbnail = threeThumbnailUpload;
    }
    return needsUpdate;
  };

  toggleConversionTool = () => {
    this.setState((prevState) => ({
      ...prevState,
      showConversionTool: !prevState.showConversionTool,
    }));
  };

  handleUpdate = () => {
    const view = {
      displayName: this.state.displayName,
      threeFile: this.state.threeFile,
      skyboxFile: this.state.skyboxFile,
      threeThumbnail: this.state.threeThumbnail,
      enableLight: this.state.enableLight,
      enableMaterials: this.state.enableMaterials,
      enableShaders: this.state.enableShaders,
      enableMeasurement: this.state.enableMeasurement,
      enableAnnotations: this.state.enableAnnotations,
      enableDownload: this.state.enableDownload,
      enableEmbed: this.state.enableEmbed,
      modelUnits: this.state.modelUnits,
      _id: this.state._id,
      ...this.formatExternalMaps(),
    };
    const updated = { ...view, ...this.filesNeedUpdate() };
    this.props.updateView(updated);
    this.setState((prevState) => ({
      ...prevState,
      ...this.defaultState,
    }));
  };

  handleDelete = (view) => {
    this.setState((prevState) => ({
      modelPendingDelete: view,
    }));
    // () => this.props.deleteView(obj[1]._id)
  };

  confirmDelete = () => {
    const { modelPendingDelete } = this.state;
    if (modelPendingDelete) {
      this.props.deleteView(modelPendingDelete._id);
      this.cancelDelete();
    }
  };

  cancelDelete = () => {
    this.setState((prevState) => ({
      modelPendingDelete: null,
    }));
  };

  render() {
    const { isUpdate, showConversionTool } = this.state;
    const entries = Object.entries(this.props.views);
    const list = entries.map((obj) => (
      <Segment inverted key={obj[1]._id}>
        <Header as="h5">
          {obj[1].displayName ? obj[1].displayName : obj[1]._id}
        </Header>
        <Button.Group className="admin-list-button-group">
          <Button
            as={Link}
            to={`/models/${obj[1]._id}`}
            target="_blank"
            icon
            color="white"
          >
            <Icon size="large" name="eye" />
          </Button>
          <Button onClick={() => this.editView(obj[1])} icon color="grey">
            <Icon size="large" name="pencil" />
          </Button>
          <Button onClick={() => this.handleDelete(obj[1])} icon color="red">
            <Icon size="large" name="remove circle" />
          </Button>
        </Button.Group>
        <List className="admin-list" inverted divided>
          <List.Item>
            <Label className="admin-list-label" horizontal>
              three.js file
            </Label>
            {obj[1].threeFile}
          </List.Item>
          <List.Item>
            <Label className="admin-list-label" horizontal>
              thumbnail
            </Label>
            {obj[1].threeThumbnail}
          </List.Item>
          <List.Item>
            <Label className="admin-list-label" horizontal>
              skybox
            </Label>
            {obj[1].skyboxFile}
          </List.Item>
          <List.Item>
            <Label className="admin-list-label" horizontal>
              light tools
            </Label>
            {obj[1].enableLight.toString()}
          </List.Item>
          <List.Item>
            <Label className="admin-list-label" horizontal>
              material tools
            </Label>
            {obj[1].enableMaterials.toString()}
          </List.Item>
          <List.Item>
            <Label className="admin-list-label" horizontal>
              shader tools
            </Label>
            {obj[1].enableShaders.toString()}
          </List.Item>
          <List.Item>
            <Label className="admin-list-label" horizontal>
              measurement tools
            </Label>
            {obj[1].enableMeasurement.toString()}
          </List.Item>
          <List.Item>
            <Label className="admin-list-label" horizontal>
              annotation tools
            </Label>
            {obj[1].enableAnnotations.toString()}
          </List.Item>
          <List.Item>
            <Label className="admin-list-label" horizontal>
              model units
            </Label>
            {obj[1].modelUnits}
          </List.Item>
          <List.Item>
            <Label className="admin-list-label" horizontal>
              user download
            </Label>
            {obj[1].enableDownload.toString()}
          </List.Item>
          <List.Item>
            <Label className="admin-list-label" horizontal>
              user embed
            </Label>
            {obj[1].enableEmbed.toString()}
          </List.Item>
        </List>
      </Segment>
    ));
    const addButton = <Button onClick={this.resetAddForm}>Add New</Button>;
    return (
      <Ref innerRef={this.contextRef}>
        <Grid centered={true} columns={2}>
          <Grid.Column width={6}>
            <Sticky
              className="admin-main-form-sticky"
              context={this.contextRef}
            >
              <Segment inverted className="admin-main-form" fluid>
                <Header>
                  {isUpdate ? (
                    <div className="update-view-header-container">
                      {"Update Model"}
                      {addButton}
                    </div>
                  ) : (
                    "Add New Model"
                  )}
                </Header>
                <Form
                  fluid
                  className="admin-main-form"
                  error={this.state.formError.status}
                >
                  <Form.Field
                    control={Input}
                    className="admin-select-text-input"
                    fluid
                    label="Display Name"
                    name="displayName"
                    value={this.state.displayName}
                    onChange={this.handleEnableChange}
                    placeholder="Name"
                  />
                  <Divider horizontal inverted>
                    {" "}
                    Files{" "}
                  </Divider>
                  <Form.Field className="admin-main-form-field">
                    <Header as="h5" className="admin-file-upload-header">
                      {this.state.threeFile != ""
                        ? this.state.threeFile
                        : "Select three.js File"}
                    </Header>
                    <Button.Group className="admin-button-group">
                      <Button
                        className="admin-button-group-button"
                        icon
                        title="Open File"
                        onClick={() => this.threeFileRef.current.click()}
                      >
                        <Icon name="folder outline" size="large" />
                        <input
                          ref={this.threeFileRef}
                          type="file"
                          name="threeFile"
                          hidden
                          onChange={this.handleFileUpload}
                          accept=".json,.gz"
                        />
                      </Button>
                      <Button
                        className="admin-button-group-button"
                        onClick={this.toggleConversionTool}
                        icon
                        title="Open Converter"
                        color="grey"
                      >
                        <Icon
                          size="large"
                          name={showConversionTool ? "list" : "cube"}
                        />
                      </Button>
                      <Button
                        onClick={() => this.handleFileDiscard("threeFile")}
                        icon
                        title="Discard File"
                        disabled={this.state.threeFileCancel}
                        color="red"
                      >
                        <Icon size="large" name="remove circle" />
                      </Button>
                    </Button.Group>
                  </Form.Field>
                  <Form.Field className="admin-main-form-field">
                    <Header as="h5" className="admin-file-upload-header">
                      {this.state.threeThumbnail
                        ? this.state.threeThumbnail
                        : "Select Thumbnail"}
                    </Header>
                    <Button.Group className="admin-button-group">
                      <Button
                        className="admin-button-group-button"
                        icon
                        title="Open File"
                        onClick={() => this.threeThumbnailRef.current.click()}
                      >
                        <Icon size="large" name="folder outline" />
                        <input
                          ref={this.threeThumbnailRef}
                          type="file"
                          name="threeThumbnail"
                          hidden
                          onChange={this.handleFileUpload}
                          accept="image/*"
                        />
                      </Button>
                      <Button
                        onClick={() => this.handleFileDiscard("threeThumbnail")}
                        icon
                        title="Discard File"
                        disabled={this.state.threeThumbnailCancel}
                        color="red"
                      >
                        <Icon size="large" name="remove circle" />
                      </Button>
                    </Button.Group>
                  </Form.Field>

                  <Form.Field className="admin-main-form-field">
                    <Header as="h5" className="admin-file-upload-header">
                      {this.state.skyboxFile 
                        ? this.state.skyboxFile
                        : "Select Skybox"}
                    </Header>
                    <Button.Group className="admin-button-group">
                      <Button
                        className="admin-button-group-button"
                        icon
                        title="Open File"
                        onClick={() => this.skyboxRef.current.click()}
                      >
                        <Icon size="large" name="folder outline" />
                        <input
                          ref={this.skyboxRef}
                          type="file"
                          name="skyboxFile"
                          hidden
                          onChange={this.handleFileUpload}
                          accept="image/*"
                        />
                      </Button>
                      <Button
                        onClick={() => this.handleFileDiscard("skyboxFile")}
                        icon
                        title="Discard File"
                        disabled={this.state.skyboxCancel}
                        color="red"
                      >
                        <Icon size="large" name="remove circle" />
                      </Button>
                    </Button.Group>
                  </Form.Field>
                  <Divider horizontal inverted>
                    {" "}
                    Settings{" "}
                  </Divider>
                  <Form.Field
                    control={Select}
                    className="admin-select-dropdown"
                    fluid
                    label="Enable Light Tools"
                    name="enableLight"
                    value={this.state.enableLight}
                    onChange={this.handleEnableChange}
                    options={this.state.booleans}
                    placeholder="enable/disable"
                  />

                  <Form.Field
                    control={Select}
                    className="admin-select-dropdown"
                    fluid
                    label="Enable Shader Tools"
                    name="enableShaders"
                    value={this.state.enableShaders}
                    onChange={this.handleEnableChange}
                    options={this.state.booleans}
                    placeholder="enable/disable"
                  />

                  <Form.Field
                    control={Select}
                    className="admin-select-dropdown"
                    fluid
                    label="Enable Material Tools"
                    name="enableMaterials"
                    value={this.state.enableMaterials}
                    onChange={this.handleEnableChange}
                    options={this.state.booleans}
                    placeholder="enable/disable"
                  />

                  <Form.Field
                    control={Select}
                    className="admin-select-dropdown"
                    fluid
                    label="Enable Measurement Tools"
                    name="enableMeasurement"
                    value={this.state.enableMeasurement}
                    onChange={this.handleEnableChange}
                    options={this.state.booleans}
                    placeholder="enable/disable"
                  />

                  <Form.Field
                    control={Select}
                    className="admin-select-dropdown"
                    fluid
                    label="Enable Annotation Tools"
                    name="enableAnnotations"
                    value={this.state.enableAnnotations}
                    onChange={this.handleEnableChange}
                    options={this.state.booleans}
                    placeholder="enable/disable"
                  />

                  <Form.Field
                    control={Select}
                    className="admin-select-dropdown"
                    fluid
                    label="Original Model Units"
                    name="modelUnits"
                    value={this.state.modelUnits}
                    onChange={this.handleEnableChange}
                    options={this.state.measurements}
                    placeholder="--"
                  />

                  <Form.Field
                    control={Select}
                    className="admin-select-dropdown"
                    fluid
                    label="Enable User Download"
                    name="enableDownload"
                    value={this.state.enableDownload}
                    onChange={this.handleEnableChange}
                    options={this.state.booleans}
                    placeholder="enable/disable"
                  />

                  <Form.Field
                    control={Select}
                    className="admin-select-dropdown"
                    fluid
                    label="Enable User Embed"
                    name="enableEmbed"
                    value={this.state.enableEmbed}
                    onChange={this.handleEnableChange}
                    options={this.state.booleans}
                    placeholder="enable/disable"
                  />
                  <Message
                    icon="exclamation circle"
                    size="large"
                    className="admin-form-error-message"
                    error
                    header="Cannot Save Model"
                    content={this.state.formError.message}
                  />
                  <Form.Button
                    content={isUpdate ? "Update" : "Submit"}
                    onClick={isUpdate ? this.handleUpdate : this.handleSubmit}
                  />
                </Form>
              </Segment>
            </Sticky>
          </Grid.Column>
          <Grid.Column width={10}>
            {!showConversionTool ? (
              <Visibility className="admin-views-list">{list}</Visibility>
            ) : (
              <ConverterContainer
                onConversionComplete={this.handleMeshConverted}
                disable
              />
            )}
          </Grid.Column>
          <Confirm
            className="admin-form-delete-modal"
            open={this.state.modelPendingDelete}
            header="Delete Model"
            content={`Are you sure you want to delete ${
              this.state.modelPendingDelete
                ? this.state.modelPendingDelete.displayName
                : ""
            } ? This operation can't be undone.`}
            onCancel={this.cancelDelete}
            onConfirm={this.confirmDelete}
          />
        </Grid>
      </Ref>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    views: state.views.views,
    //userProfile: state.app.userProfile,
    //allBucketsInfo: state.app.allBucketsInfo
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(SemanticContent);
