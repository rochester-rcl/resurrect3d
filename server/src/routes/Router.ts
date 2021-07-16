import express, { Request, Response, Router, NextFunction } from "express";
import { Multer } from "multer";
import { GridFSBucket } from "mongodb";
import * as UserController from "../controllers/UserController";
import * as ViewerController from "../controllers/ViewerController";
import * as AnnotationController from "../controllers/AnnotationController";
import { IUserDocument } from "../models/User";

export default function initRoutes(upload: Multer, grid: GridFSBucket): Router {
  const router = express.Router();

  const uploadMiddleware = upload.fields([
    { name: "threeFile", maxCount: 1 },
    { name: "threeThumbnail", maxCount: 1 },
    { name: "skyboxFile", maxCount: 1 },
    { name: "alternateMaps[]" }
  ]);

  // Viewer Routes
  router
    .route("/api/views")
    .get(ViewerController.getViewers)
    .post(
      UserController.authenticateServer,
      uploadMiddleware,
      ViewerController.createViewer
    );

  router
    .route("/api/views/:id")
    .get(ViewerController.getViewer)
    .put(
      UserController.authenticateServer,
      uploadMiddleware,
      async (req, res) => ViewerController.updateViewer(req, res, grid)
    )
    .delete(UserController.authenticateServer, async (req, res) =>
      ViewerController.deleteViewer(req, res, grid)
    );

  // Annotation Routes
  router
    .route("/api/annotations")
    .post(
      UserController.authenticateServer,
      AnnotationController.createAnnotation
    )
    .put(
      UserController.authenticateServer,
      AnnotationController.updateAnnotation
    );

  router
    .route("/api/annotations/:threeViewId")
    .get(AnnotationController.loadAnnotations)
    .post(
      UserController.authenticateServer,
      AnnotationController.deleteAnnotation
    );

  // File Routes
  router
    .route("/api/files/:fileId")
    .get(async (req, res) => ViewerController.streamViewerFile(req, res, grid));

  // User Routes
  router.route("/api/users/login").post(UserController.login);

  router.route("/api/users/logout").get(UserController.logout);

  router
    .route("/api/users/authenticate")
    .get(UserController.authenticateClient);

  router.route("/api/users").post(UserController.createUser);

  router
    .route("/api/users/:id")
    .delete(UserController.authenticateServer, UserController.deleteUser);

  router.route("/api/users/verify/:token").get(UserController.verifyUser);

  return router;
}
