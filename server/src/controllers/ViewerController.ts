import { Request, Response } from "express";
import { GridFSBucket } from "mongodb";

import {
  recordHelper,
  gridHelper,
  DocumentResponse,
  MultiDocumentResponse,
  ErrorResponse
} from "./helpers";
import ViewerModel, { IViewerDocument } from "../models/Viewer";

interface IViewerRequestFiles {
  threeFile: Express.Multer.File[];
  skyboxFile?: Express.Multer.File[];
  threeThumbnail?: Express.Multer.File[];
  alternateMaps?: Express.Multer.File[];
  [fieldname: string]: Express.Multer.File[] | undefined;
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

function getFilenames(files: IViewerRequestFiles): IViewerFilenames {
  // only threeFile is required
  if (!files.threeFile) {
    throw new Error("threeFile is not set on request.files");
  }
  return {
    threeFile: files.threeFile[0].filename,
    skyboxFile: (files.skyboxFile && files.skyboxFile[0].filename) || null,
    threeThumbnail:
      (files.threeThumbnail && files.threeThumbnail[0].filename) || null,
    alternateMaps:
      (files.alternateMaps && files.alternateMaps.map(m => m.filename)) || null
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
  const filenames = getFilenames(req.files as IViewerRequestFiles);
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
      const filenames = getFilenames(req.files as IViewerRequestFiles);
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
