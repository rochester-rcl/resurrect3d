import { Request, Response } from "express";
import { GridFSBucket, GridFSBucketReadStream } from "mongodb";
import {
  recordHelper,
  gridHelper,
  DocumentResponse,
  MultiDocumentResponse,
  ErrorResponse
} from "./helpers";
import ViewerModel, { IViewerDocument } from "../models/Viewer";
import { FilterQuery } from "mongoose";
import { GridFSFileDocument } from "../models/GridFS";
import { GridFile } from "multer-gridfs-storage";

interface IReqGridFile extends Express.Multer.File, GridFile {}
interface IViewerRequestFiles {
  threeFile: IReqGridFile[];
  skyboxFile?: IReqGridFile[];
  threeThumbnail?: IReqGridFile[];
  "alternateMaps[]"?: IReqGridFile[];
  [fieldname: string]: IReqGridFile[] | undefined;
}

interface IViewerFilenames {
  threeFile: string;
  skyboxFile: string | null;
  threeThumbnail: string | null;
  alternateMaps: string[] | null;
  [key: string]: string | string[] | null;
}

type ViewerResponseWithError =
  | DocumentResponse<IViewerDocument>
  | MultiDocumentResponse<IViewerDocument>
  | ErrorResponse;

function getFileIds(files: IViewerRequestFiles): IViewerFilenames {
  // only threeFile is required
  if (!files.threeFile) {
    throw new Error("threeFile is not set on request.files");
  }
  return {
    threeFile: files.threeFile[0].id,
    skyboxFile: (files.skyboxFile && files.skyboxFile[0].id) || null,
    threeThumbnail:
      (files.threeThumbnail && files.threeThumbnail[0].id) || null,
    alternateMaps:
      (files["alternateMaps[]"] && files["alternateMaps[]"].map(m => m.id)) ||
      null
  };
}

function getFilesToDelete(
  viewer: IViewerDocument,
  filenames: IViewerFilenames
): string[] {
  let toDelete: string[] = [];
  for (let key in filenames) {
    if (key === "alternateMaps") {
      let oldAlternateMaps = viewer.alternateMaps;
      let newAlternateMaps = filenames.alternateMaps;
      if (oldAlternateMaps !== null) {
        if (newAlternateMaps !== null) {
          // ts compiler doesn't seem to understand the null check above ...
          toDelete = toDelete.concat(
            oldAlternateMaps.filter(m => !newAlternateMaps?.includes(m))
          );
        } else {
          toDelete = toDelete.concat(oldAlternateMaps);
        }
      }
    } else {
      if (viewer[key] !== null && viewer[key] !== filenames[key]) {
        toDelete.push(viewer[key] as string);
      }
    }
  }
  return toDelete;
}

function getAllFilesToDelete(filenames: IViewerFilenames): string[] {
  const { alternateMaps, ...rest } = filenames;
  const allFiles = Object.values(rest).concat(alternateMaps);
  return allFiles.filter(f => f !== null) as string[];
}

export async function createViewer(
  req: Request,
  res: Response
): Promise<ViewerResponseWithError> {
  const { create, errorResponse } = recordHelper<IViewerDocument>(
    ViewerModel,
    res
  );
  if (!req.files) {
    return errorResponse({ message: "Request has no files set" }, 400);
  }
  const filenames = getFileIds(req.files as IViewerRequestFiles);
  const viewerData = { ...req.body, ...filenames } as IViewerDocument;
  return await create(viewerData);
}

export async function getViewer(
  req: Request,
  res: Response
): Promise<ViewerResponseWithError> {
  const { get } = recordHelper<IViewerDocument>(ViewerModel, res);
  const { id } = req.params;
  return await get(id);
}

export async function getViewers(
  req: Request,
  res: Response
): Promise<ViewerResponseWithError> {
  const { get } = recordHelper<IViewerDocument>(ViewerModel, res);
  return await get();
}

export async function updateViewer(
  req: Request,
  res: Response,
  grid: GridFSBucket
): Promise<ViewerResponseWithError> {
  const viewerData: IViewer = req.body;
  const { id } = req.params;
  const { findRecord, updateRecord, successResponse, errorResponse } =
    recordHelper<IViewerDocument>(ViewerModel, res);
  const { deleteFiles } = gridHelper(grid, res);

  const record = await findRecord({ _id: id });
  if (record !== null) {
    try {
      const filenames = getFileIds(req.files as IViewerRequestFiles);
      const updated = {
        ...record,
        ...{ ...viewerData, ...filenames }
      } as IViewerDocument;
      const saved = await updateRecord(updated);
      // delete old files
      const toDelete = getFilesToDelete(record, filenames);
      const deleteStatus = await deleteFiles(toDelete);
      return deleteStatus
        ? successResponse(saved)
        : errorResponse(
            {
              message: `Unable to remove files with ids: ${toDelete.join(", ")}`
            },
            500
          );
    } catch (error) {
      const { message } = error;
      return errorResponse({ message }, 500);
    }
  }
  return errorResponse({ message: `Viewer with id ${id} not found.` }, 404);
}

export async function deleteViewer(
  req: Request,
  res: Response,
  grid: GridFSBucket
): Promise<ViewerResponseWithError> {
  const { findRecord, deleteRecord, errorResponse } =
    recordHelper<IViewerDocument>(ViewerModel, res);
  const { deleteFiles } = gridHelper(grid, res);
  const { id } = req.params;
  const viewer = await findRecord({ _id: id });
  if (!viewer) {
    return errorResponse({ message: `Unable to find Viewer ${id}` }, 404);
  }
  try {
    const deleted = await deleteRecord(viewer.id);
    if (!deleted) {
      throw new Error(`Unable to delete Viewer ${id}`);
    }
    const { threeFile, skyboxFile, threeThumbnail, alternateMaps } = viewer;
    const toDelete = getAllFilesToDelete({
      threeFile,
      skyboxFile,
      threeThumbnail,
      alternateMaps
    });
    const allDeleted = await deleteFiles(toDelete);
    if (!allDeleted) {
      throw new Error(`Unable to delete files for viewer ${id}`);
    }
    return res.send();
  } catch (error) {
    const { message } = error;
    return errorResponse({ message }, 500);
  }
}

export async function streamViewerFile(
  req: Request,
  res: Response,
  grid: GridFSBucket
): Promise<Response<GridFSBucketReadStream> | ErrorResponse> {
  const { streamFile } = gridHelper(grid, res);
  const { fileId } = req.params;
  return streamFile({ _id: fileId } as FilterQuery<GridFSFileDocument>);
}
