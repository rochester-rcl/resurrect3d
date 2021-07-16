import request from "supertest";
import { Server } from "http";
import { stopApp, startApp, deleteUser } from "./TestUtils";
import { IUserDocument } from "../src/models/User";
import { IViewerDocument } from "../src/models/Viewer";
import { GridFSFileModel, GridFSChunkModel } from "../src/models/GridFS";
import ViewerModel from "../src/models/Viewer";
import mongoose from "mongoose";

let agent: request.SuperTest<request.Test> | null = null;
let app: Server | null = null;
let user: IUserDocument | null;

const userInfo = {
  username: "testvieweruser",
  email: "testviewuser@test.com",
  password: "thisisatest"
};

const threeFile = "tests/files/threefile.gz";

const viewerInfo: Partial<IViewer> = {
  enableLight: true,
  enableMaterials: true,
  enableShaders: true,
  enableMeasurement: true,
  enableAnnotations: true,
  enableDownload: true,
  enableEmbed: true,
  modelUnits: "MM",
  threeThumbnail: null,
  skyboxFile: null,
  alternateMaps: null
};

function jsonToFormData(
  body: { [key: string]: any },
  test: request.Test
): request.Test {
  for (let key in body) {
    if (body[key]) {
      test.field(key, body[key]);
    }
  }
  return test;
}

function compareSavedViewerToViewerInfo(viewer: IViewerDocument): boolean {
  return Object.keys(viewerInfo).every(key => viewerInfo[key] === viewer[key]);
}

async function deleteViewer(viewer: IViewerDocument): Promise<void> {
  const { threeFile: fileId } = viewer;
  const query = ViewerModel.deleteOne({ _id: viewer._id });
  await query;
  await deleteFile(fileId);
}

async function deleteFile(id: string): Promise<void> {
  const fileQuery = GridFSFileModel.deleteOne({ _id: id });
  await fileQuery;
  const chunkQuery = GridFSChunkModel.deleteOne({ files_id: id });
  await chunkQuery;
}

beforeAll(async () => {
  app = await startApp(8888);
  agent = request.agent(app);
  // create, verify, and log in a user for the tests
  const userResponse = await agent?.post("/api/users").send(userInfo);
  user = userResponse.body;
  await agent?.get(`/api/users/verify/${user?.token}`);
});

beforeEach(async () => {
  await agent?.post("/api/users/login").send(userInfo);
  await agent?.get("/api/users/authenticate");
});

afterAll(async () => {
  await deleteUser(user?._id);
  await stopApp(app as Server);
});

describe("Viewer API Tests", () => {
  it("Should create a viewer", async () => {
    expect.assertions(4);
    const test = agent?.post("/api/views");
    const result = await jsonToFormData(
      viewerInfo,
      test as request.Test
    ).attach("threeFile", threeFile);
    expect(compareSavedViewerToViewerInfo(result.body)).toEqual(true);
    expect(result.status).toEqual(201);
    expect(result.body.threeFile).toBeDefined();
    expect(result.body._id).toBeDefined();

    // cleanup
    await deleteViewer(result.body);
  });

  it("Should be able to delete a viewer", async () => {
    expect.assertions(4);
    const test = agent?.post("/api/views");
    const result = await jsonToFormData(
      viewerInfo,
      test as request.Test
    ).attach("threeFile", threeFile);
    expect(result.status).toEqual(201);
    // make sure file exists
    let file = await agent?.get(`/api/files/${result.body.threeFile}`);
    expect(file?.status).toEqual(200);
    const deleted = await agent?.delete(`/api/views/${result.body._id}`);
    expect(deleted?.status).toEqual(200);
    // make sure files are also deleted
    file = await agent?.get(`/api/files/${result.body.threeFile}`);
    expect(file?.status).toEqual(404);
  });
});
