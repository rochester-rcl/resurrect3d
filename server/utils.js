function flat2nested(flat) {
  let out = {};
  for (let key in flat) {
    if (key.includes('__')) {
      const keys = key.split('__');
      const nested = {};
      const parent = keys.shift();
      nested[parent] = {};
      keys.reduce((a, b, index) => {
        a[b] = {};
        if (index === keys.length-1) {
          a[b] = flat[key];
        }
        return a;
      }, nested[parent]);
      out = {...out, ...nested}
    } else {
      out[key] = flat[key];
    }
  }
  return out;
}

const APP_CONSTANTS = {
  MULTIPART_FORMDATA: 'multipart/form-data',
  APPLICATION_JSON: 'application/json'
}

module.exports = {
  flat2nested: flat2nested,
  APP_CONSTANTS: APP_CONSTANTS,
}
