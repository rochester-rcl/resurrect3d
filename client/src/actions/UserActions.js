/* @flow */
// constants
import { LOGIN_USER, AUTHENTICATE } from '../constants/actions';
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
