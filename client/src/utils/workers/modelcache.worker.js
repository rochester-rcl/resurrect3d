import { THREE_MODEL_CACHE_DB, THREE_MODEL_CACHE_INDEX, THREE_MODEL_CACHE_INDEX_ITEMS, THREE_MODEL_CACHE_GET, THREE_MODEL_CACHE_SAVE } from '../../constants/application';
import IndexedCache from '../cache/Cache'
self._cache = new IndexedCache(THREE_MODEL_CACHE_DB, {
  name: THREE_MODEL_CACHE_INDEX,
  items: THREE_MODEL_CACHE_INDEX_ITEMS
});

self._dbLoaded = false;

self._cache.open().then(() => self._dbLoaded = true);

self.get = (id: string): Promise => {
  return new Promise((resolve, reject) => {
    self._cache.get([id]).then((query) => {
      if (query.data === null) {
        resolve({ status: true, data: null });
      } else {
        resolve({ status: true, data: query.data });
      }
    });
  }).catch((error) => reject(error));
}

self.getOrCreate = (modelData: Object): Promise => {
  return new Promise((resolve, reject) => {
    self.get(modelData.id).then((result) => {
      if (result.status === true) {
        if (result.data !== null) {
          console.log("Model data already saved to cache, retrieved.");
          resolve(result.data);
        } else {
          const { id, raw } = modelData;
          self._cache.add({
            id: id,
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

self.query = (data: Object) => {
  switch(data.mode) {
    case THREE_MODEL_CACHE_SAVE:
      self.getOrCreate(data.modelData).then((result) => {
        if (result.status !== false) {
          postMessage(result);
        } else {
          console.warn("Unable to open model cache db!", result);
        }
      });
      break;

    case THREE_MODEL_CACHE_GET:
      self.get(data.modelData.id).then((result) => postMessage(result));

    default:
      break;
  }
}


self.onmessage = (event: Event) => {
  const { data } = event;
  if (self._dbLoaded === false) {
    self._cache.open().then(() => {
      self._dbLoaded = true;
      self.query(data);
    });
  } else {
    self.query(data);
  }
}
