// Abstract backend class
import ThreeViewerAbstractBackend from './ThreeViewerAbstractBackend';
import React from 'react';

import lodash from 'lodash';

import { Markup } from 'interweave';

// API endpoints
import { OMEKA_API_ENDPOINT } from '../../constants/api-endpoints';

// constants
import { JSON_EXT, GZIP_EXT } from '../../constants/application';

// utils
import { getExtension } from '../../utils/mesh';

export default class ThreeViewerOmekaBackend extends ThreeViewerAbstractBackend {

  constructor(options: Object) {
    super(options);
    this.hasAdminBackend = false;
    this.isOmekaBackend = true;
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
    return super.getThreeAsset(OMEKA_API_ENDPOINT + assetId, params).then((result) => {
        let normalized = {};
        Object.keys(result).forEach((key) => {
          if (key === 'model_units') {
            normalized[lodash.camelCase(key)] = result[key].toUpperCase();
          }
          normalized[lodash.camelCase(key)] = result[key];
        });
        console.log(normalized);
        return normalized;
      })
      .catch((error) => console.log(error));
  }

  getThreeFile(path: string): Promise {
    const ext = getExtension(path);
    if (ext === GZIP_EXT) {
      return this._getBinary(path, {}).then((result) => result).catch((error) => console.log(error));
    } else {
      return this._get(path, {}).then((result) => result).catch((error) => console.log(error));
    }
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
