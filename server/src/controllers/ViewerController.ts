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

function getFileIds(
  viewerData: Partial<IViewerRequestData>,
  files: IViewerRequestFiles
): IViewerFilenames {
  function getAlternateMaps(): string[] | null {
    // deserialize alternate maps data
    const viewerAlternateMaps = viewerData.alternateMaps
      ? JSON.parse(viewerData.alternateMaps)
      : [];
    const filesAlternateMaps = files["alternateMaps[]"]
      ? files["alternateMaps[]"].map(am => am.id)
      : [];
    const allMaps = viewerAlternateMaps.concat(filesAlternateMaps);
    return allMaps.length > 0 ? allMaps : null;
  }

  return {
    threeFile: (files.threeFile && files.threeFile[0].id) || null,
    skyboxFile:
      (files.skyboxFile && files.skyboxFile[0].id) ||
      viewerData.skyboxFile ||
      null,
    threeThumbnail:
      (files.threeThumbnail && files.threeThumbnail[0].id) ||
      viewerData.threeThumbnail ||
      null,
    alternateMaps: getAlternateMaps()
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
        // special case for threeFile, it cannot be deleted when updating
        if (key === "threeFile" && filenames[key] === null) {
          continue;
        }
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
  const filenames = getFileIds(req.body, req.files as IViewerRequestFiles);
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
  const viewerData: IViewerRequestData = req.body;
  const { id } = req.params;
  const { findRecord, updateRecord, successResponse, errorResponse } =
    recordHelper<IViewerDocument>(ViewerModel, res);
  const { deleteFiles } = gridHelper(grid, res);

  const record = await findRecord({ _id: id });

  if (record !== null) {
    try {
      const filenames = getFileIds(
        viewerData,
        req.files as IViewerRequestFiles
      );
      const updated = {
        ...viewerData,
        ...filenames,
        threeFile:
          record.threeFile && !filenames.threeFile
            ? record.threeFile
            : filenames.threeFile
      };
      const toDelete = getFilesToDelete(record, filenames);
      const saved = await updateRecord(updated, record);
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
