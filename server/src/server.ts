import dotenv from "dotenv";
import express from "express";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import multer from "multer";
import { Server } from "http";
import mongoose, { Mongoose, Connection } from "mongoose";
import GridFsStorage from "multer-gridfs-storage";
import { GridFSBucket } from "mongodb";
import getEnvVar from "./utils/env";
import { validateFileType as fileFilter } from "./utils/file";
import initRoutes from "./routes/Router";

// initialize process.env
dotenv.config();

// initialize Mongo / GridFS

function sleep(timeout: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), timeout);
  });
}

export async function initMongo(
  url?: string,
  retries = 2,
  timeout = 1000
): Promise<Mongoose> {
  try {
    const dbUrl = url || (getEnvVar("MONGO_URL") as string);
    return await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true
    });
  } catch (error) {
    if (retries > 0) {
      await sleep(timeout);
      return initMongo(url, retries - 1);
    } else {
      throw error;
    }
  }
}

export function initServer(connection: Connection, port?: number): Server {
  // Config
  const url = getEnvVar("MONGO_URL") as string;
  const fileSize = getEnvVar("MAX_UPLOAD_SIZE") as number;
  const privateKey = getEnvVar("PRIVATE_KEY") as string;
  const basename = getEnvVar("BASENAME") as string;
  const serverPort = port || (getEnvVar("PORT") as number);
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

  const router = initRoutes(upload, grid);

  app.use(basename, router);

  return app.listen(serverPort, () => {
    console.log(`Resurrect3D Server is Listening for Connections on ${port}`);
  });
}
