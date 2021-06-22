import mongoose, { Document, Schema } from "mongoose";

export interface IAnnotationDocument extends Document, IAnnotation {}

export const SaveStatus = {
  SAVED: "SAVED",
  UPDATED: "UPDATED",
  UNSAVED: "UNSAVED"
};

export const AnnotationSchema = new Schema<IAnnotation>({
  threeViewId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: false
  },
  point: {
    type: String, // serialized Vector3
    required: true
  },
  normal: {
    type: String, // serialized Vector3
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: false
  },
  pinColor: {
    type: Number,
    default: 0x21ba45
  },
  saveStatus: {
    type: String,
    enum: Object.values(SaveStatus),
    default: "UNSAVED",
    required: true
  }
});

AnnotationSchema.methods.updateSaveStatus = function (
  status
): Promise<IAnnotationDocument> {
  this.saveStatus = status;
  return this.save();
};

const AnnotationModel = mongoose.model<IAnnotationDocument>(
  "annotation",
  AnnotationSchema
);
export default AnnotationModel;
