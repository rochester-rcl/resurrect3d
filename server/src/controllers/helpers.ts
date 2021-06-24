import { Response } from "express";
import { FilterQuery } from "mongoose";
import { ResurrectDocument, ResurrectModel } from "../models/RecordTypes";
import { GridFSBucket, GridFSBucketReadStream } from "mongodb";
import {
  GridFSFileModel,
  GridFSChunkModel,
  GridFSChunkDocument,
  GridFSFileDocument
} from "../models/GridFS";

export type ErrorResponse = Response<IMessage>;
export type DocumentResponse<T extends ResurrectDocument> = Response<T>;
export type MultiDocumentResponse<T extends ResurrectDocument> = Response<T[]>;

interface IRecordHelper<T extends ResurrectDocument> {
  create: (data: Partial<T>) => Promise<DocumentResponse<T> | ErrorResponse>;
  get(id: string): Promise<DocumentResponse<T> | ErrorResponse>;
  get(): Promise<MultiDocumentResponse<T>>;
  update: (doc: T) => Promise<DocumentResponse<T> | ErrorResponse>;
  expunge: (id: string) => Promise<Response<void> | ErrorResponse>;
  findRecords: (fq: FilterQuery<T>) => Promise<T[]>;
  findRecord: (fq: FilterQuery<T>) => Promise<T | null>;
  addRecord: (data: Partial<T>) => Promise<T>;
  updateRecord: (doc: T) => Promise<T>;
  deleteRecord: (id: string) => Promise<boolean>;
  errorResponse: (body: IMessage, status: number) => ErrorResponse;
  successResponse(
    doc: T[],
    status?: number
  ): DocumentResponse<T> | MultiDocumentResponse<T>;
  successResponse(
    doc: T,
    status?: number
  ): DocumentResponse<T> | MultiDocumentResponse<T>;
}

export function recordHelper<T extends ResurrectDocument>(
  model: ResurrectModel<T>,
  res: Response
): IRecordHelper<T> {
  function errorResponse(body: IMessage, status: number = 500): ErrorResponse {
    return res.status(status).send(body);
  }

  function successResponse(doc: T[], status?: number): MultiDocumentResponse<T>;
  function successResponse(doc: T, status?: number): DocumentResponse<T>;
  function successResponse(
    doc: T | T[],
    status?: number
  ): DocumentResponse<T> | MultiDocumentResponse<T> {
    let s = status || 200;
    return res.status(s).send(doc);
  }

  function findRecords(fq: FilterQuery<T>): Promise<T[]> {
    const query = model.find(fq);
    return query.exec();
  }

  function findRecord(fq: FilterQuery<T>): Promise<T | null> {
    const query = model.findOne(fq);
    return query.exec();
  }

  function addRecord(data: Partial<T>): Promise<T> {
    return model.create(data);
  }

  function updateRecord(doc: T): Promise<T> {
    return doc.save() as Promise<T>;
  }

  function deleteRecord(id: string): Promise<boolean> {
    const query = model.deleteOne({ _id: id } as FilterQuery<T>);
    return query.then(({ ok }) => ok !== undefined && ok > 1);
  }

  function create(
    data: Partial<T>
  ): Promise<DocumentResponse<T> | ErrorResponse> {
    return addRecord(data)
      .then((created: T) => successResponse(created, 201))
      .catch(({ message }: Error) => errorResponse({ message }, 500));
  }

  function update(
    doc: T,
    successStatus: number = 200,
    errorStatus: number = 500
  ): Promise<DocumentResponse<T> | ErrorResponse> {
    return doc
      .save() // TODO not sure how to fix this but this will do for now
      .then((updated: ResurrectDocument) =>
        successResponse(updated as T, successStatus)
      )
      .catch(({ message }: Error) => errorResponse({ message }, errorStatus));
  }

  function expunge(id: string): Promise<Response<void> | ErrorResponse> {
    return deleteRecord(id).then(success =>
      success
        ? res.send()
        : errorResponse({ message: `Unable to delete Document with id ${id}` })
    );
  }

  function get(id: string): Promise<DocumentResponse<T> | ErrorResponse>;
  function get(): Promise<MultiDocumentResponse<T>>;
  function get(
    id?: string
  ): Promise<DocumentResponse<T> | MultiDocumentResponse<T> | ErrorResponse> {
    if (id !== undefined) {
      return findRecord({ _id: id } as FilterQuery<T>).then(
        (result: T | null) => {
          if (!result) {
            return errorResponse(
              { message: `Document with id ${id} not found` },
              404
            );
          } else {
            return successResponse(result, 200);
          }
        }
      );
    } else {
      return findRecords({ _id: id } as FilterQuery<T>).then((results: T[]) =>
        successResponse(results, 200)
      );
    }
  }

  return {
    create,
    update,
    findRecords,
    findRecord,
    addRecord,
    updateRecord,
    deleteRecord,
    get,
    expunge,
    errorResponse,
    successResponse
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
