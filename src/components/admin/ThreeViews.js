import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getViews, deleteView} from '../../actions/ThreeViewActions';

//import SpinningCube from './three/SpinningCube';

class Views extends Component{

  constructor(props){
    super(props);

    this.onDelete = this.onDelete.bind(this);
  }

  readyToLoad = false;


  componentWillMount(){
    this.props.getViews();
    console.log(this.props);
  }

  componentWillReceiveProps(nextProps){
    console.log('componentWillReceiveProps');
    if(this.readyToLoad){
      if(nextProps.newView){
        this.props.views.unshift(nextProps.newView);
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate was called');
    console.log(nextProps);
    if(nextProps.views == null){
      this.props.getViews();
      return this.readyToLoad = false;
    }else{
      return this.readyToLoad = true;
    }
  }

  onDelete(e){
    e.preventDefault();
    this.props.deleteView(e.target.name);
    this.readyToLoad = false;
    this.props.getViews();
  }

  render() {

    const viewform = (
      <Link to='/viewform'> Add view </Link>
    );

  if(this.readyToLoad){
      const viewItems = this.props.views.map(view =>(
        <div key={view._id} className="ui card">
          <div className="ui raised segment">
            <div className="content">
              <div className="header">
                <div className="ui blue ribbon label">
                  <Link to={`/admin/view/${view._id}`}>
                    <h2>{view.threeFile}</h2>
                  </Link>
                </div>
              </div>
            </div>

            <div className="content">
              <div className="ui small feed">

                  <div className="event">
                    <div className="content">
                      <div className="summary">
                        <div>{view.threeThumbnail}</div>
                      </div>
                    </div>
                  </div>

                  <div className="event">
                    <div className="content">
                      <div className="summary">
                        <div>{view.skybox.file}</div>
                      </div>
                    </div>
                  </div>

                  <div className="event">
                    <div className="content">
                      <div className="summary">
                        <div>{view.enableLight.toString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="event">
                    <div className="content">
                      <div className="summary">
                        <div>{view.enableMaterials.toString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="event">
                    <div className="content">
                      <div className="summary">
                        <div>{view.enableShaders.toString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="event">
                    <div className="content">
                      <div className="summary">
                        <div>{view.enableMeasurement.toString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="event">
                    <div className="content">
                      <div className="summary">
                        <div>{view.modelUnits}</div>
                      </div>
                    </div>
                  </div>

              </div>
            </div>

            <div className="extra content">
              <div className="ui buttons">
                <button className='ui secondary button' >
                  <Link to={`/admin/view/${view._id}`}>
                    <div>Update</div>
                  </Link>
                </button>
                <div className="or"></div>
                <button className='ui orange button' type="button" name={view._id} onClick={this.onDelete}>Delete</button>
              </div>
            </div>

          </div>
        </div>
      ));

      return (
        <div>
          <h1 className='ui header'>Views</h1>
            <h2>{viewform}</h2>
            <hr />

            <div className="ui link cards">
              {viewItems}
            </div>
        </div>
      );
    }else{
      return (
        <div>
          <h1 className='ui header'>Views</h1>
          {viewform}
          <p>Getting views...</p>
        </div>
      );
    }
  }
}

Views.propTypes = {
  getViews: PropTypes.func.isRequired,
  deleteView: PropTypes.func.isRequired,
  views: PropTypes.array.isRequired,
  newView: PropTypes.object
};

const mapStateToProps = state => ({
  views: state.views.views,
  newView: state.views.view
});

export default connect(mapStateToProps, {getViews, deleteView})(Views);
