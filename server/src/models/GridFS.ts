import mongoose, { Document, Schema } from "mongoose";

export type GridFSFileDocument = Document;
export type GridFSChunkDocument = Document;

const GridFSFileSchema = new Schema<GridFSFileDocument>({}, { strict: false });
const GridFSChunksSchema = new Schema<GridFSChunkDocument>(
  {},
  { strict: false }
);

export const GridFSFileModel = mongoose.model<GridFSFileDocument>(
  "GridFSFileModel",
  GridFSFileSchema,
  "fs.files"
);
export const GridFSChunkModel = mongoose.model<GridFSChunkDocument>(
  "GridFSChunkModel",
  GridFSChunksSchema,
  "fs.chunks"
);
