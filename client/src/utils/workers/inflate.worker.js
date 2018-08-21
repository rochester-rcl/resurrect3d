/* @flow */
import pako from "pako";
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

self.onmessage = (event: Event) => {
  const { data } = event;
  const uint8 = new Uint8Array(data);
  const gunzipped = inflate(uint8, GZIP_CHUNK_SIZE);
  const dataURL = "data:application/json," + gunzipped;
  postMessage(dataURL);
}
