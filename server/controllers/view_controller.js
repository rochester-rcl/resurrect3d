const mongoose = require('mongoose');
const View = mongoose.model('view');

exports.landing = (req, res) => {
  var info = 'Please use "/views" to create or list all data. & Please use "/views/:someID" to read, update, or delete';
  res.send(info);
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
  var new_task = new View(req.body);
  new_task.save(
    (err, view) => {
      if (err)
        res.send(err);
      res.json(view);
      console.log('View successfully added');
  });
};


exports.getView = (req, res) => {
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
