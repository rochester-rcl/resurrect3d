import express, { Router } from "express";
import { Multer } from "multer";
import { GridFSBucket } from "mongodb";

export default function initRoutes(upload: Multer, grid: GridFSBucket): Router {
  const router = express.Router();
  return router;
}
