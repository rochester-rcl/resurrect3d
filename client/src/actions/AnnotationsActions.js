import * as ActionConstants from '../constants/actions';

export const addAnnotation = (annotation: Object): Object => {
	return {
		type: ActionConstants.ADD_ANNOTATION,
		annotation: annotation
	}
}

export const updateAnnotation = (id: Number, annotation: Object): Object => {
	return {
		type: ActionConstants.UPDATE_ANNOTATION,
		id: id,
		annotation: annotation
	}
}

export const deleteAnnotation = (id: Number): Object => {
	return {
		type: ActionConstants.DELETE_ANOTATION,
		id: id
	}
}