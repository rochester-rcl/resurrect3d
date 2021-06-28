import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import getEnvVar from "../utils/env";
import { IVerifyOptions } from "passport-local";

import {
  recordHelper,
  DocumentResponse,
  MultiDocumentResponse,
  ErrorResponse
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
    const rec = await addRecord({ ...info, password: hash, token: token });
    if (process.env.NODE_ENV === "production") {
      // send email
      await rec.sendVerificationEmail();
    }
    return successResponse(rec);
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

export async function deleteUser(
  req: Request,
  res: Response
): Promise<Response<void> | ErrorResponse> {
  const { expunge } = recordHelper<IUserDocument>(UserModel, res);
  const { id } = req.params;
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
    const updated = { ...record, verified: true } as IUserDocument;
    return await update(updated);
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
  if (req.user === undefined) {
    return res.status(401).json({
      authenticaed: false
    });
  }
  return next();
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

export async function userStrategy(
  email: string,
  password: string,
  done: (
    error?: Error | null,
    user?: IUserDocument | null,
    options?: IVerifyOptions
  ) => void
): Promise<void> {
  try {
    const query = UserModel.findOne({
      email: email
    } as FilterQuery<IUserDocument>);
    const user = await query;

    if (!user) {
      return done(null, user, {
        message: `User with email ${email} not found`
      });
    }

    if (!user.validPassword(password)) {
      return done(null, null, {
        message: `Incorrect password for user ${user.username}`
      });
    }

    if (!user.verified) {
      return done(null, null, {
        message: `User ${user.username}'s account is not verified`
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}

export function serializeUser(
  user: IUserDocument,
  done: (
    error?: Error | null,
    user?: IUserDocument | null,
    options?: IVerifyOptions
  ) => void
): void {
  done(null, user._id);
}

export async function deserializeUser(
  id: string,
  done: (
    error?: Error | null,
    user?: IUserDocument | null,
    options?: IVerifyOptions
  ) => void
): Promise<void> {
  try {
    const query = UserModel.findById(id);
    const user = await query;
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}
