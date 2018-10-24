module.exports = (app, upload, conn, Grid) => {
  const view = require("../controllers/view_controller");
  const mongoose = require("mongoose");
  const user = require("../controllers/user_controller");

  app.route("/").get(view.getFile);

  app
    .route("/api/file/:filename")
    .get(view.getFile)
    .delete(user.authenticateServer, view.deleteFile);

  app
    .route("/api/views")
    .get(view.getViews)
    .post(
      user.authenticateServer,
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
    .put(user.authenticateServer, view.updateView)
    .delete(user.authenticateServer, view.deleteView);

  app.route("/api/users/login")
    .post(user.login, user.onLogin);

  app.route("/api/users/logout")
    .get(user.logout);

  app.route("/api/users/authenticate")
    .get(user.authenticateClient);

  app.route("/api/users/")
    .post(user.add)

  // Needs custom authentication - need to check user ID against the id of the user in stored in req.session - same with all other deletes and puts
  app.route("/api/users/:id")
    .delete(user.authenticateServer, user.delete)

  app.route("/api/users/verify/:token")
    .get(user.verify);
};
