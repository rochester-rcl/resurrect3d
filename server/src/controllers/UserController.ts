import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import getEnvVar from "../utils/env";
import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import {
  Strategy as BearerStrategy,
  IVerifyOptions as BearerVerifyOptions
} from "passport-http-bearer";
import {
  recordHelper,
  DocumentResponse,
  MultiDocumentResponse,
  ErrorResponse,
  HttpError
} from "./helpers";
import UserModel, { IUserDocument } from "../models/User";
import { FilterQuery } from "mongoose";

type UserDocumentResponseWithError =
  | DocumentResponse<IUserDocument>
  | MultiDocumentResponse<IUserDocument>
  | ErrorResponse;

export async function createUser(
  req: Request,
  res: Response
): Promise<UserDocumentResponseWithError> {
  const userData: IUser = req.body;
  const { password, ...info } = userData;
  const privateKey = getEnvVar("PRIVATE_KEY") as string;
  const saltRounds = getEnvVar("SALT_ROUNDS") as number;
  // for now let's set it to never expire, it's really not that big a deal
  const token = jwt.sign({ email: info.email }, privateKey);
  const hash = bcrypt.hashSync(password, saltRounds);
  const { addRecord, successResponse, errorResponse } =
    recordHelper<IUserDocument>(UserModel, res);
  try {
    const { NODE_ENV, TESTING } = process.env;
    const rec = await addRecord({
      ...info,
      password: hash,
      token: token,
      verified: NODE_ENV === "production" || TESTING ? false : true
    });
    if (process.env.NODE_ENV === "production") {
      // send email
      await rec.sendVerificationEmail();
    }
    return successResponse(rec, 201);
  } catch (error) {
    const { message } = error;
    return errorResponse({ message }, 500);
  }
}

export async function getUsers(
  req: Request,
  res: Response
): Promise<MultiDocumentResponse<IUserDocument>> {
  const { get } = recordHelper<IUserDocument>(UserModel, res);
  return await get();
}

export async function getUser(
  req: Request,
  res: Response
): Promise<UserDocumentResponseWithError> {
  const { get } = recordHelper<IUserDocument>(UserModel, res);
  const { id } = req.params;
  return await get(id);
}

export async function updateUser(
  req: Request,
  res: Response
): Promise<UserDocumentResponseWithError> {
  const userData: IUser = req.body;
  const { id } = req.params;
  const { findRecord, update, errorResponse } = recordHelper<IUserDocument>(
    UserModel,
    res
  );
  const record = await findRecord({ _id: id });
  if (record !== null) {
    const updated = { ...record, ...userData } as IUserDocument;
    return await update(updated);
  }
  return errorResponse({ message: `User with id ${id} not found.` }, 404);
}

// TODO - delete all viewers and annotations when deleting a user
export async function deleteUser(
  req: Request,
  res: Response
): Promise<Response<void> | ErrorResponse> {
  const { expunge, errorResponse } = recordHelper<IUserDocument>(
    UserModel,
    res
  );
  const user = req.user as IUserDocument | undefined;
  const { id } = req.params;
  const objectId = mongoose.Types.ObjectId(id);
  if (!user || (user && !user._id.equals(objectId))) {
    return errorResponse(
      { message: "User does not have permission to remove this account" },
      403
    );
  }
  req.logOut();
  return await expunge(id);
}

export async function verifyUser(
  req: Request,
  res: Response
): Promise<UserDocumentResponseWithError> {
  const { findRecord, update, errorResponse } = recordHelper<IUserDocument>(
    UserModel,
    res
  );
  const { token } = req.params;
  const record = await findRecord({ token });
  if (record !== null) {
    record.verified = true;
    return await update(record);
  }
  return errorResponse(
    { message: `Could not find an account for token ${token}.` },
    404
  );
}

export function authenticateClient(
  req: Request,
  res: Response
): Response<{ authenticated: boolean }> {
  return res.json({ authenticated: req.user !== undefined });
}

