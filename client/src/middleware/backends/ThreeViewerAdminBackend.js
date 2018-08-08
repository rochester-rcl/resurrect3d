/* @flow */

import ThreeViewerAbstractBackend from './ThreeViewerAbstractBackend';

// constants
import { FILE_ENDPOINT, VIEWS_ENDPOINT } from '../../constants/api-endpoints';

export default class ThreeViewerAdminBackend extends ThreeViewerAbstractBackend {

  constructor(endpoint: string) {
    super(endpoint);
    (this: any).getViews = this.getViews.bind(this);
    (this: any).getView = this.getView.bind(this);
    (this: any).getThreeFile = this.getThreeFile.bind(this);
    // (this: any).updateView = this.updateView.bind(this);
    (this: any).addView = this.addView.bind(this);
    (this: any).deleteView = this.deleteView.bind(this);
  }

  getViews(): Promise {
    return this._get(VIEWS_ENDPOINT, {}).then((result) => result).catch((error) => console.log(error));
  }

  getView(id: number): Promise {
    return this._get(VIEWS_ENDPOINT + id, {}).then((result) => result).catch((error) => console.log(error));
  }

  getThreeFile(id: number): Promise {
    return this._post(FILE_ENDPOINT + 'id', {}).then((result) => result).catch((error) => console.log(error));
  }

  // TODO add _puts or update to abstract class

  addView(viewData: Object): Promise {
    const fd = new FormData();
    for (let key in viewData) {
      fd.append(key, viewData[key]);
    }
    return this._post(VIEWS_ENDPOINT, fd, {}).then((result) => result).catch((error) => console.log(error));
  }

  deleteView(id: number): Promise {
    return this._post(VIEWS_ENDPOINT + 'id', {}).then((result) => result).catch((error) => console.log(error));
  }

}
