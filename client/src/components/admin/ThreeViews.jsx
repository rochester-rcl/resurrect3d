import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getViews, deleteView} from '../../actions/ThreeViewActions';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

class Views extends Component {

  readyToLoad = false;

  loadAsyhcData = () =>  new Promise( (resolve, reject) => {
    getViews();
    resolve(this.props.views);
  });

  constructor(props) {
    super(props);

    (this : any).onDelete = this.onDelete.bind(this);
    (this : any).handleLoadAsynch = this.handleLoadAsynch.bind(this);
    (this : any).state = {
      views: []
    }
  }

  componentWillMount() {
    //console.log(this.props);
  }

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

  handleLoadAsynch = async () => {
    this._asyncRequest = this.loadAsyhcData().then(
      views => {
        this.setState({views});
      }
    );
  }

  onDelete(e) {
    e.preventDefault();
    this.props.deleteView(e.target.name);
    this.readyToLoad = false;
    this.props.getViews();
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

      //if (!this.readyToLoad) {
        const viewItems = this.props.views.map(view =>
          (<div key={view._id} >
            <Paper>
              <Link to={`/admin/view/${view._id}`}>
                <h2>{view.threeFile}</h2>
              </Link>

              <Typography>{view.threeThumbnail}</Typography>

              <Typography>{view.skybox.file}</Typography>

              <Typography>{view.enableLight.toString()}</Typography>

              <Typography>{view.enableMaterials.toString()}</Typography>

              <Typography>{view.enableShaders.toString()}</Typography>

              <Typography>{view.enableMeasurement.toString()}</Typography>

              <Typography>{view.modelUnits}</Typography>



              {/*<Link to={`/admin/view/${view._id}`}>
                <div>Update</div>
              </Link>

              <button
                className='ui orange button'
                type="button"
                name={view._id}
                onClick={this.onDelete}>
                Delete
              </button>*/}
            </Paper>
          </div>
          ));

        return (
          <div>
            {/*<h2>{viewform}</h2>*/}
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
