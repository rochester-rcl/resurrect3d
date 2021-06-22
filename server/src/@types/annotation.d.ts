type AnnotationSaveStatus = "SAVED" | "UNSAVED" | "UPDATED";

interface IAnnotation {
  threeViewId: number;
  title: string;
  point: string; // serialized Vector3
  normal: string; // serialized Vector3
  settings: IAnnotationSettings;
  pinColor: number; // hex literal
  saveStatus: AnnotationSaveStatus;
  text?: string;
  index?: number;
}

interface IAnnotationSettings {
  [key: string]: any;
}
