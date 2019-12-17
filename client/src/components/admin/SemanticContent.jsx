import React from "react";
import PropTypes from "prop-types";

// React-redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as ActionCreators from "../../actions/ThreeViewActions";
import uniqueId from "lodash/uniqueId";
import {
  Button,
  Checkbox,
  Container,
  Dropdown,
  Form,
  Grid,
  Header,
  Icon,
  Image,
  Menu,
  Segment,
  Select,
  Sticky,
  Label,
  List,
  Visibility
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
      offScreen: false
    },
    threeFile: "",
    threeThumbnail: "",
    skybox: "",
    threeFileUpload: "",
    threeThumbnailUpload: "",
    skyboxUpload: "",
    threeFileCancel: true,
    threeThumbnailCancel: true,
    skyboxCancel: true,
    measurements: [
      { value: "MM", text: "mm", key: "mm" },
      { value: "FT", text: "ft", key: "ft" },
      { value: "CM", text: "cm", key: "cm" }
    ],
    booleans: [
      { value: false, text: "Disable", key: "disable" },
      { value: true, text: "Enable", key: "enable" }
    ],

    enableLight: "",
    enableMaterials: "",
    enableShaders: "",
    enableMeasurement: "",
    modelUnits: "",

    open: false,
    setOpen: false,
    isUpdate: false,
    _id: null
  };
  constructor(props: Object) {
    super(props);
    (this: any).threeFileRef = React.createRef();
    (this: any).threeThumbnailRef = React.createRef();
    (this: any).skyboxRef = React.createRef();
    (this: any).contextRef = React.createRef();
    (this: any).context = null;
    (this: any).state = this.defaultState;
  }

  componentDidMount = () => {
    this.props.getViews();
  };

  handleContextRef = ref => {
    this.setState({ context: ref });
  };

  handleVisablityUpdate = (e, { calculations }) =>
    this.setState({ calculations });

  editView(view) {
    const { viewerSettings, __v, skybox, ...rest } = view;
    rest.isUpdate = true;
    this.setState(prevState => ({ ...prevState, ...rest }));
  }

  resetAddForm = () => {
    this.setState(prevState => ({
      ...prevState,
      ...this.defaultState
    }));
  };

  handleFileUpload = event => {
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
          threeThumbnailCancel: !this.state.threeThumbnailCancel
        });
        break;
      case "skybox":
        this.setState({ [event.target.name]: event.target.files[0].name });
        this.setState({ skyboxUpload: event.target.files[0] });
        this.setState({ skyboxCancel: !this.state.skyboxCancel });
        break;
      default:
        console.log(event.target.name);
    }
  };

  handleEnableChange = (event, { name, value }) => {
    switch (name) {
      case "enableLight":
        this.setState({ [name]: value });
        break;
      case "enableShaders":
        this.setState({ [name]: value });
        break;
      case "enableMaterials":
        this.setState({ [name]: value });
        break;
      case "enableMeasurement":
        this.setState({ [name]: value });
        break;
      case "modelUnits":
        this.setState({ [name]: value });
        break;
      default:
        console.log(name);
    }
  };

  handleFileDiscard = target => {
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
          threeThumbnailCancel: !this.state.threeThumbnailCancel
        });
        break;
      case "skybox":
        this.setState({ skybox: "" });
        this.setState({ skyboxUpload: "" });
        this.setState({ skyboxCancel: !this.state.skyboxCancel });
        break;
      default:
        console.log(target);
    }
  };
  // TODO make a decision whether we bind or use anonymous functions to avoid binding to this

  handleSubmit = () => {
    const view = {
      threeFile: this.state.threeFileUpload,
      threeThumbnail: this.state.threeThumbnailUpload,
      skybox: { file: this.state.skyboxUpload },
      enableLight: this.state.enableLight,
      enableMaterials: this.state.enableMaterials,
      enableShaders: this.state.enableShaders,
      enableMeasurement: this.state.enableMeasurement,
      modelUnits: this.state.modelUnits
    };
    this.props.addView(view);
    this.setState(prevState => ({
      ...prevState,
      ...this.defaultState
    }));
  };

  isUploadFile(val) {
    return val.constructor.name === "File";
  }

  filesNeedUpdate = () => {
    const { threeFileUpload, skyboxUpload, threeThumbnailUpload } = this.state;
    const needsUpdate = {};
    if (this.isUploadFile(threeFileUpload)) {
      needsUpdate.threeFileUpload = threeFileUpload;
    }
    if (this.isUploadFile(skyboxUpload)) {
      needsUpdate.skyboxUpload = { file: skyboxUpload };
    }
    if (this.isUploadFile(threeThumbnailUpload)) {
      needsUpdate.threeThumbnailUpload = threeThumbnailUpload;
    }
    console.log(needsUpdate);
    return needsUpdate;
  }

  handleUpdate = () => {
    
    const view = {
      enableLight: this.state.enableLight,
      enableMaterials: this.state.enableMaterials,
      enableShaders: this.state.enableShaders,
      enableMeasurement: this.state.enableMeasurement,
      modelUnits: this.state.modelUnits,
      _id: this.state._id
    };
    const updated = {...view, ...this.filesNeedUpdate()}
    this.props.updateView(updated);
    this.setState(prevState => ({
      ...prevState,
      ...this.defaultState
    }));
  };

  render() {
    const { isUpdate } = this.state;
    const entries = Object.entries(this.props.views);

    const list = entries.map(obj => (
      <Segment inverted key={obj[1]._id}>
        <Button.Group>
          <Label as="span" basic>
            {obj[1]._id}
          </Label>
          <Button onClick={() => this.editView(obj[1])} icon color="grey">
            <Icon size="large" name="pencil" />
          </Button>
          <Button
            onClick={() => this.props.deleteView(obj[1]._id)}
            icon
            color="red"
          >
            <Icon size="large" name="remove circle" />
          </Button>
        </Button.Group>
        <List>
          <List.Item>{obj[1].threeFile}</List.Item>
          <List.Item>{obj[1].threeThumbnail}</List.Item>
          <List.Item>{obj[1].enableLight.toString()}</List.Item>
          <List.Item>{obj[1].enableMaterials.toString()}</List.Item>
          <List.Item>{obj[1].enableShaders.toString()}</List.Item>
          <List.Item>{obj[1].enableMeasurement.toString()}</List.Item>
          <List.Item>{obj[1].modelUnits}</List.Item>
          <List.Item>{obj[1].skybox.file}</List.Item>
        </List>
      </Segment>
    ));
    const addButton = <Button onClick={this.resetAddForm}>Add New</Button>;
    return (
      <div ref={this.handleContextRef}>
        <Grid centered={true} stackable columns={2}>
          <Grid.Column width={6}>
            <Sticky
              className="admin-main-form-sticky"
              context={this.state.context}
            >
              <Segment inverted className="admin-main-form">
                <Header>
                  {isUpdate ? (
                    <div className="update-view-header-container">
                      {"Update View"}
                      {addButton}
                    </div>
                  ) : (
                    "Add New View"
                  )}
                </Header>
                <Form className="admin-main-form">
                  <Form.Field>
                    <Button.Group>
                      <Button
                        as="div"
                        type="button"
                        labelPosition="right"
                        onClick={() => this.threeFileRef.current.click()}
                      >
                        <Button animated="fade">
                          <Button.Content visible>Upload</Button.Content>
                          <Button.Content hidden>
                            <Icon name="cloud upload" />
                          </Button.Content>
                        </Button>
                        <Label as="span" basic pointing="left">
                          {this.state.threeFile != ""
                            ? this.state.threeFile
                            : "no threeFile upload"}
                        </Label>
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
                        onClick={() => this.handleFileDiscard("threeFile")}
                        icon
                        disabled={this.state.threeFileCancel}
                        color="red"
                      >
                        <Icon size="large" name="remove circle" />
                      </Button>
                    </Button.Group>
                  </Form.Field>

                  <Form.Field>
                    <Button.Group>
                      <Button
                        as="div"
                        type="button"
                        labelPosition="right"
                        onClick={() => this.threeThumbnailRef.current.click()}
                      >
                        <Button animated="fade">
                          <Button.Content visible>Upload</Button.Content>
                          <Button.Content hidden>
                            <Icon name="cloud upload" />
                          </Button.Content>
                        </Button>
                        <Label as="span" basic pointing="left">
                          {this.state.threeThumbnail != ""
                            ? this.state.threeThumbnail
                            : "no threeThumbnail upload"}
                        </Label>
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
                        disabled={this.state.threeThumbnailCancel}
                        color="red"
                      >
                        <Icon size="large" name="remove circle" />
                      </Button>
                    </Button.Group>
                  </Form.Field>

                  <Form.Field>
                    <Button.Group>
                      <Button
                        as="div"
                        type="button"
                        labelPosition="right"
                        onClick={() => this.skyboxRef.current.click()}
                      >
                        <Button animated="fade">
                          <Button.Content visible>Upload</Button.Content>
                          <Button.Content hidden>
                            <Icon name="cloud upload" />
                          </Button.Content>
                        </Button>
                        <Label as="span" basic pointing="left">
                          {this.state.skybox != ""
                            ? this.state.skybox
                            : "no skybox upload"}
                        </Label>
                        <input
                          ref={this.skyboxRef}
                          type="file"
                          name="skybox"
                          hidden
                          onChange={this.handleFileUpload}
                          accept="image/*"
                        />
                      </Button>
                      <Button
                        onClick={() => this.handleFileDiscard("skybox")}
                        icon
                        disabled={this.state.skyboxCancel}
                        color="red"
                      >
                        <Icon size="large" name="remove circle" />
                      </Button>
                    </Button.Group>
                  </Form.Field>

                  <Form.Field
                    control={Select}
                    label="enableLight"
                    name="enableLight"
                    value={this.state.enableLight}
                    onChange={this.handleEnableChange}
                    options={this.state.booleans}
                    placeholder="enable/disable"
                  />

                  <Form.Field
                    control={Select}
                    label="enableShaders"
                    name="enableShaders"
                    value={this.state.enableShaders}
                    onChange={this.handleEnableChange}
                    options={this.state.booleans}
                    placeholder="enable/disable"
                  />

                  <Form.Field
                    control={Select}
                    label="enableMaterials"
                    name="enableMaterials"
                    value={this.state.enableMaterials}
                    onChange={this.handleEnableChange}
                    options={this.state.booleans}
                    placeholder="enable/disable"
                  />

                  <Form.Field
                    control={Select}
                    label="enableMeasurement"
                    name="enableMeasurement"
                    value={this.state.enableMeasurement}
                    onChange={this.handleEnableChange}
                    options={this.state.booleans}
                    placeholder="enable/disable"
                  />

                  <Form.Field
                    control={Select}
                    label="Select measurement"
                    name="modelUnits"
                    value={this.state.modelUnits}
                    onChange={this.handleEnableChange}
                    options={this.state.measurements}
                    placeholder="--"
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
            <Visibility className="admin-views-list">{list}</Visibility>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps): Object {
  return {
    views: state.views.views
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

