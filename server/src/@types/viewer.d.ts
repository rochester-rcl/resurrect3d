interface IViewer {
  threeFile: string;
  enableLight: boolean;
  enableMaterials: boolean;
  enableShaders: boolean;
  enableMeasurement: boolean;
  enableAnnotations: boolean;
  enableDownload: boolean;
  enableEmbed: boolean;
  modelUnits: string;
  threeThumbnail?: string;
  displayName?: string;
  skyboxFile?: string;
  alternateMaps?: string;
}
