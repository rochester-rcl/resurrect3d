import { Request, Response } from "express";

import {
  recordHelper,
  DocumentResponse,
  MultiDocumentResponse,
  ErrorResponse
} from "./helpers";
import AnnotationModel, { IAnnotationDocument } from "../models/Annotation";

type AnnotationDocumentResponseWithError =
  | DocumentResponse<IAnnotationDocument>
  | MultiDocumentResponse<IAnnotationDocument>
  | ErrorResponse;

export async function createAnnotation(
  req: Request,
  res: Response
): Promise<AnnotationDocumentResponseWithError> {
  const { create } = recordHelper<IAnnotationDocument>(AnnotationModel, res);
  const annotationData: IAnnotation = req.body;
  return create({ ...annotationData, saveStatus: "SAVED" });
}

export async function updateAnnotation(
  req: Request,
  res: Response
): Promise<AnnotationDocumentResponseWithError> {
  const annotationData: IAnnotation = req.body;
  const { id } = req.params;
  const { findRecord, update, errorResponse } =
    recordHelper<IAnnotationDocument>(AnnotationModel, res);
  const record = await findRecord({ _id: id });
  if (record !== null) {
    const updated = {
      ...record,
      ...annotationData,
      saveStatus: "SAVED"
    } as IAnnotationDocument;
    return await update(updated);
  }
  return errorResponse({ message: `Annotation with id ${id} not found.` }, 404);
}

export async function deleteAnnotation(
  req: Request,
  res: Response
): Promise<Response<void> | ErrorResponse> {
  const { expunge } = recordHelper<IAnnotationDocument>(AnnotationModel, res);
  const { id } = req.params;
  return await expunge(id);
}

export async function loadAnnotations(
  req: Request,
  res: Response
): Promise<AnnotationDocumentResponseWithError> {
  const { findRecords, errorResponse, successResponse } =
    recordHelper<IAnnotationDocument>(AnnotationModel, res);
  const { threeViewId } = req.params;
  try {
    const annotations = await findRecords({ threeViewId });
    return successResponse(sortAnnotations(annotations));
  } catch (error) {
    const { message } = error;
    return errorResponse({ message }, 500);
  }
}

function sortAnnotations(
  annotations: IAnnotationDocument[]
): IAnnotationDocument[] {
  return annotations.sort((a, b) =>
    a.index !== undefined && b.index !== undefined ? a.index - b.index : 0
  );
}
