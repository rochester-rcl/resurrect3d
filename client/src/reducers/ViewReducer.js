import * as ActionConstants from '../constants/actions';

const initialState = {
  views: [],
  view: {},
  user: null,
  file: {}
}

export default function(state = initialState, action){
  switch(action.type){
    case ActionConstants.VIEW_ADDED:
      return {
        ...state,
      };

    case ActionConstants.VIEWS_LOADED:
      return {
        ...state,
        views: action.views,
      }

    case ActionConstants.VIEW_LOADED:
      return {
        ...state,
        view: action.view,
      }

    case ActionConstants.USER_AUTHENTICATED:
      return {
        ...state,
        user: action.user,
      }
    /*case GET_VIEWS:
      console.log('get action');
      return {
        views: action.views
      };
    case GET_VIEW:
      console.log('get action');
      return {
        view: action.view
      };
    case GET_THREEFILE:
      console.log('get action');
      return {
        file: action.file
      }
    case UPDATE_VIEW:
      console.log('put action');
      return {
        view: action.view
      };
    case ADD_VIEW:
      console.log('add action');
      return {
        view: action.view
      };
    case DELETE_VIEW:
      console.log('delete action');
      return {
        view: action.view
      };*/
    default:
      return state;
  }
}
