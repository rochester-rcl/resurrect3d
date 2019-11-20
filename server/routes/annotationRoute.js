const annotationController = require("../controllers/annotationController");
const userController = require("../controllers/user_controller");

module.exports = annotationRouter = router => {
  router
    .route("/api/annotations")
    .post(/*userController.authenticateServer,*/ annotationController.save);

  router
    .route("/api/annotations/:threeViewId")
    .get(annotationController.get)
    .post(/*userController.authenticateServer,*/ annotationController.delete);
};
