// Abstract backend class
import ThreeViewerAbstractBackend from './ThreeViewerAbstractBackend';
import React from 'react';

import lodash from 'lodash';

import { Markup } from 'interweave';

// API endpoints
import { OMEKA_API_ENDPOINT } from '../../constants/api-endpoints';

export default class ThreeViewerOmekaBackend extends ThreeViewerAbstractBackend {
  constructor(options: Object) {
    super(options);
    this.hasAdminBackend = false;
  }
  authenticate(): Promise {
    return new Promise((resolve, reject) => {
      const apiKey = localStorage.getItem('omekaApiKey');
      const status = {};
      status.authenticated = (apiKey !== null) ? true : false;
      resolve(status);
    });
  }

  getThreeAsset(assetId: string | Number, params: Object): Promise {
    const camelize = ThreeViewerOmekaBackend.camelize;
    return super.getThreeAsset(OMEKA_API_ENDPOINT + assetId, params).then((result) => {
        console.log(result);
        let normalized = {};
        Object.keys(result).forEach((key) => {
          normalized[lodash.camelCase(key)] = result[key];
        });
        return normalized;
      })
      .catch((error) => console.log(error));
  }

  getThreeFile(id: string): Promise {
    console.log(id);
    return
    //return this._getBinary(FILE_ENDPOINT + id, {}).then((result) => result).catch((error) => console.log(error));
  }

  getMetadata(url: string, params: Object) {
    return this._get(url, params).then((result) => {
      return ThreeViewerOmekaBackend.parseMetadata(result.element_texts);
    }).catch((error) => console.log(error));
  }

  // need to parse a cleaner key-value representation of the item metadata
  static parseMetadata(elementTexts: Array < Object > ): Object {
    return elementTexts.map((element) => {
      return {
        label: element.element.name,
        value: <Markup content={element.text} />
      }
    });
  }
}
