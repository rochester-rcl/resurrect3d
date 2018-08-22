/* @flow */
import pako from "pako";
import * as THREE from 'three';

const GZIP_CHUNK_SIZE = 512 * 1024;

const inflate = (gzip: Uint8Array, chunkSize: number ): string => {
  const inflator = new pako.Inflate({ to: "string" });
  let done = false;
  for (let i = 0; i < gzip.length; i += chunkSize) {
    let end = i + chunkSize;
    if (end >= gzip.length) done = true;
    inflator.push(gzip.slice(i, i + chunkSize), done);
  }
  if (inflator.err) {
    console.warn(inflator.msg);
  } else {
    return inflator.result;
  }
}
/* For now this handles geometries only as textures need to be done on the main thread for DOM access
  Geometries take the longest anyways */

self.onmessage = (event: Event) => {
  const { data } = event;
  const uint8 = new Uint8Array(data);
  const gunzipped = inflate(uint8, GZIP_CHUNK_SIZE);
  postMessage(JSON.parse(gunzipped));
}
