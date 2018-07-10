module.exports = function(app){
  const view = require('../controllers/view_controller');

  //Routes
  app.route('/')
    .get(view.landing);

  app.route('/api/views')
    .get(view.getViews)
    .post(view.addView);

  app.route('/api/views/:id')
    .get(view.getView)
    .put(view.updateView)
    .delete(view.deleteView);

};
