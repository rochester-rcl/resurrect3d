import 'babel-polyfill';
import { THREE_MODEL_CACHE_DB, THREE_MODEL_CACHE_INDEX, THREE_MODEL_CACHE_INDEX_ITEMS, THREE_MODEL_CACHE_GET, THREE_MODEL_CACHE_SAVE } from '../../constants/application';
import IndexedCache from '../cache/Cache'
self._cache = new IndexedCache(THREE_MODEL_CACHE_DB, {  // eslint-disable-line no-restricted-globals
  name: THREE_MODEL_CACHE_INDEX,
  items: THREE_MODEL_CACHE_INDEX_ITEMS
});

self._dbLoaded = false;  // eslint-disable-line no-restricted-globals

self._cache.open().then(() => self._dbLoaded = true);  // eslint-disable-line no-restricted-globals

self.get = (id: string, fileId: string): Promise => {  // eslint-disable-line no-restricted-globals
  return new Promise((resolve, reject) => {
    self._cache.get([id]).then((query) => {  // eslint-disable-line no-restricted-globals
      if (query.data === null) {
        resolve({ status: true, data: null });
      } else {
        if (query.data.fileId !== fileId) {
          resolve({ status: true, data: null});
        }
        resolve({ status: true, data: query.data });
      }
    }).catch((error) => reject(error));
  });
}

self.getOrCreate = (modelData: Object): Promise => {  // eslint-disable-line no-restricted-globals
  return new Promise((resolve, reject) => {
    self.get(modelData.id).then((result) => {  // eslint-disable-line no-restricted-globals
      if (result.status === true) {
        if (result.data !== null) {
          resolve(result.data);
        } else {
          const { id, raw, fileId } = modelData;
          self._cache.add({  // eslint-disable-line no-restricted-globals
            id: id,
            fileId: fileId,
            model: {
              raw: raw,
            }
          }).then((query) => resolve({ status: true, ...query.data}));
        }
      } else {
        reject(result);
      }
    }).catch((error) => reject(error));
  });
}

self.query = (data: Object) => {  // eslint-disable-line no-restricted-globals
  switch(data.mode) {
    case THREE_MODEL_CACHE_SAVE:
      self.getOrCreate(data.modelData).then((result) => {  // eslint-disable-line no-restricted-globals
        if (result.status !== false) {
          postMessage(result);
        } else {
          console.warn("Unable to open model cache db!", result);
        }
      });
      break;

    case THREE_MODEL_CACHE_GET:
      self.get(data.modelData.id, data.modelData.fileId).then((result) => postMessage(result));  // eslint-disable-line no-restricted-globals
      break;
      
    default:
      break;
  }
}


self.onmessage = (event: Event) => {  // eslint-disable-line no-restricted-globals
  const { data } = event;
  if (self._dbLoaded === false) {  // eslint-disable-line no-restricted-globals
    self._cache.open().then(() => {  // eslint-disable-line no-restricted-globals
      self._dbLoaded = true;  // eslint-disable-line no-restricted-globals
      self.query(data);  // eslint-disable-line no-restricted-globals
    });
  } else {
    self.query(data);  // eslint-disable-line no-restricted-globals
  }
}
