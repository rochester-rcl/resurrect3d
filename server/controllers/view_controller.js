const mongoose = require('mongoose');
const View = mongoose.model('view');
const upload = require('../server');
console.log(upload);
exports.landing = (req, res, upload) => {
  var info = 'Please use "/views" to create or list all data. & Please use "/views/:someID" to read, update, or delete';
  console.log(upload);
  //console.log("req", req);
  //console.log("res", res);
  //res.send(info);
};

exports.getViews = (req, res) => {
  View.find({},
    (err, view) => {
      if(err)
        res.send(err);
      res.json(view);
      console.log('View(s) successfully read');
  });
};

exports.addView = (req, res) => {
  const { threeFile, threeThumbnail, skybox } = req.files;
  const newView = new View({
    threeFile: (threeFile !== undefined) ? threeFile[0].filename : null,
    threeThumbnail: (threeThumbnail !== undefined) ? threeThumbnail[0].filename : null,
    skybox: {file: (skybox !== undefined) ? skybox[0].filename : null },
    enableLight: req.body.enableLight,
    enableMaterials: req.body.enableMaterials,
    enableShaders: req.body.enableShaders,
    enableMeasurement: req.body.enableMeasurement,
    modelUnits: req.body.modelUnits
  });

  newView.save(
    (err, view) => {
      if (err)
        res.send(err);
      res.json(view);
      console.log('View successfully added');
  });

};


exports.getView = (req, res) => {
  console.log(req);
  View.findOne(
    {_id: req.params.id},
    (err, view) => {
      if (err)
        res.send(err);
      res.json(view);
      console.log('View successfully read');
  });
};


exports.updateView = (req, res) => {
  console.log(req);
  console.log(req.params.id);
  View.findOneAndUpdate(
    {_id: req.params.id},
    req.body,
    {new: true},
    (err, view) => {
      if (err)
        res.send(err);
      res.json(view);
      console.log('View successfully updated');
  });
};

exports.deleteView = (req, res) => {
  View.remove(
    {_id: req.params.id},
    (err, view) => {
      if (err)
        res.send(err);
      console.log('View successfully deleted');
    });
};
