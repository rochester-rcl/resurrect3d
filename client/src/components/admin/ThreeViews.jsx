import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getViews, deleteView} from '../../actions/ThreeViewActions';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

class Views extends Component {

  readyToLoad = false;
  constructor(props) {
    super(props);
    //Bind actions
    this.onDelete = this.onDelete.bind(this);
  }

  componentWillMount() {
    this.props.getViews();
    console.log(this.props);
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps');
    if (this.readyToLoad) {
      if (nextProps.newView) {
        this.props.views.unshift(nextProps.newView);
      }
    }
  }

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

  onDelete(e) {
    e.preventDefault();
    this.props.deleteView(e.target.name);
    this.readyToLoad = false;
    this.props.getViews();
  }

  render() {

    const viewform = (<Link to='/viewform'>
      Add views
    </Link>);

    const container = (<Link to='/viewform'>
      Add views
    </Link>);

    if (this.readyToLoad) {
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
          <h2>{viewform}</h2>
          {viewItems}
        </div>);
    } else {
      return (<div>
        <h1 className='ui header'>Views</h1>
        {viewform}
        <p>Getting views...</p>
      </div>);
    }
  }
}

Views.propTypes = {
  getViews: PropTypes.func.isRequired,
  deleteView: PropTypes.func.isRequired,
  views: PropTypes.array.isRequired,
  newView: PropTypes.object
};

const mapStateToProps = state => ({views: state.views.views, newView: state.views.view});

export default connect(mapStateToProps, {getViews, deleteView})(Views);
