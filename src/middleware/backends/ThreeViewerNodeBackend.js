import ThreeViewerAbstractBackend from './ThreeViewerAbstractBackend';
import React from 'react';
import { VIEWS_ENDPOINT, FILE_ENDPOINT } from '../../constants/api-endpoints';
export default class ThreeViewerNodeBackend extends ThreeViewerAbstractBackend {
  authenticate(url: string, username: string, password: string, callback: (response: Object) => void): Promise {
    /* csrf token / cookie / set api key to browser storage etc
     * return true if authenticated, return false if not - should use a try catch
     */
    const body = {
      username: username,
      password: password,
      token: null // will use Cookies.get()
    }
    const params = {}
    return this._post(url, body, params).then((result) => callback(result));
  }

  getThreeAsset(id: string): Promise {
    return new Promise((resolve, reject) => {
      this._get(VIEWS_ENDPOINT + id, {}).then((result) => result).catch((error) => console.log(error))
        .then((asset) => {
          const formatted = this.formatAsset(asset);
          resolve(formatted);
        });
    });
  }

  getThreeFile(id: string): Promise {
    return this._getBinary(FILE_ENDPOINT + id, {}).then((result) => result).catch((error) => console.log(error));
  }

  formatAsset(asset: Object): Object {
    // replace 'null' with null
    const format = (_asset) => {
      const formatted = {};
      for (let key in _asset) {
        if (_asset[key] !== null && _asset[key].constructor === Object) {
          formatted[key] = format(_asset[key]);
        } else {
          if (_asset[key] === "null") {
            _asset[key] = null;
          }
          formatted[key] = _asset[key];
        }
      }
      return formatted;
    }
    return format(asset);
  }
}
