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
    console.log(event);
    /*const reader = new FileReader();
    reader.onloadend = () => {
      // should be Uint8Array
      const res = reader.result;
      const uint8 = new Uint8Array(res);
      return inflate(
        uint8,
        GZIP_CHUNK_SIZE
      ).then(gunzipped => {
        const dataURL = "data:application/json," + gunzipped;
        resolve(dataURL);
      });
    };
    reader.readAsArrayBuffer(blob);*/
}
