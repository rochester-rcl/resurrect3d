/* @flow */
import 'babel-polyfill';
import pako from "pako";
import * as THREE from 'three';
import { WORKER_PROGRESS, WORKER_DATA } from '../../constants/application';
import {GZIP_CHUNK_SIZE} from '../../constants/application';

const inflate = (gzip: Uint8Array, chunkSize: number ): string => {
  const inflator = new pako.Inflate({ to: "string" });
  let done = false;
  for (let i = 0; i < gzip.length; i += chunkSize) {
    const end = i + chunkSize;
    const progress = Math.floor((end / gzip.length) * 100);
    postMessage({ type: WORKER_PROGRESS, payload: (progress <= 100) ? progress : 100 });
    if (end >= gzip.length) {
      done = true;
    }
    inflator.push(gzip.slice(i, i + chunkSize), done);
  }
  if (inflator.err) {
    console.warn(inflator.msg);
    return null;
  } else {
    return inflator.result;
  }
}
/* For now this handles geometries only as textures need to be done on the main thread for DOM access
  Geometries take the longest anyways */

self.onmessage = (event: Event) => {  // eslint-disable-line no-restricted-globals
  const { data } = event;
  const uint8 = new Uint8Array(data);
  const gunzipped = inflate(uint8, GZIP_CHUNK_SIZE);
  if (gunzipped !== null) {
    postMessage({ type: WORKER_DATA,  payload: JSON.parse(gunzipped) });
  }

}
