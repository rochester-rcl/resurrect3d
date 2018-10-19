/* @flow */
// constants
import { LOGIN_USER, AUTHENTICATE, LOGOUT_USER, REMOVE_LOGIN_ERROR, ADD_USER } from '../constants/actions';

export const addUser = (userInfo: Object): Object => {
  return {
    type: ADD_USER,
    userInfo: userInfo,
  }
}

export const loginUser = (loginInfo: Object): Object => {
  return {
    type: LOGIN_USER,
    loginInfo: loginInfo,
  }
}

export const authenticate = (): Object => {
  return {
    type: AUTHENTICATE,
  }
}

export const logoutUser = (): Object => {
  return {
    type: LOGOUT_USER
  }
}

export const resetLoginErrorMessage = (): Object => {
  return {
    type: REMOVE_LOGIN_ERROR,
  }
}
