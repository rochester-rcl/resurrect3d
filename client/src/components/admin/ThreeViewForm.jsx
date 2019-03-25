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
  state = {
    threeFile: '',
    threeThumbnail: '',
    skybox: '',
    enableLight: false,
    enableMaterials: false,
    enableShaders: false,
    enableMeasurement: false,
    modelUnits: UNITS[0],
  }

  constructor(props){
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onDiscard = this.onDiscard.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
    console.log(this.state);
  };

  onChange(e){
    if(e.target.name === 'threeFile' ){
      this.setState({[e.target.name] : e.target.files[0]});
    }
    else if(e.target.name === 'threeThumbnail' ){
      console.log(e.target.files[0]);
      this.setState({[e.target.name] : e.target.files[0]});
    }
    else if(e.target.name === 'skybox' ){
      console.log(e.target.files[0]);
      this.setState({[e.target.name] : e.target.files[0]});
    }
    console.log(this.state);
  }

  onDiscard(e){
    e.preventDefault();
    //const { history } = this.props;
    //history.push('/');
  }

  onSubmit(e){
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
    this.props.addView(view);
  }


  render() {

    const viewform = (
      <Link to='/'> Views </Link>
    );
    return (
      <div>
        <h2>Add View</h2>
        {/*<h3>{viewform}</h3>*/}
        <form
          encType="multipart/form-data"
          onSubmit={this.onSubmit}>
          {/*
            <div className="field">
              <div className="ui raised segment">
                <div className="ui blue ribbon label">
                  <label>ThreeFile: </label>
                </div>

              </div>
            </div>
            */}
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
                    label="no file"
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
                    label="no three thumbnail"
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
                    label="no skybox"
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

            {/*
               <div className="field">
                <div className="ui raised segment">
                  <div className="ui blue ribbon label">
                    <label>ThreeThumbnail: </label>
                  </div>
                  <input
                    type="file"
                    name="threeThumbnail"
                    onChange={this.onChange}
                    accept="image/*"/>
                </div>
              </div>

              <div className="field">
                <div className="ui raised segment">
                  <div className="ui blue ribbon label">
                    <label>Skybox: </label>
                  </div>
                  <input
                    type="file"
                    name="skybox"
                    accept="image/*"
                    onChange={this.onChange}
                    />
                </div>
              </div>

              <div className="ui inverted segment">
                <div className="field">
                  <label>
                    <div className="ui horizontal inverted divider">
                      Enable Light: {this.state.enableLight.toString()}
                    </div>
                  </label>
                  <select name="enableLight" onChange={this.onChange}>
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>
                </div>
              </div>

              <div className="ui inverted segment">
                <div className="field">
                  <label>
                    <div className="ui horizontal inverted divider">
                      Enable Materials: {this.state.enableMaterials.toString()}
                    </div>
                  </label>
                  <select name="enableMaterials" onChange={this.onChange}>
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>
                </div>
              </div>

              <div className="ui inverted segment">
                <div className="field">
                  <label>
                    <div className="ui horizontal inverted divider">
                      Enable Shaders: {this.state.enableShaders.toString()}
                    </div>
                  </label>
                  <select name="enableShaders" onChange={this.onChange}>
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>
                </div>
              </div>

              <div className="ui inverted segment">
                <div className="field">
                  <label>
                    <div className="ui horizontal inverted divider">
                      Enable Measurement: {this.state.enableMeasurement.toString()}
                    </div>
                  </label>
                  <select name="enableMeasurement" onChange={this.onChange}>
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <div className="ui raised segment">
                  <div className="ui blue ribbon label">
                    <label>Model Units: </label>
                  </div>
                  <select name="modelUnits" value={this.state.modelUnits} onChange={this.onChange}>
                    {UNITS.map((unit, index) =>
                      <option key={index} value={unit}>{unit}</option>
                    )}
                  </select>
                </div>
              </div>

              */}
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
                    color="secondary"
                    aria-label="Delete"
                    onClick={this.onDiscard}>
                    <DeleteIcon />
                  </Fab>
                </FormGroup>
              </Grid>
            </Grid>
            {/*<div className="ui buttons">
              <button className='ui fluid primary button' type="submit">
                <i className="signup icon"></i>
                Save
              </button>
              <div className="or"></div>
              <button className='ui fluid secondary button' onClick={this.onDiscard}>Discard</button>
            </div>*/}
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

function mapActionCreatorsToProps(dispatch: Object) {

  return bindActionCreators(AdminActionCreators, dispatch);

}

export default connect(mapStateToProps, mapActionCreatorsToProps)(Viewform);
