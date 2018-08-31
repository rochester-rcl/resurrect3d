/* @flow */

// THREE
import * as THREE from 'three';

// Constants
import {THREE_COLOR, THREE_VECTOR2, THREE_VECTOR3, THREE_TYPES} from '../constants/application';

export function isValidThreeType(value: Object) {
    return THREE_TYPES.has(value.constructor.name);
}

export function isThreeType(value: Object) {
  return THREE[value.constructor.name] !== undefined
}

export function serializeThreeType(value: Object): Object {
  switch(value.constructor.name) {
    case THREE_COLOR:
      return value.getHexString();

    case THREE_VECTOR2:
    case THREE_VECTOR3:
      return value.toArray();

    default:
      console.warn('unable to serialize value of type ' +  value.constructor);
      return value;
  }
}
