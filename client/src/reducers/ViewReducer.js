import * as ActionConstants from '../constants/actions';

const initialState = {
  views: [],
  view: {},
  user: {
    loggedIn: false,
    loginError: false,
  },
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

    case ActionConstants.USER_LOGGED_IN:
      return {
        ...state,
        user: action.user,
      }

    case ActionConstants.LOGIN_ERROR:
      return {
        ...state,
        user: { ...state.user, ...{ loginError: true } },
      }

    case ActionConstants.REMOVE_LOGIN_ERROR:
      return {
        ...state,
        user: { ...state.user, ...{ loginError: false } },
      }

    default:
      return state;
  }
}
