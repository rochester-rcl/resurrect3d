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
  constructor(endpoint: string) {
    super(endpoint);
    (this: any).getViews = this.getViews.bind(this);
    (this: any).getView = this.getView.bind(this);
    (this: any).getThreeFile = this.getThreeFile.bind(this);
    (this: any).updateView = this.updateView.bind(this);
    (this: any).addView = this.addView.bind(this);
    (this: any).deleteView = this.deleteView.bind(this);
  }

  addUser(userInfo: Object): Promise {
    const body = JSON.stringify(userInfo);
    return this._post(USERS_ENDPOINT, body, {
      headers: { "Content-Type": "application/json" }
    })
      .then(result => result)
      .catch(error => console.log(error));
  }

  deleteUser(id: Number): Promise {
    return this._delete(USERS_ENDPOINT + id, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  verifyUser(token: string): Promise {
    return this._get(VERIFY_ENDPOINT + token, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  login(userData: Object): Promise {
    const body = JSON.stringify(userData);
    return this._post(LOGIN_ENDPOINT, body, {
      headers: { "Content-Type": "application/json" }
    })
      .then(result => result)
      .catch(error => console.log(error));
  }

  logout(): Promise {
    return this._get(LOGOUT_ENDPOINT, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  authenticate(): Promise {
    return this._get(AUTHENTICATE_ENDPOINT, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  getViews(): Promise {
    return this._get(VIEWS_ENDPOINT, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  getView(id: number): Promise {
    return this._get(VIEWS_ENDPOINT + id, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  getThreeFile(id: number): Promise {
    return this._get(FILE_ENDPOINT + id, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  addView(viewData: Object): Promise {
    console.log(viewData);
    const fd = ThreeViewerAdminBackend.objToFormData(viewData);
    console.log(fd);
    return this._post(VIEWS_ENDPOINT, fd, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  updateView(viewData: Object): Promise {
    const body = ThreeViewerAdminBackend.objToFormData(viewData);
    return this._put(VIEWS_ENDPOINT + viewData._id, body, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  deleteView(id: number): Promise {
    return this._delete(VIEWS_ENDPOINT + id, {})
      .then(result => result)
      .catch(error => console.log(error));
  }

  updateFile(filename: string, fileData: File): Promise {
    return this._put(FILE_ENDPOINT + filename, fileData, {})
      .then(result => result)
      .catch(error => console.log(error));
  }
}
