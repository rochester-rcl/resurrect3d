import dotenv from "dotenv";
import express from "express";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import multer from "multer";
import mongoose, { Mongoose, Connection } from "mongoose";
import GridFsStorage from "multer-gridfs-storage";
import MongoDB, { GridFSBucket } from "mongodb";
import getEnvVar from "./utils/env";
import { validateFileType as fileFilter } from "./utils/file";
import initRouter from "./routes/Router";

// initialize process.env
dotenv.config();

// initialize Mongo / GridFS

export async function initMongo(): Promise<Mongoose> {
  const url = getEnvVar("MONGO_URL") as string;
  return mongoose.connect(url, { useNewUrlParser: true });
}

export function initServer(connection: Connection): void {
  // Config
  const url = getEnvVar("MONGO_URL") as string;
  const fileSize = getEnvVar("MAX_UPLOAD_SIZE") as number;
  const privateKey = getEnvVar("PRIVATE_KEY") as string;
  const basename = getEnvVar("BASENAME") as string;
  const port = getEnvVar("PORT") as number;
  // File storage
  const grid = new GridFSBucket(connection.db);
  const storage = new GridFsStorage({ url });
  const upload = multer({
    storage,
    limits: { fileSize },
    fileFilter
  });

  // Express app
  const app = express();
  app.use(
    session({
      secret: privateKey,
      resave: false,
      saveUninitialized: true
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cors());
  app.use(
    express.urlencoded({ limit: `${fileSize.toString()}mb`, extended: false })
  );
  app.use(express.json({ limit: "20mb" }));

  const router = initRouter(upload, grid);
  app.use(basename, router);

  app.listen(port, () => {
    console.log(`Resurrect3D Server is Listening for Connections on ${port}`);
  });
}