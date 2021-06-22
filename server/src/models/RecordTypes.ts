import { Model } from "mongoose";
import { IAnnotationDocument } from "./Annotation";
import { IUserDocument } from "./User";
import { IViewerDocument } from "./Viewer";

export type ResurrectDocument =
  | IAnnotationDocument
  | IUserDocument
  | IViewerDocument;

export type ResurrectModel<T extends ResurrectDocument> = Model<T>;

export type ResurrectInterface = IAnnotation | IUser | IViewer;
