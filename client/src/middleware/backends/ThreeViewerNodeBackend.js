/* @flow */
// Abstract Base class
import ThreeViewerAbstractBackend from "./ThreeViewerAbstractBackend";

// React
import React from "react";

// API constants
import {
  VIEWS_ENDPOINT,
  FILE_ENDPOINT,
  AUTHENTICATE_ENDPOINT,
  ANNOTATIONS_ENDPOINT
} from "../../constants/api-endpoints";

// Admin backend
import ThreeViewerAdminBackend from "./ThreeViewerAdminBackend";

// serialization
import { serializeThreeTypes } from "../../utils/serialization";

export default class ThreeViewerNodeBackend extends ThreeViewerAbstractBackend {
  constructor(options: Object) {
    super(options);
    this.adminBackend = new ThreeViewerAdminBackend();
    this.hasAdminBackend = true;
  }

  authenticate(): Promise {
    return this._get(AUTHENTICATE_ENDPOINT, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  getThreeAsset(id: string): Promise {
    return new Promise((resolve, reject) => {
      this._get(VIEWS_ENDPOINT + id, {})
        .then(result => result)
        .catch(error => console.log(error))
        .then(asset => {
          const formatted = this.formatAsset(asset);
          resolve(formatted);
        });
    });
  }

  getThreeFile(id: string): Promise {
    return this._getBinary(FILE_ENDPOINT + id, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  getThreeFileURL(id: string): Promise {
    return new Promise((resolve, reject) => resolve(FILE_ENDPOINT + id));
  }

  formatAsset(asset: Object): Object {
    // replace 'null' with null
    const format = _asset => {
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
    };
    return format(asset);
  }

  // settings
  saveViewerSettings(id: Number, settings: Object): Promise {
    const body = JSON.stringify({
      viewerSettings: serializeThreeTypes(settings)
    });
    return this._put(VIEWS_ENDPOINT + id, body, {
      headers: { "Content-Type": "application/json" }
    })
      .then(result => result)
      .catch(error => console.error(error));
  }

  // annotations
  getAnnotations(threeViewerId) {
    return this._get(ANNOTATIONS_ENDPOINT + threeViewerId, {})
      .then(result => result)
      .catch(error => console.error(error));
  }

  saveAnnotation(annotation, threeViewId) {
    annotation.threeViewId = threeViewId;
    const body = JSON.stringify(serializeThreeTypes(annotation));
    return this._post(ANNOTATIONS_ENDPOINT, body, {
      headers: { "Content-Type": "application/json" }
    })
      .then(result => result)
      .catch(error => console.error(error));
  }

  updateAnnotation(annotation, threeViewId) {
    const body = JSON.stringify(serializeThreeTypes(annotation));
    return this._put(ANNOTATIONS_ENDPOINT, body, {
      headers: { "Content-Type": "application/json" }
    })
      .then(result => result)
      .catch(error => console.error(error));
  }

  deleteAnnotation(id, threeViewId) {
    const body = JSON.stringify({ id: id });
    return this._post(ANNOTATIONS_ENDPOINT + threeViewId, body, {
      headers: { "Content-Type": "application/json" }
    })
      .then(result => result)
      .catch(error => console.error(error));
  }
}
