import { Response } from "express";
import { FilterQuery, ObjectId, Document } from "mongoose";
import { ResurrectDocument, ResurrectModel } from "../models/RecordTypes";
import { GridFSBucket, GridFSBucketReadStream } from "mongodb";
import {
  GridFSFileModel,
  GridFSChunkModel,
  GridFSChunkDocument,
  GridFSFileDocument
} from "../models/GridFS";

interface IErrorMessage {
  message: string;
}

type ErrorResponse = Response<IErrorMessage>;
type DocumentResponse<T extends ResurrectDocument> = Response<T>;
type MultiDocumentResponse<T extends ResurrectDocument> = Response<T[]>;

interface IRecordHelper<T extends ResurrectDocument> {
  create: (data: Partial<T>) => Promise<DocumentResponse<T> | ErrorResponse>;
  get(id: ObjectId): Promise<DocumentResponse<T> | ErrorResponse>;
  get(): Promise<MultiDocumentResponse<T>>;
  update: (doc: T) => Promise<DocumentResponse<T> | ErrorResponse>;
  expunge: (id: ObjectId) => Promise<Response<void> | ErrorResponse>;
  findRecords: (fq: FilterQuery<T>) => Promise<T[]>;
  findRecord: (fq: FilterQuery<T>) => Promise<T | null>;
  deleteRecord: (id: ObjectId) => Promise<boolean>;
  errorResponse: (body: IErrorMessage, status: number) => ErrorResponse;
}

export default function recordHelper<T extends ResurrectDocument>(
  model: ResurrectModel<T>,
  res: Response
): IRecordHelper<T> {
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

  function findRecords(fq: FilterQuery<T>): Promise<T[]> {
    const query = model.find(fq);
    return query.exec();
  }

  function findRecord(fq: FilterQuery<T>): Promise<T | null> {
    const query = model.findOne(fq);
    return query.exec();
  }

  function deleteRecord(id: ObjectId): Promise<boolean> {
    const query = model.deleteOne({ _id: id } as FilterQuery<T>);
    return query.then(({ ok }) => ok !== undefined && ok > 1);
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

  function expunge(id: ObjectId): Promise<Response<void> | ErrorResponse> {
    return deleteRecord(id).then(success =>
      success
        ? res.send()
        : handleError({ message: `Unable to delete Document with id ${id}` })
    );
  }

  function get(id: ObjectId): Promise<DocumentResponse<T> | ErrorResponse>;
  function get(): Promise<MultiDocumentResponse<T>>;
  function get(
    id?: ObjectId
  ): Promise<DocumentResponse<T> | MultiDocumentResponse<T> | ErrorResponse> {
    if (id !== undefined) {
      return findRecord({ _id: id } as FilterQuery<T>).then(
        (result: T | null) => {
          if (!result) {
            return handleError(
              { message: `Document with id ${id} not found` },
              404
            );
          } else {
            return handleSuccess(result, 200);
          }
        }
      );
    } else {
      return findRecords({ _id: id } as FilterQuery<T>).then((results: T[]) =>
        handleSuccess(results, 200)
      );
    }
  }

  return {
    create,
    update,
    findRecords,
    findRecord,
    deleteRecord,
    get,
    expunge,
    errorResponse: handleError
  };
}

interface IGridHelper {
  findFile: (
    fq: FilterQuery<GridFSFileDocument>
  ) => Promise<GridFSFileDocument | null>;
  deleteFile: (fq: FilterQuery<GridFSFileDocument>) => Promise<boolean>;
  streamFile: (
    fq: FilterQuery<GridFSFileDocument>
  ) => Promise<Response<GridFSBucketReadStream> | ErrorResponse>;
}

export function gridHelper(grid: GridFSBucket, res: Response): IGridHelper {
  const { findRecord, deleteRecord, errorResponse } =
    recordHelper<GridFSFileDocument>(GridFSFileModel, res);

  const chunkHelper = recordHelper<GridFSChunkDocument>(GridFSChunkModel, res);

  function findFile(
    fq: FilterQuery<GridFSFileDocument>
  ): Promise<GridFSFileDocument | null> {
    return findRecord(fq);
  }

  function deleteFile(fq: FilterQuery<GridFSFileDocument>): Promise<boolean> {
    return findFile(fq).then(file => {
      if (!file) {
        return false;
      }
      return deleteRecord(file.id).then(success => {
        if (success) {
          return chunkHelper.deleteRecord(file.id);
        } else {
          return false;
        }
      });
    });
  }

  function streamFile(
    fq: FilterQuery<GridFSFileDocument>
  ): Promise<Response<GridFSBucketReadStream> | ErrorResponse> {
    return findFile(fq).then(file => {
      if (!file) {
        return errorResponse(
          { message: `Unable to find the requested file` },
          404
        );
      } else {
        return grid.openDownloadStream(file._id).pipe(res);
      }
    });
  }

  return {
    findFile,
    deleteFile,
    streamFile
  };
}
