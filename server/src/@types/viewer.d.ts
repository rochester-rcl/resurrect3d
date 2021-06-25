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
  threeThumbnail: string | null;
  displayName?: string;
  skyboxFile: string | null;
  alternateMaps: string[] | null;
  [key: string]: string | boolean | string[] | null | undefined;
}
