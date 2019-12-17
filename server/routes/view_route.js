module.exports = (app, upload, conn, Grid, router) => {
  const view = require("../controllers/view_controller");
  const mongoose = require("mongoose");
  const user = require("../controllers/user_controller");

  // router.route("/").get(view.getFile);

  router
    .route("/api/file/:filename")
    .get(view.getFile)
    .delete(user.authenticateServer, view.deleteFile);

  router
    .route("/api/views")
    .get(view.findAllViews)
    .post(
      user.authenticateServer,
      upload.fields([
        { name: "threeFile", maxcount: 1 },
        { name: "threeThumbnail", maxcount: 1 },
        { name: "skybox__file", maxcount: 1 }
      ]),
      view.addView
    );
    /*
  router
    .route("/api/container")
    .get(view.getViews)
    .post(

      upload.fields([
        { name: "threeFile", maxcount: 1 },
        { name: "threeThumbnail", maxcount: 1 },
        { name: "skybox__file", maxcount: 1 }
      ]),

      view.addView
    );
    */
  router
    .route("/api/views/:id")
    .get(view.getView)
    .put(user.authenticateServer, view.updateView)
    .delete(user.authenticateServer, view.deleteView);

  router.route("/api/users/login")
    .post(user.login, user.onLogin);

  router.route("/api/users/logout")
    .get(user.logout);

  router.route("/api/users/authenticate")
    .get(user.authenticateClient);

  router.route("/api/users/")
    .post(user.add)

  // Needs custom authentication - need to check user ID against the id of the user in stored in req.session - same with all other deletes and puts
  router.route("/api/users/:id")
    .delete(user.authenticateServer, user.delete)

  router.route("/api/users/verify/:token")
    .get(user.verify);

};
