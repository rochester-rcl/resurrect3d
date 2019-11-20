const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const annotationSchema = new Schema({
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
  settings: {
    type: Object,
    required: true
  }
});

module.exports = mongoose.model("annotation", annotationSchema);
