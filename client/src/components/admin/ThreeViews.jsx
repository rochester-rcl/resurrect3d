import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getViews, deleteView} from '../../actions/ThreeViewActions';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import DeleteIcon from '@material-ui/icons/Delete';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import gImg from '../static/grass.jpg';
class Views extends Component {

  readyToLoad = false;

  constructor(props) {
    super(props);

    (this : any).handleDelete = this.handleDelete.bind(this);
    (this : any).handleLoadAsync = this.handleLoadAsync.bind(this);
    (this : any).handleRemoveAsync = this.handleRemoveAsync.bind(this);
    (this : any).state = {
      views: []
    }
  }

  loadAsyncData = () =>  new Promise( (resolve, reject) => {
    getViews();
    resolve(this.props.views);
  });

  removeAsyncData = (view) =>  new Promise( (resolve, reject) => {
    setTimeout( () => {
      deleteView(view);
      resolve();
    }, 5000);
  });


/*
  componentDidMount() {
    this.handleLoadAsynch();
    console.log(this.props.views);
    console.log(this.state.views);
  }

  componentWillReceiveProps(nextProps) {

    console.log('componentWillReceiveProps');
    if (nextProps.views !== this.props.views ) {
      this.setState({views: null});
      this.handleLoadAsynch();
    }

  }
  */
  /*
  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate was called');
    console.log(nextProps);
    if (nextProps.views == null) {
      this.props.getViews();
      return this.readyToLoad = false;
    } else {
      return this.readyToLoad = true;
    }
  }
  */

  handleLoadAsync = async () => {
    this._asyncRequest = this.loadAsyhcData().then(
      views => {
        this.setState({views});
      }
    );
  }

  handleRemoveAsync = async (view) => {
    this._asyncRequest = this.removeAsyncData(view)
    .then( () => this.removeAsyncData())
    .then( views => this.loadAsyncData())
    .then( views => {
        console.log(this.props.views);
        console.log(views);
        this.setState({views});
    });
  }

  handleDelete(id: number) {
    //e.preventDefault();
    console.log(id);
    this.handleRemoveAsync(id);
    console.log(this.props.views);
    console.log(this.state.views);
  }

  render() {

    if (this.props.views == null) {
      return (<div>
        <Typography>Getting views...</Typography>
      </div>);
    }else{
      const viewform = (<Link to='/viewform'>
        Add views
      </Link>);

      const container = (<Link to='/viewform'>
        Add views
      </Link>);


      var viewItems = this.props.views.map(view =>
        (<Card style={{display: 'flex'}} key={view._id} >
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <CardContent style={{flex: '1 0 auto'}}>
                <Typography component="h5" variant="h5">{view.threeFile}</Typography>

                <Typography>{view.threeThumbnail}</Typography>

                <Typography>{view.skybox.file}</Typography>

                <Typography>{view.enableLight.toString()}</Typography>

                <Typography>{view.enableMaterials.toString()}</Typography>

                <Typography>{view.enableShaders.toString()}</Typography>

                <Typography>{view.enableMeasurement.toString()}</Typography>

                <Typography>{view.modelUnits}</Typography>
            </CardContent>
            <div style={{
                display: 'flex',
                alignItems: 'center'}}>
              <Fab
                color="secondary"
                aria-label="Delete"
                >
                <DeleteIcon />
              </Fab>
            </div>
            <CardMedia
              style={{ width: 151}}
              image="../static/grass.jpg"
              />
          </div>
        </Card>
        ));

        return (
          <div>
           {viewItems}
          </div>);
    }


    //} else {
    /*
      return (<div>
        <h1 className='ui header'>Views</h1>
        {viewform}
        <p>Getting views...</p>
      </div>);
    }
    */
  }
}

Views.propTypes = {
  getViews: PropTypes.func.isRequired,
  deleteView: PropTypes.func.isRequired,
  views: PropTypes.array.isRequired,
  newView: PropTypes.object
};

function mapStateToProps(state) {
  return{
    views: state.views.views,
    newView: state.views.view
  }
};

export default connect(mapStateToProps)(Views);
