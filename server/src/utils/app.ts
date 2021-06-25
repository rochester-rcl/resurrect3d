type KeyedObject = { [key: string]: any };

export const APP_CONSTANTS = {
  MULTIPART_FORMDATA: "multipart/form-data",
  APPLICATION_JSON: "application/json"
};

export function flat2nested(flat: KeyedObject) {
  let out: KeyedObject = {};
  for (let key in flat) {
    if (key.includes("__")) {
      const keys: string[] = key.split("__");
      const nested: KeyedObject = {};
      const parent = keys.shift();
      if (parent) {
        nested[parent] = {};
        keys.reduce((a, b, index) => {
          a[b] = {};
          if (index === keys.length - 1) {
            a[b] = flat[key];
          }
          return a;
        }, nested[parent]);
        out = { ...out, ...nested };
      }
    } else {
      out[key] = flat[key];
    }
  }
  return out;
}
