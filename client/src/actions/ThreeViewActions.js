import {GET_VIEWS, GET_VIEW, GET_THREEFILE, UPDATE_VIEW, ADD_VIEW, DELETE_VIEW, AUTHENTICATE, LOGIN_USER} from '../constants/actions';

import endpoint from '../constants/api-endpoints';


export const getViews = (): Object => {
  return {
    type: GET_VIEWS,
  }
}

export const getView = (id: number): Object => {
  return {
    type: GET_VIEW,
    id: id
  }
}

export const getThreeFile = (id: number): Object => {
  return {
    type: GET_THREEFILE,
    id: id
  }
}

export const updateView = (viewData: Object): Object => {
  return {
    type: UPDATE_VIEW,
    viewData: viewData
  }
}

export const addView = (viewData: Object): Object => {
  return {
    type: ADD_VIEW,
    viewData: viewData
  }
}

export const deleteView = (id: number): Object => {
  return {
    type: DELETE_VIEW,
    id: id
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
