/* @flow */

import ThreeViewerAbstractBackend from "./ThreeViewerAbstractBackend";

// constants
import {
  FILE_ENDPOINT,
  VIEWS_ENDPOINT,
  USERS_ENDPOINT,
  LOGIN_ENDPOINT,
  LOGOUT_ENDPOINT,
  AUTHENTICATE_ENDPOINT,
  VERIFY_ENDPOINT,
  ADMIN_CONTAINER_ENDPOINT
} from "../../constants/api-endpoints";

export default class ThreeViewerAdminBackend extends ThreeViewerAbstractBackend {
  constructor(endpoint) {
    super(endpoint);
    this.getViews = this.getViews.bind(this);
    this.getView = this.getView.bind(this);
    this.getThreeFile = this.getThreeFile.bind(this);
    this.updateView = this.updateView.bind(this);
    this.addView = this.addView.bind(this);
    this.deleteView = this.deleteView.bind(this);
  }

  addUser(userInfo) {
    const body = JSON.stringify(userInfo);
    return this._post(USERS_ENDPOINT, body, {
      headers: { "Content-Type": "application/json" }
    })
      .then(result => result)
      .catch(error => console.log(error));
  }

  deleteUser(id) {
    return this._delete(USERS_ENDPOINT + id, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  verifyUser(token) {
    return this._get(VERIFY_ENDPOINT + token, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  login(userData) {
    const body = JSON.stringify(userData);
    return this._post(LOGIN_ENDPOINT, body, {
      headers: { "Content-Type": "application/json" }
    })
      .then(result => result)
      .catch(error => console.log(error));
  }

  logout() {
    return this._get(LOGOUT_ENDPOINT, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  authenticate() {
    return this._get(AUTHENTICATE_ENDPOINT, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  getViews() {
    return this._get(VIEWS_ENDPOINT, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  getView(id) {
    return this._get(VIEWS_ENDPOINT + id, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  getThreeFile(id) {
    return this._get(FILE_ENDPOINT + id, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  addView(viewData) {
    console.log(viewData);
    const fd = ThreeViewerAdminBackend.objToFormData(viewData);
    console.log(fd);
    return this._post(VIEWS_ENDPOINT, fd, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  updateView(viewData) {
    const body = ThreeViewerAdminBackend.objToFormData(viewData);
    return this._put(VIEWS_ENDPOINT + viewData._id, body, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  deleteView(id) {
    return this._delete(VIEWS_ENDPOINT + id, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  updateFile(filename, fileData) {
    return this._put(FILE_ENDPOINT + filename, fileData, {})
      .then(result => result)
      .catch(error => console.log(error));
  }
}
