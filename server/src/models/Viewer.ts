import mongoose, { Schema, Document } from "mongoose";

export interface IViewerDocument extends Document, IViewer {}

export const ViewerSchema = new Schema<IViewer>({
  displayName: {
    type: String,
    required: false
  },

  threeFile: {
    type: String,
    required: true
  },

  threeThumbnail: {
    type: String,
    required: false
  },

  skyboxFile: {
    type: String,
    required: false
  },

  alternateMaps: [
    {
      type: String,
      required: false
    }
  ],

  enableLight: {
    type: Boolean,
    required: true,
    default: false
  },

  enableMaterials: {
    type: Boolean,
    required: true,
    default: false
  },

  enableShaders: {
    type: Boolean,
    required: true,
    default: false
  },

  enableMeasurement: {
    type: Boolean,
    required: true,
    default: false
  },

  enableAnnotations: {
    type: Boolean,
    required: true,
    default: false
  },

  enableDownload: {
    type: Boolean,
    required: true,
    default: false
  },

  enableEmbed: {
    type: Boolean,
    required: true,
    default: false
  },

  modelUnits: {
    type: String,
    required: true
  },

  viewerSettings: {
    type: Object,
    required: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  externalMapInfo: {
    type: [Object],
    required: false
  },
  allowedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

const ViewerModel = mongoose.model<IViewer>("view", ViewerSchema);
export default ViewerModel;
