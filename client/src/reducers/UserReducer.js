/* @flow */
// Constants
import * as ActionConstants from '../constants/actions';

const defaultState = {
  loggedIn: false,
  loginError: false,
  authenticateAttempted: false,
  info: {}
}

export default function(state = defaultState, action){
  switch(action.type){

    case ActionConstants.USER_LOGGED_IN:
      return {
        ...state,
        loggedIn: true,
        info: action.user,
      }

    case ActionConstants.USER_LOGGED_OUT:
      return {
        ...state,
        loggedIn: false,
        info: {},
      }
      
    case ActionConstants.AUTHENTICATE_ATTEMPTED:
      return {
        ...state,
        authenticateAttempted: action.value,
      }

    case ActionConstants.USER_AUTHENTICATED:
      return {
        ...state,
        loggedIn: action.loggedIn,
      }

    case ActionConstants.LOGIN_ERROR:
      return {
        ...state,
        loginError: true,
      }

    case ActionConstants.REMOVE_LOGIN_ERROR:
      return {
        ...state,
        loginError: false,
      }

    default:
      return state;
  }
}
