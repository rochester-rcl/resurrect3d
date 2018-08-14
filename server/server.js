const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();

const view = require('./models/view');
const controller = require('./controllers/view_controller');
const views = require('./routes/view_route');
const dummyViewData = require('./dummyViewData');
const serverConfig = require('./config');

// Set up Mongo URI
const connPromise = mongoose.Promise = global.Promise;
const conn = mongoose.connect(
  serverConfig.mongoURL,
  {useMongoClient: true},
  (err) => {
    if (err) {
      console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line no-console
      throw err;
    }

    //dummyViewData();
  });

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
        const filename = buf.toString('hex') + file.originalname;
        const fileInfo = {
          filename: filename
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({
  storage: storage,
  limits: {fileSize: 1024 * 1024 * 100}, //100mbs,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

checkFileType = (file, cb) => {

  const filetypes = /jpeg|jpg|png|gz|json/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname) {
    return cb(null, true);
  }else{
    cb('Error: wrong file type');
  }
}

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));

views(app, upload, conn, Grid);
controller.get(app, upload, conn, Grid);

//Start Application
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`App running on: ${serverConfig.port}`); // eslint-disable-line
  }
});


module.exports = app;
