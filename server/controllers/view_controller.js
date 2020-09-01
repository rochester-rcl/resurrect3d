const mongoose = require("mongoose");
const View = mongoose.model("view");
const utils = require("../utils");
var app, upload, conn, Grid;
var updateAll;
let gfs;

isEmpty = (obj) => {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
};

exports.get = (app, upload, conn, Grid) => {
  this.app = app;
  this.upload = upload;
  this.conn = conn;
  this.Grid = Grid;

  mongoose.connection.on("open", () => {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
  });
};

exports.getFiles = (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "No files exist",
      });
    }
    return res.json(files);
  });
};

exports.getFile = (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No files exist",
      });
    }

    if (file.contentType === "image/jpeg" || "image/png") {
      var readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "Not proper mimetype",
      });
    }
  });
};
// TODO should probably have some sort of parameter or
// something to make this for admin only - in the future we will have a browse feature that will require everything
exports.findAllViews = (req, res) => {
  const query = {};
  //console.log(req.user);
  if (req.user) {
    query.createdBy = req.user.id;
  }
  View.find(query).exec((err, views) => {
    //console.log(views);
    if (err) {
      return res.status(500).json({
        message: "Could not find views: Error[ " + err + " ]",
      });
    }
    return res.status(200).json({ views: views });
    //console.log("View(s) successfully read");
  });
};

exports.addView = (req, res) => {
  console.log('add view');
  if (!req.files) {
    console.log("No files to upload.");
    return;
  }

  const { threeFile, threeThumbnail, skyboxFile, alternateMaps } = req.files;

  const newView = new View({
    displayName: req.body.displayName,
    threeFile: threeFile !== undefined ? threeFile[0].filename : null,
    threeThumbnail:
      threeThumbnail !== undefined ? threeThumbnail[0].filename : null,
    skyboxFile: skyboxFile !== undefined ? skyboxFile[0].filename : null,
    alternateMaps: alternateMaps !== undefined ? alternateMaps.map(map => map[0].filename) : null,
    enableLight: req.body.enableLight,
    enableMaterials: req.body.enableMaterials,
    enableShaders: req.body.enableShaders,
    enableMeasurement: req.body.enableMeasurement,
    enableAnnotations: req.body.enableAnnotations,
    enableDownload: req.body.enableDownload,
    enableEmbed: req.body.enableEmbed,
    modelUnits: req.body.modelUnits,
    createdBy: req.user.id,
  });
  let { externalMapInfo } = req.body;
  if (externalMapInfo) {
    externalMapInfo = JSON.parse(externalMapInfo);
    newView.externalMapInfo = externalMapInfo;
  }
  newView.save((err, view) => {
    if (err) {
      res.send(err);
    } else {
      res.json(view);
    }
    console.log(err);
    console.log(view);
    console.log("View successfully added");
  });
};

exports.getView = (req, res) => {
  View.findOne({ _id: req.params.id }, (err, view) => {
    if (err) res.send(err);
    res.json(view);
    console.log("View successfully read");
  });
};

