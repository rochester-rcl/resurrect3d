import * as ActionConstants from '../constants/actions';

const initialState = {
  views: [],
  view: {},
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

    default:
      return state;
  }
}
