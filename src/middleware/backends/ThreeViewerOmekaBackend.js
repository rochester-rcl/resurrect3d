// Abstract backend class
import ThreeViewerAbstractBackend from './ThreeViewerAbstractBackend';

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
}
