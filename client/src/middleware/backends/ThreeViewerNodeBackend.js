import ThreeViewerAbstractBackend from './ThreeViewerAbstractBackend';
import React from 'react';

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
}
