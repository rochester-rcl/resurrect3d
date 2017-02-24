/* @flow */

const defaultState = {
  data: [],
}

export default function appReducer(state: Object = defaultState, action: Object): Object {
  switch (action.type) {
    case 'DATA_LOADED':
      return {
        ...state,
        data: action.data,
      };

    default:
      return state;
  }
}
