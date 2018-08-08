var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var viewSchema = new Schema({

  threeFile:{
    type: String,
    required: true
  },

  threeThumbnail:{
    type: String,
    required: false
  },

  skybox:{
    file:{
      type: String,
      required: false
    }
  },

  enableLight:{
    type: Boolean,
    required: true
  },

  enableMaterials:{
    type: Boolean,
    required: true
  },

  enableShaders:{
    type: Boolean,
    required: true
  },

  enableMeasurement:{
    type: Boolean,
    required: true
  },

  modelUnits:{
    type: String,
    required: true
  }
});

module.exports = mongoose.model('view', viewSchema);
