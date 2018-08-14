module.exports = (app, upload, conn, Grid) => {
  const view = require('../controllers/view_controller');
  const mongoose = require('mongoose');

  app.route('/')
    .get( view.getFile );

  app.route('/api/file/:filename')
    .get( view.getFile )
    .delete( view.deleteFile );

  app.route('/api/views')
    .get( view.getViews )
    .post( upload.fields([
      {name: 'threeFile', maxcount:1},
      {name: 'threeThumbnail', maxcount:1},
      {name: 'skybox', maxcount:1}]),
      view.addView );

  app.route('/api/views/:id')
    .get(view.getView)
    .put( view.updateView )
    .delete( view.deleteView );

};
