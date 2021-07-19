import request from "supertest";
import { Server } from "http";
import { stopApp, startApp, deleteUser } from "./TestUtils";
import { IUserDocument } from "../src/models/User";
import { IViewerDocument } from "../src/models/Viewer";
import { GridFSFileModel, GridFSChunkModel } from "../src/models/GridFS";
import ViewerModel from "../src/models/Viewer";
import fs from "fs";

let agent: request.SuperTest<request.Test> | null = null;
let app: Server | null = null;
let user: IUserDocument | null;

const userInfo = {
  username: "testvieweruser",
  email: "testviewuser@test.com",
  password: "thisisatest"
};

const threeFile = "tests/files/threefile.gz";
const skyboxFile = "tests/files/skybox.jpg";
const threeThumbnailFile = "tests/files/three-thumbnail.jpg";

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

function readBinaryFile(
  res: request.Response,
  callback: (error: Error | null, data: Buffer) => void
): void {
  res.setEncoding("binary");
  let hex = "";
  res.on("data", (chunk: string) => {
    hex += chunk;
  });
  res.on("end", () => {
    callback(null, Buffer.from(hex, "binary"));
  });
}

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
    expect(result.body.threeFile).toBeTruthy();
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

  it("Should stream a threeFile", async () => {
    expect.assertions(3);
    const test = agent?.post("/api/views");
    const result = await jsonToFormData(
      viewerInfo,
      test as request.Test
    ).attach("threeFile", threeFile);
    expect(result.status).toEqual(201);
    // make sure file exists
    let file = await agent
      ?.get(`/api/files/${result.body.threeFile}`)
      .buffer()
      .parse(readBinaryFile);
    expect(file?.status).toEqual(200);
    const fileContents = fs.readFileSync(threeFile);
    expect(Buffer.compare(file?.body, fileContents)).toEqual(0);
    // cleanup
    await agent?.delete(`/api/views/${result.body._id}`);
  });

  it("Should stream image files", async () => {
    expect.assertions(9);
    const test = agent?.post("/api/views");
    const result = await jsonToFormData(viewerInfo, test as request.Test)
      .attach("threeFile", threeFile)
      .attach("skyboxFile", skyboxFile)
      .attach("threeThumbnail", threeThumbnailFile);
    expect(result.status).toEqual(201);
    // make sure uuids for images are set
    expect(result?.body.skyboxFile).toBeTruthy();
    expect(result?.body.threeThumbnail).toBeTruthy();

    // check thumbnail file
    let thumbnail = await agent
      ?.get(`/api/files/${result.body.threeThumbnail}`)
      .buffer()
      .parse(readBinaryFile);
    expect(thumbnail?.status).toEqual(200);
    const thumbnailContents = fs.readFileSync(threeThumbnailFile);
    expect(Buffer.compare(thumbnail?.body, thumbnailContents)).toEqual(0);

    // skybox
    let skybox = await agent
      ?.get(`/api/files/${result.body.skyboxFile}`)
      .buffer()
      .parse(readBinaryFile);
    expect(skybox?.status).toEqual(200);
    const skyboxContents = fs.readFileSync(skyboxFile);
    expect(Buffer.compare(skybox?.body, skyboxContents)).toEqual(0);

    // cleanup
    await agent?.delete(`/api/views/${result.body._id}`);

    // make sure all files get deleted
    thumbnail = await agent?.get(`/api/files/${result.body.threeThumbnail}`);
    expect(thumbnail?.status).toEqual(404);

    skybox = await agent?.get(`/api/files/${result.body.skyboxFile}`);
    expect(skybox?.status).toEqual(404);
  });

  it("Should stream alternate maps", async () => {
    expect.assertions(10);
    const test = agent?.post("/api/views");
    const result = await jsonToFormData(viewerInfo, test as request.Test)
      .attach("threeFile", threeFile)
      .attach("alternateMaps[]", skyboxFile)
      .attach("alternateMaps[]", threeThumbnailFile);
    expect(result.status).toEqual(201);
    // make sure uuids for images are set
    expect(result?.body.alternateMaps).toBeTruthy();
    expect(result?.body.alternateMaps.length).toEqual(2);

    // fetch both alternate maps
    let alternate1 = await agent
      ?.get(`/api/files/${result.body.alternateMaps[0]}`)
      .buffer()
      .parse(readBinaryFile);

    let alternate2 = await agent
      ?.get(`/api/files/${result.body.alternateMaps[1]}`)
      .buffer()
      .parse(readBinaryFile);

    expect(alternate1?.status).toEqual(200);
    expect(alternate2?.status).toEqual(200);

    // make sure both files aren't the same
    expect(alternate1?.body).not.toEqual(alternate2?.body);

    // make sure the content matches the files
    const alternate1Content = fs.readFileSync(skyboxFile);
    const alternate2Content = fs.readFileSync(threeThumbnailFile);
    const alternateMapData = [alternate1Content, alternate2Content]; // in case order isn't maintained

    const alternate1DataMatch = alternateMapData.some(
      data => Buffer.compare(alternate1?.body, data) === 0
    );
    const alternate2DataMatch = alternateMapData.some(
      data => Buffer.compare(alternate2?.body, data) === 0
    );
    expect(alternate1DataMatch).toBe(true);
    expect(alternate2DataMatch).toBe(true);

    // cleanup
    await agent?.delete(`/api/views/${result.body._id}`);

    // make sure alternate maps are deleted
    alternate1 = await agent?.get(`/api/files/${result.body.alternateMaps[0]}`);
    alternate2 = await agent?.get(`/api/files/${result.body.alternateMaps[1]}`);

    expect(alternate1?.status).toEqual(404);
    expect(alternate2?.status).toEqual(404);
  });
});
