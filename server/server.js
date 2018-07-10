const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const view = require('./models/view');
const views = require('./routes/view_route');
const dummyViewData = require('./dummyViewData');
const serverConfig = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(
  serverConfig.mongoURL,
  {useMongoClient: true},
  (error) => {
    if (error) {
      console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line no-console
      throw error;
    }

    dummyViewData();
  });

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));

views(app);

//Start Application
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`App running on: ${serverConfig.port}`); // eslint-disable-line
  }
});

module.exports = app;
