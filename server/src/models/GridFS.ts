import mongoose, { Document, Schema } from "mongoose";

const GridFSSchema = new Schema<Document>({}, { strict: false });
const GridFSChunksSchema = new Schema<Document>({}, { strict: false });

export const GridFSModel = mongoose.model(
  "GridFSModel",
  GridFSSchema,
  "fs.files"
);
export const GridFSChunkModel = mongoose.model(
  "GridFSChunkModel",
  GridFSChunksSchema,
  "fs.chunks"
);
