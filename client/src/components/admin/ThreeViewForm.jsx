import React, {Component} from 'react';
import {Link } from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

// make an admin action creators file
import * as AdminActionCreators from '../../actions/ThreeViewActions';

// Constants
import { UNITS } from '../../constants/application';

import { Form } from 'semantic-ui-react';

import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import Fab from '@material-ui/core/Fab';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import SaveIcon from '@material-ui/icons/Save';

import {addView} from '../../actions/ThreeViewActions';

class Viewform extends Component {

  constructor(props){
    super(props);

    (this: any).addView = this.addView.bind(this);
    (this: any).onChange = this.onChange.bind(this);
    (this: any).onDiscard = this.onDiscard.bind(this);
    (this: any).handleChange = this.handleChange.bind(this);
    (this: any).state = {
      threeFile: '',
      threeThumbnail: '',
      skybox: '',
      threeFileName: '',
      threeThumbnailName: '',
      skyboxName: '',
      enableLight: false,
      enableMaterials: false,
      enableShaders: false,
      enableMeasurement: false,
      modelUnits: UNITS[0],
    };
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
    console.log(this.state);
  };

  onChange(e){
    if(e.target.name === 'threeFile' ){
      if (typeof e.target.files[0] === "undefined") {
        this.setState({threeFileName : ""});
        this.setState({[e.target.name] : ""});
      }else{
        console.log(e.target.files[0]);
        console.log(e.target.files[0].name);
        this.setState({threeFileName : e.target.files[0].name});
        this.setState({[e.target.name] : e.target.files[0]});
      }
    }
    else if(e.target.name === 'threeThumbnail' ){
      if (typeof e.target.files[0] === "undefined") {
        this.setState({threeThumbnailName : ""});
        this.setState({[e.target.name] : ""});
      }else{
        console.log(e.target.files[0]);
        console.log(e.target.files[0].name);
        this.setState({threeThumbnailName : e.target.files[0].name});
        this.setState({[e.target.name] : e.target.files[0]});
      }
    }
    else if(e.target.name === 'skybox' ){
      if (typeof e.target.files[0] === "undefined") {
        this.setState({skyboxName : ""});
        this.setState({[e.target.name] : ""});
      }else{
        console.log(e.target.files[0]);
        console.log(e.target.files[0].name);
        this.setState({skyboxName : e.target.files[0].name});
        this.setState({[e.target.name] : e.target.files[0]});
      }
    }
    console.log(this.state);
  }

  onDiscard(e){
    e.preventDefault();
    this.setState({
      threeFile: '',
      threeThumbnail: '',
      skybox: '',
      threeFileName: '',
      threeThumbnailName: '',
      skyboxName: '',
      enableLight: false,
      enableMaterials: false,
      enableShaders: false,
      enableMeasurement: false,
      modelUnits: UNITS[0],
    });
  }

  addView(e){
    const { handleAddView } = this.props;
    e.preventDefault();

    if(this.state.enableLight==='false'){
      this.setState({[this.state.enableLight] : false});
    }else{
      this.setState({[this.state.enableLight] : true});
    }

    if(this.state.enableMaterials==='false'){
      this.setState({[this.state.enableMaterials] : false});
    }else{
      this.setState({[this.state.enableMaterials] : true});
    }

    if(this.state.enableShaders==='false'){
      this.setState({[this.state.enableShaders] : false});
    }else{
      this.setState({[this.state.enableShaders] : true});
    }

    if(this.state.enableMeasurement==='false'){
      this.setState({[this.state.enableMeasurement] : false});
    }else{
      this.setState({[this.state.enableMeasurement] : true});
    }

    const view = {
      threeFile: this.state.threeFile,
      threeThumbnail: this.state.threeThumbnail,
      skybox:{file: this.state.skybox},
      enableLight: this.state.enableLight,
      enableMaterials: this.state.enableMaterials,
      enableShaders: this.state.enableShaders,
      enableMeasurement: this.state.enableMeasurement,
      modelUnits: this.state.modelUnits
    }

    //const { history } = this.props;
    console.log(view);
    handleAddView(view);
  }


