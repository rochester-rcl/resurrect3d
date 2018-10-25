/* @flow */
import { UPDATE_CONVERSION_PROGRESS, CONVERSION_COMPLETE, CONVERSION_ERROR } from '../../constants/actions';

export default class ConverterProgress {

  EVENT_TYPES = {
    UPDATE_CONVERSION_PROGRESS: UPDATE_CONVERSION_PROGRESS,
    CONVERSION_ERROR: CONVERSION_ERROR,
    DONE: 'DONE',
  }

  constructor() {
    this.queue = {};
  }

  on(eventType: string, callback) {
    if (this.EVENT_TYPES[eventType] === undefined) {
      console.warn('Attempting to register an invalid event type for ConverterProgress');
      return;
    }
    if (this.queue[eventType] === undefined) {
      this.queue[eventType] = [];
    }
    this.queue[eventType].push(callback);
  }

  dispatch(eventType: string, data: Object) {
    if (this.EVENT_TYPES[eventType] === undefined) {
      console.warn('Attempting to register an invalid event type for ConverterProgress');
      return;
    }
    if (this.queue[eventType] === undefined) {
      return;
    }
    this.queue[eventType].forEach((callback) => {
      callback(data);
    });
  }

  remove(eventType) {
    this.queue[eventType] = undefined;
  }

  removeAll() {
    this.queue = [];
  }

}
