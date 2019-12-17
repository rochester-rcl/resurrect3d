import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getView, getThreeFile, updateView} from '../../actions/ThreeViewActions';
import { UNITS } from '../../constants/application';

class ViewDetails extends Component{

  readyToLoad = false;
  state = {
    threeFile: '',
    threeThumbnail: '',
    skybox: '',
    enableLight: false,
    enableMaterials: false,
    enableShaders: false,
    enableMeasurement: false,
    modelUnits: ''
  }
  constructor(props){
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onDiscard = this.onDiscard.bind(this);
  }

  componentDidMount() {

    const {match: {params} } = this.props;
    console.log(this.props);
    console.log('componentDidMount - was called');
    console.log(`componentDidMount - This is the params.id: ${params.id}`);
    console.log(`componentDidMount - getView was called`);
    this.props.getView(params.id);

  }

  componentDidUpdate(prevProps) {
    if (prevProps.view._id !== this.props.view._id) {
      this.setState({...this.props.view});
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate - was called');
    return this.readyToLoad = true;

  }

  onChange(e){
    if(e.target.name === 'threeFile' ){
      console.log(e.target.files[0]);
      this.setState({[e.target.name] : e.target.files[0]});
    }
    else if(e.target.name === 'threeThumbnail' ){
      this.setState({[e.target.name] : e.target.files[0]});
    }
    else if(e.target.name === 'skybox' ){
      this.setState({[e.target.name] : { file: e.target.files[0] }});
    }
    else{
      this.setState({[e.target.name] : e.target.value});
      //console.log(this.state);
    }
    //this.setState({[e.target.name] : //e.target.value});
  }

  onDiscard(e){
    e.preventDefault();
    const { history } = this.props;
    history.push('/');
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
      _id: this.props.view._id,
      ...this.state
    }

    console.log(view);

    const { history } = this.props;

    this.props.updateView(view);
  }

  render() {

    const view = (
      <Link to='/'> view </Link>
    );

    if(this.readyToLoad){
      return (
        <div>
          <h2>Change View</h2>
          <h3>{view}</h3>
          <hr />
          <form
            encType="multipart/form-data"
            onSubmit={this.onSubmit}>
            <div className="ui one column middle aligned very relaxed stackable grid">
              <div className="column">
                <div className="ui form">
                  <div className="field">
                    <div className="ui raised segment">
                      <div className="ui blue ribbon label">
                        <label>ThreeFile: {this.props.view.threeFile} </label>
                      </div>
                      <input
                        type="file"
                        name="threeFile"
                        onChange={this.onChange}
                        accept=".gz"/>
                    </div>
                  </div>

                  <div className="field">
                    <div className="ui raised segment">
                      <div className="ui blue ribbon label">
                        <label>ThreeThumbnail: {this.props.view.threeThumbnail} </label>
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
                        <label>Skybox: {this.props.view.skybox.file} </label>
                      </div>
                      <input
                        type="file"
                        name="skybox"
                        onChange={this.onChange}
                        accept="image/*"/>
                    </div>
                  </div>

                  <div className="ui inverted segment">
                    <div className="field">
                      <label>
                        <div className="ui horizontal inverted divider">
                          Enable Light: {this.props.view.enableLight.toString()}
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
                          Enable Materials: {this.props.view.enableMaterials.toString()}
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
                          Enable Shaders: {this.props.view.enableShaders.toString()}
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
                          Enable Measurement: {this.props.view.enableMeasurement.toString()}
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
                        <label>modelUnits: {this.props.view.modelUnits}</label>
                      </div>
                      <select name="modelUnits" onChange={this.onChange}>
                        {UNITS.map((unit, index) =>
                          <option key={index} value={unit}>{unit}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <br />

                  <div className="ui buttons">
                    <button className='ui fluid primary button' type="submit">Save</button>
                    <div className="or"></div>
                    <button className='ui fluid secondary button' onClick={this.onDiscard}>Discard</button>
                  </div>

                </div>
              </div>
            </div>
          </form>
        </div>
      );
    }else{
      return (
        <div>
          <h2>Change View</h2>
          {view}
          <p>Getting view...</p>
        </div>
      );
    }

  }
}

ViewDetails.propTypes = {
  getView: PropTypes.func,
  udpateView: PropTypes.func,
  getThreefile: PropTypes.func,
  view: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  view: state.views.view,
  file: state.views.file
});

export default connect(mapStateToProps, {getView, getThreeFile, updateView})(ViewDetails);
