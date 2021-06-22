const mongoose = require("mongoose");

const gridFSSchema = new mongoose.Schema({}, { strict: false });
const gridFSChunksSchema = new mongoose.Schema({}, { strict: false });
module.exports = {
  GridFSModel: mongoose.model("GridFSModel", gridFSSchema, "fs.files"),
  GridFSChunkModel: mongoose.model(
    "GridFSChunkModel",
    gridFSChunksSchema,
    "fs.chunks"
  )
};
