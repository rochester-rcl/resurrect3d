const Annotation = require("../models/annotation");

const saveAnnotation = (req, res) => {
  const annotation = new Annotation({ ...req.body });
  annotation.save((err, result) => {
    if (err) res.send(err);
    res.json(result);
  });
};

const deleteAnnotation = (req, res) => {
  const { id } = req.body;
  const { threeViewId } = req.params;
  Annotation.findOne({ _id: id, threeViewId: threeViewId }, (err, annotation) => {
    if (err) res.send(err);
    annotation.remove(err => {
      if (err) res.send(err);
      res.json({ status: true });
    });
  });
};

const loadAnnotations = (req, res) => {
  const { threeViewId } = req.params;
  Annotation.find({ threeViewId: threeViewId }, (err, annotations) => {
    if (err) res.send(err);
    res.json(annotations);
  });
};

module.exports = {
  save: saveAnnotation,
  get: loadAnnotations,
  delete: deleteAnnotation
};
