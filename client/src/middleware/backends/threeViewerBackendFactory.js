/* @flow */
// constants
import { BUILD_ENV, BUILD_ENV_NODE, BUILD_ENV_OMEKA } from '../../constants/application';
import ThreeViewerNodeBackend from './ThreeViewerNodeBackend';
import ThreeViewerOmekaBackend from './ThreeViewerOmekaBackend';

export default function threeViewerBackendFactory() {

  switch(BUILD_ENV) {
    case BUILD_ENV_NODE:
      return new ThreeViewerNodeBackend();

    case BUILD_ENV_OMEKA:
      return new ThreeViewerOmekaBackend();

    default:
      return new ThreeViewerNodeBackend();
  }
  
}
