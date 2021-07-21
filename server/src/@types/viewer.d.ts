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
  viewerSettings?: IViewerSettings | null;
  [key: string]:
    | IViewerSettings
    | string
    | boolean
    | string[]
    | null
    | undefined;
}

// Can refine this type further once we settle on all settings
interface IViewerSettings {
  [key: string]: any;
}

interface IViewerRequestData
  extends Omit<IViewer, "alternateMaps, viewerSettings"> {
  alternateMaps: string | null; // serialized json array
  viewerSettings: string | null; // serialized json object
}
