/* @flow */
import 'babel-polyfill';
import pako from "pako";
import { WORKER_PROGRESS, WORKER_DATA } from '../../constants/application';
import {GZIP_CHUNK_SIZE} from '../../constants/application';
// keep it consistent with inflator for progress - needs to be converted to Uint8Array
const deflate = (inputData: string, chunkSize: number): Uint8Array => {
  const deflator = new pako.Deflate({ gzip: true });
  let done = false;
  for (let i = 0; i < inputData.length; i += chunkSize) {
    const end = i + chunkSize;
    const progress = Math.floor((end / inputData.length) * 100);
    postMessage({ type: WORKER_PROGRESS, payload: (progress <= 100) ? progress : 100 });
    if (end >= inputData.length) {
      done = true;
    }
    deflator.push(inputData.slice(i, i + chunkSize), done);
  }
  if (deflator.err) {
    console.warn(deflator.msg);
    return null;
  } else {
    return deflator.result;
  }
}

self.onmessage = (event: Event) => {  // eslint-disable-line no-restricted-globals
  const { data } = event;
  let inputData = data;
  if (data.constructor !== String) {
    inputData = JSON.stringify(data);
  }
  const gzipped = deflate(inputData, GZIP_CHUNK_SIZE);
  if (gzipped !== null) {
    postMessage({ type: WORKER_DATA, payload: gzipped });
  }
}
