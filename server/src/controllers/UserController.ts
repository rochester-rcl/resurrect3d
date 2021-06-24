import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import getEnvVar from "../utils/env";

import {
  recordHelper,
  DocumentResponse,
  MultiDocumentResponse,
  ErrorResponse
} from "./helpers";
import UserModel, { IUserDocument } from "../models/User";

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
  } else {
    return errorResponse({ message: `User with id ${id} not found.` }, 404);
  }
}

export async function deleteUser(
  req: Request,
  res: Response
): Promise<Response<void> | ErrorResponse> {
  const { expunge } = recordHelper<IUserDocument>(UserModel, res);
  const { id } = req.params;
  return await expunge(id);
}
