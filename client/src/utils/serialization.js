/* @flow */

// THREE
import * as THREE from 'three';

// Constants
import { THREE_COLOR, THREE_VECTOR2, THREE_VECTOR3, THREE_TYPES } from '../constants/application';

export function isValidThreeType(value: Object) {
    return THREE_TYPES.has(value.constructor.name);
}

export function isThreeType(value: Object) {
  if (!value) return false;
  return THREE[value.constructor.name] !== undefined;
}

function serializeThreeType(value: Object): Object {
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

function parseSerializedThreeType(value: string): Object {
  const values = value.split('__');
  values.shift();
  return { type: values[0], value: values[1] }
}

function deserializeThreeType(_value: string): Object {
  const { type, value } = parseSerializedThreeType(_value);
  switch(type) {
    case THREE_COLOR:
      return new THREE.Color(parseInt('0x' + value, 16));

    case THREE_VECTOR2:
      return new THREE.Vector2(...value.split(',').map((val) => parseFloat(val)));

    case THREE_VECTOR3:
      return new THREE.Vector3(...value.split(',').map((val) => parseFloat(val)));
  }
}

function walkThreeObject(values: Object, _mask: Set, func: any): Object {
  const update = (obj, mask) => {
    const serialized = {};
    for (let key in obj) {
      if (mask !== undefined) {
          if (mask.has(key)) {
            const val = obj[key];
            if (val.constructor === Object) {
              serialized[key] = update(obj[key], undefined);
            } else {
              func(val, key, serialized);
            }
          }
        } else {
          const val = obj[key];
          if (val && val.constructor === Object) {
            serialized[key] = update(obj[key]);
          } else {
            func(val, key, serialized);
          }
        }
      }
    return serialized;
  }
  const result = update({...values}, _mask);
  return result;
}

export function serializeThreeTypes(threeValues: Object, _mask: Set): Object {
  const serialize = (val, key, serializedObj) => {
    if (isThreeType(val)) {
      if (isValidThreeType(val)) {
        serializedObj[key] = '__' + val.constructor.name + '__' + serializeThreeType(val);
      }
    } else {
      serializedObj[key] = val;
    }
  }
  const result = walkThreeObject(threeValues, _mask, serialize);
  return result;
}

export function deserializeThreeTypes(threeValues: Object): Object {
  const deserialize = (val, key, serializedObj) => {
    if ((val && val.constructor === String) && val.startsWith('__')) {
      serializedObj[key] = deserializeThreeType(val);
    } else {
      serializedObj[key] = val;
    }
  }
  const result = walkThreeObject(threeValues, undefined, deserialize);
  return result;
}
