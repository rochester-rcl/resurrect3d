const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const saveStatus = { SAVED: "SAVED", UPDATED: "UPDATED", UNSAVED: "UNSAVED" };
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
  },
  index: {
    type: Number,
    required: false
  },
  saveStatus: {
    type: String,
    enum: Object.values(saveStatus),
    default: "UNSAVED",
    required: true
  }
});

annotationSchema.methods.refresh = function(callback) {
  this.model("annotation").findOne({ _id: this._id }, callback);
};

annotationSchema.methods.updateSaveStatus = function(status, callback) {
  this.update({ saveStatus: status }, (error, updated) => {
    if (error) throw error;
    this.refresh(callback);
  });
};

module.exports = {
  model: mongoose.model("annotation", annotationSchema),
  SAVE_STATUS: saveStatus
};
