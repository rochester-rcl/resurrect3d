// Abstract backend class
import ThreeViewerAbstractBackend from "./ThreeViewerAbstractBackend";
import React from "react";

import lodash from "lodash";

import { Markup } from "interweave";

// API endpoints
import { OMEKA_API_ENDPOINT } from "../../constants/api-endpoints";

// constants
import { JSON_EXT, GZIP_EXT } from "../../constants/application";

// utils
import { getExtension } from "../../utils/mesh";

// serialization
import { serializeThreeTypes } from "../../utils/serialization";

export default class ThreeViewerOmekaBackend extends ThreeViewerAbstractBackend {
  constructor(options: Object) {
    super(options);
    this.hasAdminBackend = false;
    this.isOmekaBackend = true;
  }

  authenticate(): Promise {
    return new Promise((resolve, reject) => {
      const apiKey = localStorage.getItem("omekaApiKey");
      const status = {};
      status.authenticated = apiKey !== null ? true : false;
      resolve(status);
    });
  }

  static formatOmekaResponse(response: Object): Object {
    return new Promise((resolve, reject) => {
      try {
        const normalized = {};
        Object.keys(response).forEach(key => {
          if (key === "model_units") {
            normalized[lodash.camelCase(key)] = response[key].toUpperCase();
          }
          normalized[lodash.camelCase(key)] = response[key];
        });
        resolve(normalized);
      } catch (error) {
        reject(error);
      }
    });
  }

  getThreeAsset(assetId: string | Number, params: Object): Promise {
    return super
      .getThreeAsset(OMEKA_API_ENDPOINT + assetId, params)
      .then(ThreeViewerOmekaBackend.formatOmekaResponse)
      .catch(error => console.log(error));
  }

  getThreeFile(path: string): Promise {
    const ext = getExtension(path);
    if (ext === GZIP_EXT) {
      return this._getBinary(path, {})
        .then(result => result)
        .catch(error => console.log(error));
    } else {
      return this._get(path, {})
        .then(result => result)
        .catch(error => console.log(error));
    }
  }

  // Incredibly stupid but allows for polymorphism between the different backends
  getThreeFileURL(path: string): Promise {
    return new Promise((resolve, reject) => resolve(path));
  }

  getMetadata(url: string, params: Object) {
    return this._get(url, params)
      .then(result => {
        return ThreeViewerOmekaBackend.parseMetadata(result.element_texts);
      })
      .catch(error => console.log(error));
  }

  // need to parse a cleaner key-value representation of the item metadata
  static parseMetadata(elementTexts: Array<Object>): Object {
    return elementTexts.map(element => {
      return {
        label: element.element.name,
        value: <Markup content={element.text} />
      };
    });
  }

  // settings
  saveViewerSettings(id: Number, settings: Object): Promise {
    const body = JSON.stringify({
      viewer_settings: serializeThreeTypes(settings)
    });

    const apiKey = "?key=" + localStorage.getItem("omekaApiKey");

    return this._put(OMEKA_API_ENDPOINT + id + apiKey, body, {
      headers: { "Content-Type": "application/json" }
    })
      .then(ThreeViewerOmekaBackend.formatOmekaResponse)
      .catch(error => console.log(error));
  }
}
