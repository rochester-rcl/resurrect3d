import pako from "pako";
// workers
import InflateWorker from "../../utils/workers/inflate.worker";
import ModelCacheWorker from "../../utils/workers/modelcache.worker";
// constants
import {
  THREE_MODEL_CACHE_GET,
  THREE_MODEL_CACHE_SAVE,
  WORKER_DATA,
  WORKER_PROGRESS
} from "../../constants/application";

// TODO - Refactoring - Remove Promise constructor anti-pattern (i.e. return new Promise((resolve, reject) => {}))

const GZIP_CHUNK_SIZE = 512 * 1024;
export default class ThreeViewerAbstractBackend {
  /* So we need a few things here -
   * 1) a URL to a three.js formatted mesh
   * 2) a URL to an equirectangular image for the skybox
   * 3) some authentication in order to get 1 and 2
   */

  _post(url: string, body: Object | FormData, params: Object): Promise {
    return new Promise((resolve, reject) => {
      fetch(url, {
        ...{
          method: "POST",
          credentials: "include",
          body: body
        },
        ...params
      })
        .then(response => {
          if (response.ok === true) {
            return response.json().then(json => resolve(json));
          } else {
            resolve({ error: true });
          }
        })
        .catch(error => reject(error));
    });
  }

  _put(url: string, body: Object, params: Object): Promise {
    return new Promise((resolve, reject) => {
      fetch(url, {
        ...{
          method: "PUT",
          credentials: "include",
          body: body
        },
        ...params
      })
        .then(response => {
          return response.json().then(json => {
            resolve(json);
          });
        })
        .catch(error => reject(error));
    });
  }

  _get(url: string, params: Object): Promise {
    return new Promise((resolve, reject) => {
      fetch(url, { method: "GET", credentials: "include" }, params)
        .then(response => {
          return response.json().then(json => {
            resolve(json);
          });
        })
        .catch(error => reject(error));
    });
  }

  _getBinary(url: string, params: Object): Promise {
    return new Promise((resolve, reject) => {
      fetch(url, params)
        .then(response => {
          response
            .blob()
            .then(blob => URL.createObjectURL(blob))
            .then(url => resolve(url));
        })
        .catch(error => reject(error));
    });
  }

  _delete(url: string, params: Object): Promise {
    return new Promise((resolve, reject) => {
      fetch(url, {
        ...{
          method: "DELETE",
          credentials: "include"
        },
        ...params
      })
        .then(response => {
          return response.json().then(json => {
            resolve(json);
          });
        })
        .catch(error => reject(error));
    });
  }

  /* Use this to get the mesh or the skybox or whatever - callback should
   * be a function that passes the URL to the asset to an appropriate loader
   */

  getThreeAsset(url: string, params: Object): Promise {
    // returns a url to the skybox image
    return this._get(url, params)
      .then(result => result)
      .catch(error => console.log(error));
  }

  postThreeAsset(url: string, body: Object, params: Object): Promise {
    return this._post(url, body, params)
      .then(result => result)
      .catch(error => console.error(error));
  }

  static fetchGZippedAsset(id: string, url: string, fileId: string): Promise {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          return response.blob().then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
              // should be Uint8Array
              const res = reader.result;
              // save raw data to cache
              ThreeViewerAbstractBackend.saveToCache(id, res, fileId)
                .then(res =>
                  ThreeViewerAbstractBackend.gunzipAsset(res.model.raw)
                    .then(dataURL => resolve(dataURL))
                    .catch(error => reject(error))
                )
                .catch(error => reject(error));
            };
            reader.readAsArrayBuffer(blob);
          });
        })
        .catch(error => reject(error));
    });
  }

  static fetchGZippedAssetSaga(
    id: string,
    url: string,
    fileId: string,
    channel: EventChannel,
    saveToCache = true
  ): Promise {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          return response.blob().then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
              // should be Uint8Array
              const res = reader.result;
              // save raw data to cache
              if (saveToCache) {
                ThreeViewerAbstractBackend.saveToCache(id, res, fileId)
                  .then(res =>
                    resolve(
                      ThreeViewerAbstractBackend.gunzipAssetSaga(
                        res.model.raw,
                        channel
                      )
                    )
                  )
                  .catch(error => reject(error));
              } else {
                resolve(
                  ThreeViewerAbstractBackend.gunzipAssetSaga(
                    res,
                    channel
                  )
                );
              }
            };
            reader.readAsArrayBuffer(blob);
          });
        })
        .catch(error => reject(error));
    });
  }

  static fetchJSONAssetSaga(
    id: string,
    url: string,
    fileId: string,
    saveToCache = true
  ): Promise {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          return response
            .json()
            .then(json => {
              // save raw data to cache
              if (saveToCache) {
                ThreeViewerAbstractBackend.saveToCache(id, json, fileId)
                  .then(res => resolve(res.model.raw))
                  .catch(error => reject(error));
              } else {
                resolve(json);
              }
            })
            .catch(error => reject(error));
        })
        .catch(error => reject(error));
    });
  }

  static gunzipAsset(buf: ArrayBuffer): Promise {
    return new Promise((resolve, reject) => {
      const inflateWorker = new InflateWorker();
      inflateWorker.postMessage(buf, [buf]);
      inflateWorker.onmessage = (event: Event) => {
        const { data } = event;
        resolve(data);
      };
    });
  }

  // takes saga event channel for progress
  static gunzipAssetSaga(buf: ArrayBuffer, channel: EventChannel): Promise {
    return new Promise((resolve, reject) => {
      const inflateWorker = new InflateWorker();
      inflateWorker.postMessage(buf, [buf]);
      resolve(channel(inflateWorker, "mesh"));
    });
  }

  static serialize(obj: Object): string {
    const serialized = JSON.stringify(obj);
    return serialized;
  }

  static objToFormData(obj: Object): FormData {
    const fd = new FormData();
    const formatFormData = (obj: Object, rootKey: undefined | string) => {
      for (let key in obj) {
        let newKey = rootKey !== undefined ? rootKey + "__" + key : key;
        if (obj[key] !== null && obj[key].constructor === Object) {
          formatFormData(obj[key], newKey);
        } else {
          fd.append(newKey, obj[key]);
        }
      }
    };
    formatFormData(obj);
    return fd;
  }

  static checkCache(id: string, fileId: string): Promise {
    return new Promise((resolve, reject) => {
      const cacheWorker = new ModelCacheWorker();
      cacheWorker.postMessage({
        modelData: { id: id, fileId: fileId },
        mode: THREE_MODEL_CACHE_GET
      });
      cacheWorker.onmessage = (event: Event) => {
        const { data } = event;
        if (
          data.status === false ||
          (data.status === true && data.data === null)
        )
          resolve(false);
        resolve(data);
      };
    });
  }

  static saveToCache(id: string, buf: ArrayBuffer, fileId: string): Promise {
    return new Promise((resolve, reject) => {
      const cacheWorker = new ModelCacheWorker();
      const data = {
        modelData: { id: id, raw: buf, fileId: fileId },
        mode: THREE_MODEL_CACHE_SAVE
      };
      cacheWorker.postMessage(data);
      cacheWorker.onmessage = (event: Event) => {
        const { data } = event;
        if (
          data.status === false ||
          (data.status === true && data.data === null)
        )
          resolve(false);
        resolve(data);
      };
    });
  }
}
