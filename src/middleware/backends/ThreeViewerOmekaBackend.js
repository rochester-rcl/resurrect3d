// Abstract backend class
import ThreeViewerAbstractBackend from './ThreeViewerAbstractBackend';

import lodash from 'lodash';

export default class ThreeViewerOmekaBackend extends ThreeViewerAbstractBackend {
  authenticate(): Promise {
    return new Promise((resolve, reject) => {
      let apiKey = localStorage.getItem('omekaApiKey');
      if (apiKey) {
        resolve(apiKey);
      } else {
        reject(apiKey);
      }
    });
  }

  getThreeAsset(url: string, params: Object): Promise {
    let camelize = ThreeViewerOmekaBackend.camelize;
    return super.getThreeAsset(url, params).then((result) => {
        let normalized = {};
        Object.keys(result).forEach((key) => {
          normalized[lodash.camelCase(key)] = result[key];
        });
        return normalized;
      })
      .catch((error) => console.log(error));
  }

  getMetadata(url: string, params) {
    return this._get(url, params).then((result) => {
      return ThreeViewerOmekaBackend.parseMetadata(result.element_texts);
    }).catch((error) => console.log(error));
  }

  // need to parse a cleaner key-value representation of the item metadata
  static parseMetadata(elementTexts: Array < Object > ): Object {
    return elementTexts.map((element) => {
      return {
        label: element.element.name,
        value: element.text
      }
    });
  }
}
