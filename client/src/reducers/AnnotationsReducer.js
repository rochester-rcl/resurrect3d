import * as ActionConstants from '../constants/actions';

const defaultState = {
	annotations: []
}

export default function AnnotationsReducer(state: Object = defaultState, action: Object): Object {
	switch (action.type) {

		case ActionConstants.ADD_ANNOTATION:
			return {
				...state,
				annotations: [...state.annotations, action.annotation]
			}

		case ActionConstants.UPDATE_ANNOTATION:
			return {
				...state,
				annotations: [...state.annotations.slice(0, action.id), {...state.annotations[action.id], ...action.annotation}, ...state.annotations.slice(action.id+1)]
			}

		case ActionConstants.DELETE_ANNOTATION:
			return {
				...state,
				annotations: state.annotations.filter((obj, index) => index != action.id)
			}
			
		case ActionConstants.TOGGLE_ANNOTATION:
			return{
				...state,
				annotations: [...state.annotations.slice(0, action.id), {...state.annotations[action.id], open: !state.annotations[action.id].open}, ...state.annotations.slice(action.id+1)]

			}
	}	
}