  render() {

    const viewform = (
      <Link to='/'> Views </Link>
    );
    return (
      <div>
        <form
          encType="multipart/form-data"
          onSubmit={(e) => {this.addView(e)}}
          method="post">

            <Grid container spacing={8}>
              <Grid item xs={6}>
                <FormLabel component="legend">File uploads</FormLabel>
                <FormGroup row style={{paddingTop: "10px"}}>
                  <FormControlLabel
                    style={{marginLeft: "0px"}}
                    control={
                      <Button
                        variant="contained"
                        color="default"
                        component="label">
                        Upload
                        <CloudUploadIcon
                          style={{ marginLeft: "5px"}} />
                        <input
                          type="file"
                          name="threeFile"
                          style={{ display: "none" }}
                          onChange={this.onChange}
                          accept=".json,.gz"/>
                      </Button>
                    }
                    label={(this.state.threeFileName === "") ? "no file" : this.state.threeFileName}
                    labelPlacement="bottom"/>
                  <FormControlLabel
                    style={{marginLeft: "0px"}}
                    control={
                      <Button
                        style={{marginRight: "20 px"}}
                        variant="contained"
                        color="default"
                        component="label">
                        Upload
                        <CloudUploadIcon
                          style={{ marginLeft: "5px"}} />
                        <input
                          type="file"
                          name="threeThumbnail"
                          style={{ display: "none" }}
                          onChange={this.onChange}
                          accept="image/*"/>
                      </Button>
                    }
                    label={(this.state.threeThumbnailName === "") ? "no threeThumbnail" : this.state.threeThumbnailName}
                    labelPlacement="bottom"/>
                  <FormControlLabel
                    style={{marginLeft: "0px"}}
                    control={
                      <Button
                        style={{marginRight: "20 px"}}
                        variant="contained"
                        color="default"
                        component="label">
                        Upload
                        <CloudUploadIcon
                          style={{ marginLeft: "5px"}} />
                        <input
                          type="file"
                          name="skybox"
                          style={{ display: "none" }}
                          onChange={this.onChange}
                          accept="image/*"/>
                      </Button>
                    }
                    label={(this.state.skyboxName === "") ? "no skybox" : this.state.skyboxName}
                    labelPlacement="bottom"/>
                </FormGroup>
              </Grid>

              <Grid item xs={6}>
                <FormLabel component="legend">Toggables</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.enableLight}
                        onChange={this.handleChange('enableLight')}
                        value="enableLight"
                      />
                    }
                    label="enableLight"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.enableShaders}
                        onChange={this.handleChange('enableShaders')}
                        value="enableShaders"
                      />
                    }
                    label="enableShaders"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.enableMaterials}
                        onChange={this.handleChange('enableMaterials')}
                        value="enableMaterials"
                      />
                    }
                    label="enableMaterials"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.enableMeasurement}
                        onChange={this.handleChange('enableMeasurement')}
                        value="enableMeasurement"
                      />
                    }
                    label="enableMeasurement"
                  />
                </FormGroup>
              </Grid>

              <Grid item xs={9}>
              </Grid>
              <Grid item xs={3}>
                <FormLabel component="legend">Actions</FormLabel>
                <FormGroup row >
                  <Fab
                    aria-label="Save"
                    type="submit"
                    style={{marginRight: "5px"}}>
                    <SaveIcon />
                  </Fab>
                  <Fab
                    color="teal"
                    aria-label="Delete"
                    onClick={this.onDiscard}>
                    <DeleteIcon />
                  </Fab>
                </FormGroup>
              </Grid>
            </Grid>

        </form>
      </div>
    );
  }
}

Viewform.propTypes = {
  addView: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    views: state.views.views
  }
}
/*
function mapActionCreatorsToProps(dispatch: Object) {

  return bindActionCreators(AdminActionCreators, dispatch);

}
*/
export default connect(mapStateToProps)(Viewform);