export function authenticateServer(
  req: Request,
  res: Response,
  next: NextFunction
): Response<{ authenticated: boolean }> | void {
  if (!req.user) {
    return res.status(401).json({
      authenticaed: false
    });
  }
  const user = req.user as IUserDocument;
  if (!user.verified) {
    return res.status(403).json({
      authenticated: false
    });
  }
  return next();
}

export function onLogin(
  req: Request,
  res: Response
): Response<Partial<IUserDocument>> {
  const { user } = req;
  const { username, email, token, _id } = user as IUserDocument;
  return res.json({
    username: username,
    email: email,
    token: token,
    id: _id
  });
}

export function logout(
  req: Request,
  res: Response
): Response<void> | ErrorResponse {
  try {
    req.logout();
    return res.json();
  } catch (error) {
    const { message } = error;
    return res.status(500).json({ message });
  }
}

export async function localStrategy(
  email: string,
  password: string,
  done: DoneFunc<IUserDocument, IVerifyOptions>
): Promise<void> {
  try {
    const query = UserModel.findOne({
      email
    } as FilterQuery<IUserDocument>);
    const user = await query;

    if (!user) {
      return done(undefined, undefined, {
        message: `User with email ${email} not found`
      });
    }

    if (!user.validPassword(password)) {
      return done(undefined, undefined, {
        message: `Incorrect password for user ${user.username}`
      });
    }

    if (!user.verified) {
      return done(undefined, undefined, {
        message: `User ${user.username}'s account is not verified`
      });
    }

    return done(undefined, user);
  } catch (error) {
    return done(error);
  }
}

export async function bearerStrategy(
  token: string,
  done: DoneFunc<IUserDocument, BearerVerifyOptions>
): Promise<void> {
  try {
    const query = UserModel.findOne({ token });
    const user = await query;
    if (!user) {
      throw new Error("User not found");
    }
    // remove password
    return done(undefined, { ...user, password: "" } as IUserDocument, {
      scope: "all"
    });
  } catch (error) {
    return done(error);
  }
}

export type DoneFunc<T, OptT> = (
  error?: Error,
  user?: T,
  options?: OptT
) => void;

export function serializeUser(
  user: IUserDocument,
  done: DoneFunc<string, IVerifyOptions>
): void {
  done(undefined, user._id);
}

export async function deserializeUser(
  id: string,
  done: DoneFunc<IUserDocument, IVerifyOptions>
): Promise<void> {
  try {
    const query = UserModel.findById(id);
    const user = await query;
    if (!user) {
      throw new HttpError(`User with id ${id} not found`, 404);
    }
    return done(undefined, user);
  } catch (error) {
    return done(error);
  }
}

// User serialization

passport.serializeUser<string>(
  (user: Express.User, done: DoneFunc<string, IVerifyOptions>) =>
    serializeUser(user as IUserDocument, done)
);

passport.deserializeUser(deserializeUser);

// Passport Strategies
passport.use(new LocalStrategy({ usernameField: "email" }, localStrategy));
passport.use(new BearerStrategy(bearerStrategy));

function authenticateLocal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Express.User> {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "local",
      (err: Error | null, user: Express.User | boolean, info: any) => {
        if (err) {
          return reject(err);
        }
        if (!user) {
          return reject(
            new HttpError("No user found with credentails supplied", 401)
          );
        }
        return resolve(user);
      }
    )(req, res, next);
  });
}

async function loginUser(req: Request, user: Express.User): Promise<void> {
  return new Promise((resolve, reject) => {
    req.logIn(user, (err?: Error) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<Partial<IUserDocument>> | ErrorResponse> {
  try {
    const user = await authenticateLocal(req, res, next);
    await loginUser(req, user);
    return onLogin(req, res);
  } catch (error) {
    const { message } = error;
    const status = error.name === "HttpError" ? error.status : 500;
    return res.status(status).json({ message });
  }
}
