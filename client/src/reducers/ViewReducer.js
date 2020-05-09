import * as ActionConstants from '../constants/actions';

const initialState = {
  views: [],
  view: {},
  file: {},
  pending: false
}

function updateViews(old, updated) {
  const cloned = { ...old };
  if (cloned[updated._id]) {
    cloned[updated._id] = updated;
  }
  return cloned;
}

export default function(state = initialState, action){
  switch(action.type){
    case ActionConstants.VIEW_ADDED:
      return {
        ...state,
      };
    
    case ActionConstants.ADD_VIEW_PENDING:
      return {
        ...state,
        pending: true,
      }

    case ActionConstants.VIEWS_LOADED:
      return {
        ...state,
        views: action.views,
        pending: false,
      }

    case ActionConstants.VIEW_LOADED:
      return {
        ...state,
        view: action.view,
        pending: false,
      }
    
    case ActionConstants.VIEW_UPDATED:
      return {
        ...state,
        views: updateViews(state.views, action.view),
        pending: false,
      }

    default:
      return state;
  }
}
