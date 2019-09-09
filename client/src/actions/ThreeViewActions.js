/* @flow */

// Constants
import * as ActionConstants from '../constants/actions';

export function getViews(): Object  {
  return {
    type: ActionConstants.GET_VIEWS,
  }
}

export function getView(id: Number): Object {
  return {
    type: ActionConstants.GET_VIEW,
    id: id
  }
}

export function getThreeFile(id: Number): Object {
  return {
    type: ActionConstants.GET_THREEFILE,
    id: id
  }
}

export function updateView(viewData: Object): Object {
  return {
    type: ActionConstants.UPDATE_VIEW,
    viewData: viewData
  }
}

export function addView(viewData: Object): Object {
  return {
    type: ActionConstants.ADD_VIEW,
    viewData: viewData
  }
}

export function deleteView(id: number): Object {
  return {
    type: ActionConstants.DELETE_VIEW,
    id: id
  }
}
