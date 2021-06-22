import { Response } from "express";
import { FilterQuery, ObjectId } from "mongoose";
import { ResurrectDocument, ResurrectModel } from "../models/RecordTypes";

interface IErrorMessage {
  message: string;
}

type ErrorResponse = Response<IErrorMessage>;
type DocumentResponse<T extends ResurrectDocument> = Response<T>;
type MultiDocumentResponse<T extends ResurrectDocument> = Response<T[]>;

interface ICrudHelper<T extends ResurrectDocument> {
  create: (data: Partial<T>) => Promise<DocumentResponse<T> | ErrorResponse>;
  get(id: ObjectId): Promise<DocumentResponse<T> | ErrorResponse>;
  get(): Promise<MultiDocumentResponse<T>>;
  update: (doc: T) => Promise<DocumentResponse<T> | ErrorResponse>;
  find: (fq: FilterQuery<T>) => Promise<T[]>;
  findOne: (fq: FilterQuery<T>) => Promise<T | null>;
}

export default function crudHelper<T extends ResurrectDocument>(
  model: ResurrectModel<T>,
  res: Response
): ICrudHelper<T> {
  function handleError(
    body: IErrorMessage,
    status: number = 500
  ): ErrorResponse {
    return res.status(status).send(body);
  }

  function handleSuccess(doc: T[], status: number): MultiDocumentResponse<T>;
  function handleSuccess(doc: T, status: number): DocumentResponse<T>;
  function handleSuccess(
    doc: T | T[],
    status: number = 200
  ): DocumentResponse<T> | MultiDocumentResponse<T> {
    return res.status(status).send(doc);
  }

  function find(fq: FilterQuery<T>): Promise<T[]> {
    const query = model.find(fq);
    return query.exec();
  }

  function findOne(fq: FilterQuery<T>): Promise<T | null> {
    const query = model.findOne(fq);
    return query.exec();
  }

  function create(
    data: Partial<T>
  ): Promise<DocumentResponse<T> | ErrorResponse> {
    return model
      .create(data)
      .then((created: T) => handleSuccess(created, 201))
      .catch(({ message }: Error) => handleError({ message }, 500));
  }

  function update(
    doc: T,
    successStatus: number = 200,
    errorStatus: number = 500
  ): Promise<DocumentResponse<T> | ErrorResponse> {
    return doc
      .save() // TODO not sure how to fix this but this will do for now
      .then((updated: ResurrectDocument) =>
        handleSuccess(updated as T, successStatus)
      )
      .catch(({ message }: Error) => handleError({ message }, errorStatus));
  }

  function get(id: ObjectId): Promise<DocumentResponse<T> | ErrorResponse>;
  function get(): Promise<MultiDocumentResponse<T>>;
  function get(
    id?: ObjectId
  ): Promise<DocumentResponse<T> | MultiDocumentResponse<T> | ErrorResponse> {
    if (id !== undefined) {
      return findOne({ _id: id } as FilterQuery<T>).then((result: T | null) => {
        if (!result) {
          return handleError(
            { message: `Document with id ${id} not found` },
            404
          );
        } else {
          return handleSuccess(result, 200);
        }
      });
    } else {
      return find({ _id: id } as FilterQuery<T>).then((results: T[]) =>
        handleSuccess(results, 200)
      );
    }
  }

  return {
    create,
    update,
    find,
    findOne,
    get
  };
}
