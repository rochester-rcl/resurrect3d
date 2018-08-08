module.exports = (app, upload, conn, Grid) => {
  const view = require("../controllers/view_controller");
  const mongoose = require("mongoose");
  const View = mongoose.model("view");

  let gfs;

  conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
    //console.log(gfs);
  });
  //Routes
  app.route("/").get((req, res) => {
    console.log(gfs);
    gfs.files.find().toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "No files exist"
        });
      }
      return res.json(files);
    });
  });

  app
    .route("/api/file/:filename")
    .get((req, res) => {
      //console.log(gfs);
      gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
          return res.status(404).json({
            err: "No files exist"
          });
        }

        if (file.contentType === "image/jpeg" || "image/png") {
          var readstream = gfs.createReadStream(file.filename);
          readstream.pipe(res);
        } else {
          res.status(404).json({
            err: "Not proper mimetype"
          });
        }
      });
    })

    .put((req, res) => {
      console.log(req);

      gfs.files.findOneAndUpdate(
        { filename: req.params.filename },

        (err, file) => {
          if (!file || file.length === 0) {
            return res.status(404).json({
              err: "No file to update"
            });
          }

          if (file.contentType === "image/jpeg" || "image/png") {
            console.log("found the file");
          } else {
            res.status(404).json({
              err: "Not proper mimetype"
            });
          }
        }
      );
    });

  app
    .route("/api/views")
    .get(view.getViews)
    .post(
      upload.fields([
        { name: "threeFile", maxcount: 1 },
        { name: "threeThumbnail", maxcount: 1 },
        { name: "skybox", maxcount: 1 }
      ]),
      view.addView
    );

  app
    .route("/api/views/:id")
    .get(view.getView)
    .put(view.updateView)
    .delete(view.deleteView);
};
