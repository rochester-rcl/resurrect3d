/* @flow */
import loadOBJExporter from './exporters/OBJExporter';

export default function loadExporters(threeInstance: Object): Object {
  const exporters = [
    loadOBJExporter(threeInstance),
  ];
  return Promise.all(exporters).then(() => threeInstance);
}
