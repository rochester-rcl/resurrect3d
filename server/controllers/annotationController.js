const AnnotationModule = require("../models/annotation");
const Annotation = AnnotationModule.model;
const SAVE_STATUS = AnnotationModule.SAVE_STATUS;

const saveAnnotation = (req, res) => {
  const annotation = new Annotation({ ...req.body });
  annotation.save((err, result) => {
    if (err) res.send(err);
    if (result) {
      result.updateSaveStatus(SAVE_STATUS.SAVED, (err, updated) => {
        if (err) res.send(err);
        res.json(updated);
      });
    }
  });
};

const updateAnnotation = (req, res) => {
  const a = {...req.body};
  const annotation = new Annotation(a);
  Annotation.findOneAndUpdate(
    { _id: a._id },
    annotation,
    { new: true },
    (error, result) => {
      if (result) {
        result.updateSaveStatus(SAVE_STATUS.SAVED, (err, updated) => {
          if (err) res.send(err);
          res.json(updated);
        });
      }
    }
  );
};

const deleteAnnotation = (req, res) => {
  const { id } = req.body;
  const { threeViewId } = req.params;
  Annotation.findOne(
    { _id: id, threeViewId: threeViewId },
    (err, annotation) => {
      if (err) res.send(err);
      if (annotation) {
        annotation.remove(err => {
          if (err) res.send(err);
          res.json({ status: true });
        });
      }
    }
  );
};

const loadAnnotations = (req, res) => {
  const { threeViewId } = req.params;
  Annotation.find({ threeViewId: threeViewId }, (err, annotations) => {
    if (err) res.send(err);
    const sorted = annotations.sort(sortAnnotations);
    res.json(sorted);
  });
};

const sortAnnotations = (a, b) => {
  return a.index - b.index;
}

module.exports = {
  save: saveAnnotation,
  get: loadAnnotations,
  delete: deleteAnnotation,
  update: updateAnnotation
};