exports.updateView = (req, res) => {
  let threeFileBool,
    threeThumbnailBool,
    skyboxFileBool = false;
  const contentType = req.headers["content-type"].split(";")[0];
  const body =
    contentType === utils.APP_CONSTANTS.MULTIPART_FORMDATA
      ? utils.flat2nested(req.body)
      : req.body;
  if (isEmpty(req.files)) {
    View.findOneAndUpdate({ _id: req.params.id }, body, { new: true }, (err, view) => {
      if (err) res.send(err);
      res.json(view);
      console.log({ update: "View successfully updated" });
    });
  } else {
    //console.log({isEmpty: 'false'});

    new Promise((resolve, reject) => {
      View.findOne({ _id: req.params.id }, (err, view) => {
        if (err) reject(console.log({ err: "View could not be found" }));

        if (!isEmpty(req.files.threeFile)) {
          threeFileBool = true;
          gfs.exist({ filename: view.threeFile }, (err, found) => {
            if (err)
              reject(console.log({ exsists: "Three File does not exsist" }));

            if (found && found !== req.body.threeFile) {
              gfs.remove({ filename: view.threeFile }, (err) => {
                if (err)
                  reject(
                    console.log({
                      delete: `delete of ${view.threeFile} - failed`,
                    })
                  );
              });
            }
          });
        }

        if (!isEmpty(req.files.threeThumbnail)) {
          threeThumbnailBool = true;
          gfs.exist({ filename: view.threeThumbnail }, (err, found) => {
            if (err)
              reject(
                console.log({ exsists: "Thumbnail File does not exsist" })
              );

            if (found && found !== req.body.threeThumbnail) {
              gfs.remove({ filename: view.threeThumbnail }, (err) => {
                if (err)
                  reject(
                    console.log({
                      delete: `delete of ${view.threeThumbnail} - failed`,
                    })
                  );
              });
            }
          });
        }

        if (!isEmpty(req.files.skyboxFile)) {
          skyboxFileBool = true;
          gfs.exist({ filename: view.skyboxFile }, (err, found) => {
            if (err)
              reject(console.log({ exsists: "Skybox File does not exsist" }));

            if (found && found !== req.body.skyboxFile) {
              gfs.remove({ filename: view.skyboxFile }, (err) => {
                if (err)
                  reject(
                    console.log({
                      delete: `delete of ${view.skyboxFile } - failed`,
                    })
                  );
              });
            }
          });
        }

        resolve(console.log({ update: "all good" }));
      }).then(() => {
        const { threeFile, threeThumbnail, skyboxFile, ...rest } = body;
        const params = {
          threeFile: threeFileBool
            ? req.files.threeFile[0].filename
            : threeFile,
          threeThumbnail: threeThumbnailBool
            ? req.files.threeThumbnail[0].filename
            : threeThumbnail,
          skyboxFile: skyboxFileBool
              ? req.files.skyboxFile[0].filename
              : skyboxFile,
          ...rest,
        };
        /*const newView = new View({
            _id: req.params.id,
            displayName: body.displayName,
            
            enableLight: body.enableLight,
            enableMaterials: body.enableMaterials,
            enableShaders: body.enableShaders,
            enableMeasurement: body.enableMeasurement,
            enableAnnotations: body.enableAnnotations,
            enableDownload: body.enableDownload,
            enableEmbed: body.enableEmbed,
            modelUnits: body.modelUnits,
            createdBy: req.user.id
          });*/

        //console.log(newView);

        View.findOneAndUpdate({ _id: req.params.id }, params, { new: true }, (err, view) => {
          if (err) res.send(err);
          res.json(view);
          console.log({ update: "View successfully updated" });
        });
      });
    });
  }
};

exports.deleteFile = (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file to remove",
      });
    }

    if (file.contentType === "image/jpeg" || "image/png") {
      gfs.remove({ _id: file._id }, (err) => {
        if (err) {
          return res.send({ delete: `delete of ${file.filename} - failed` });
        } else {
          console.log("File successfully deleted");
          return res.send({ delete: `delete of ${file.filename} - success` });
        }
      });
    } else {
      res.status(404).json({
        err: "Not proper mimetype",
      });
    }
  });
};

exports.deleteView = (req, res) => {
  View.findOne({ _id: req.params.id }, (err, view) => {
    if (err) console.log({ err: "View could not be found" });
    gfs.exist({ filename: view.threeFile }, (err, found) => {
      if (err) return console.log({ exists: "Three File does not exsist" });
      found
        ? gfs.remove({ filename: view.threeFile }, (err) => {
            if (err)
              return console.log({
                delete: `delete of ${view.threeFile} - failed`,
              });
          })
        : console.log("Three File does not exsist");
    });

    gfs.exist({ filename: view.threeThumbnail }, (err, found) => {
      if (err)
        return console.log({ exsists: "Thumbnail File does not exsist" });
      found
        ? gfs.remove({ filename: view.threeThumbnail }, (err) => {
            if (err)
              return console.log({
                delete: `delete of ${view.threeThumbnail} - failed`,
              });
          })
        : console.log("Thumbnail File does not exsist");
    });

    gfs.exist({ filename: view.skyboxFile }, (err, found) => {
      if (err) return console.log({ exsists: "Skybox File does not exsist" });
      found
        ? gfs.remove({ filename: view.skyboxFile }, (err) => {
            if (err)
              return console.log({
                delete: `delete of ${view.skyboxFile } - failed`,
              });
          })
        : console.log("Skybox File does not exsist");
    });

    View.remove({ _id: req.params.id }, (err, view) => {
      if (err) res.send(err);
      console.log("View successfully deleted");
      res.json({ success: "View successfully deleted" });
    });
  });
};
