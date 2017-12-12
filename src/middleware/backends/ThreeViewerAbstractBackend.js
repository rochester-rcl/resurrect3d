export default class ThreeViewerBackendAbstract {
  /* So we need a few things here -
   * 1) a URL to a three.js formatted mesh
   * 2) a URL to an equirectangular image for the skybox
   * 3) some authentication in order to get 1 and 2
   */

  constructor(endpoint: string) {
    // The basename for the API we're going to be using
    this.endpoint = endpoint;
  }
  // Although right now authenticate is the same as postThreeAsset, it's likely the method that is going to be overwritten
  authenticate(url: string, body: Object, params, callback: (response: Object) => void): Promise {
    /* csrf token / cookie / set api key to browser storage etc
     * return true if authenticated, return false if not - should use a try catch
     */
    return this._post(url, body, params).then((result) => callback(result));
  }

  _post(url: string, body: Object, params: Object): Promise {
    return new Promise((resolve, reject) => {
      try {
        fetch(url, { ...{
            method: 'POST',
            body: body
          },
          ...params
        }).then((response) =>
          response.json()
          .then((json) =>
            resolve(json)
          )
        ).catch((error) => console.error(error));
      } catch (error) {
        reject(error);
      }
    });
  }

  _get(url: string, params: Object): Promise {
    return new Promise((resolve, reject) => {
      try {
        fetch(url, params).then((response) => {
          response.json()
          .then((json) =>
            resolve(json)
          )
        }).catch((error) => console.error(error));
      } catch (error) {
        reject(error);
      }
    });
  }

  /* Use this to get the mesh or the skybox or whatever - callback should
   * be a function that passes the URL to the asset to an appropriate loader
   */

  getThreeAsset(url: string, params: Object): Promise {
    // returns a url to the skybox image
    return this._get(url, params).then((result) => result).catch((error) => console.log(error));
  }

  postThreeAsset(url: string, body: Object, params: Object): Promise {
    return this._post(url, body, params).then((result) => result).catch((error) => console.error(error));
  }

}