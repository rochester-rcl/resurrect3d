const express = require("express");
const mongoose = require("mongoose");
const MongoDB = require("mongodb");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const bodyParser = require("body-parser");
const bb = require("express-busboy");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();
const session = require("express-session");
const passport = require("passport");
const constants = require("./constants");
const view = require("./models/view");
const controller = require("./controllers/view_controller");
const views = require("./routes/view_route");
const annotationRoute = require("./routes/annotationRoute");
const dummyViewData = require("./dummyViewData");
const serverConfig = require("./config");

function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), timeout);
  });
}

function mongoConnect(retries = 2, timeout = 1000) {
  return mongoose.connect(serverConfig.mongoURL).catch(err => {
    if (retries > 0) {
      return sleep(timeout).then(() => mongoConnect(retries - 1));
    } else {
      throw err;
    }
  });
}

mongoConnect().then(conn => {
  console.log(conn);
  // Create storage engine
  const storage = new GridFsStorage({
    url: serverConfig.mongoURL,
    file: (req, file) => {
      //console.log("From storage: ",req);
      return new Promise((resolve, reject) => {
        crypto.randomBytes(8, (err, buf) => {
          if (err) {
            return reject(err);
          }
          //const filename = buf.toString('hex') + path.extname(file.originalname);
          const filename = buf.toString("hex") + file.originalname;
          const fileInfo = {
            filename: filename
          };
          if (file.fieldname.includes("externalMaps")) {
            let { externalMapInfo } = req.body;
            externalMapInfo = JSON.parse(externalMapInfo);
            const map = externalMapInfo.find(
              m => file.originalname === m.filename
            );
            if (map) {
              fileInfo.filename = map.id;
            }
          }
          resolve(fileInfo);
        });
      });
    }
  });

  const grid = new MongoDB.GridFSBucket(conn.db);

  const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 200 }, //200mbs,
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    }
  });

  const router = express.Router();

  checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gz|json/;

    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: wrong file type");
    }
  };

  app.use(cors());
  app.use(
    session({
      secret: constants.PRIVATE_KEY,
      resave: false,
      saveUninitialized: true
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(bodyParser.json({ limit: "20mb" }));
  app.use(bodyParser.urlencoded({ limit: "200mb", extended: false }));
  views(app, upload, conn, router);
  annotationRoute(router);
  app.use(serverConfig.basename, router);
  controller.get(app, upload, conn, grid);

  //Start Application
  app.listen(serverConfig.port, error => {
    if (!error) {
      console.log(`App running on: ${serverConfig.port}`); // eslint-disable-line
    }
  });
});
