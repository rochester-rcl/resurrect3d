import request from "supertest";
import { Server } from "http";
import { stopApp, startApp, deleteUser } from "./TestUtils";
import { IUserDocument } from "../src/models/User";
import { IViewerDocument } from "../src/models/Viewer";
import { GridFSFileModel, GridFSChunkModel } from "../src/models/GridFS";
import ViewerModel from "../src/models/Viewer";
import fs from "fs";
import { parse } from "superagent";

let agent: request.SuperTest<request.Test> | null = null;
let app: Server | null = null;
let user: IUserDocument | null;

const userInfo = {
  username: "testvieweruser",
  email: "testviewuser@test.com",
  password: "thisisatest"
};

const threeFile = "tests/files/threefile.gz";
const threeFile2 = "tests/files/threefile2.gz";
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

const viewerInfo2: Partial<IViewer> = {
  enableLight: false,
  enableMaterials: false,
  enableShaders: false,
  enableMeasurement: false,
  enableAnnotations: false,
  enableDownload: false,
  enableEmbed: false,
  modelUnits: "IN",
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

function compareSavedViewerToViewerInfo(
  info: Partial<IViewer>,
  viewer: IViewerDocument
): boolean {
  return Object.keys(info).every(key => info[key] === viewer[key]);
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

    expect(compareSavedViewerToViewerInfo(viewerInfo, result.body)).toEqual(
      true
    );
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
      .parse(parse.image);
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
      .parse(parse.image);
    expect(thumbnail?.status).toEqual(200);
    const thumbnailContents = fs.readFileSync(threeThumbnailFile);
    expect(Buffer.compare(thumbnail?.body, thumbnailContents)).toEqual(0);

    // skybox
    let skybox = await agent
      ?.get(`/api/files/${result.body.skyboxFile}`)
      .buffer()
      .parse(parse.image);
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
      .parse(parse.image);

    let alternate2 = await agent
      ?.get(`/api/files/${result.body.alternateMaps[1]}`)
      .buffer()
      .parse(parse.image);

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

  it("Should save and update viewer settings", async () => {
    expect.assertions(7);
    const test = agent?.post("/api/views");
    const result = await jsonToFormData(
      { ...viewerInfo, viewerSettings: JSON.stringify({ aKey: "a value" }) },

      test as request.Test
    ).attach("threeFile", threeFile);

    expect(result.status).toEqual(201);
    expect(result?.body.viewerSettings).toBeDefined();
    expect(result?.body.viewerSettings.aKey).toEqual("a value");

    // update viewer settings
    const updateTest = agent?.put(`/api/views/${result?.body._id}`);
    const updated = await jsonToFormData(
      {
        ...viewerInfo2,
        viewerSettings: JSON.stringify({
          aKey: "a different value",
          anotherKey: "another value"
        })
      },
      updateTest as request.Test
    );

    expect(updated?.body.threeFile).toBeDefined();
    expect(updated?.body.viewerSettings.aKey).toEqual("a different value");
    expect(updated?.body.viewerSettings.anotherKey).toEqual("another value");

    const updateTest2 = agent?.put(`/api/views/${result?.body._id}`);
    const updated2 = await jsonToFormData(
      {
        ...viewerInfo2,
        viewerSettings: null
      },
      updateTest2 as request.Test
    );

    expect(updated2?.body.viewerSettings).toEqual(null);

    // cleanup
    await deleteViewer(result.body);
  });

  it("Should update a viewer", async () => {
    expect.assertions(6);
    const test = agent?.post("/api/views");
    const result = await jsonToFormData(
      viewerInfo,
      test as request.Test
    ).attach("threeFile", threeFile);
    expect(compareSavedViewerToViewerInfo(viewerInfo, result?.body)).toEqual(
      true
    );
    expect(result.status).toEqual(201);

    // update the viewer
    const updateTest = agent?.put(`/api/views/${result?.body._id}`);
    const updated = await jsonToFormData(
      viewerInfo2,
      updateTest as request.Test
    ).attach("threeFile", threeFile2);

    expect(updated?.status).toEqual(200);
    // superagent does not let you pass null / false as FormData fields so we can only check files and modelUnits
    expect(updated?.body.modelUnits).toEqual(viewerInfo2.modelUnits);
    expect(updated?.body.threeFile).not.toEqual(result?.body.threeFile);
    // make sure updated threefile matches
    let updatedFile = await agent
      ?.get(`/api/files/${updated?.body.threeFile}`)
      .buffer()
      .parse(parse.image);
    const updatedFileContents = fs.readFileSync(threeFile2);
    expect(Buffer.compare(updatedFile?.body, updatedFileContents)).toEqual(0);

    // cleanup
    await deleteViewer(result?.body);
  });

  it("Should update images", async () => {
    expect.assertions(8);
    const test = agent?.post("/api/views");
    const result = await jsonToFormData(viewerInfo, test as request.Test)
      .attach("threeFile", threeFile)
      .attach("threeThumbnail", threeThumbnailFile);
    expect(result.status).toEqual(201);

    // update the viewer
    const updateTest = agent?.put(`/api/views/${result?.body._id}`);
    const updated = await jsonToFormData(
      viewerInfo2,
      updateTest as request.Test
    ).attach("threeThumbnail", skyboxFile);

    expect(updated?.status).toEqual(200);
    // superagent does not let you pass null / false as FormData fields so we can only check files and modelUnits
    expect(updated?.body.threeThumbnail).not.toEqual(
      result?.body.threeThumbnail
    );
    // make sure updated thumbnail matches
    let updatedFile = await agent
      ?.get(`/api/files/${updated?.body.threeThumbnail}`)
      .buffer()
      .parse(parse.image);
    const updatedFileContents = fs.readFileSync(skyboxFile);
    expect(Buffer.compare(updatedFile?.body, updatedFileContents)).toEqual(0);

    // add a skybox
    const updateTest2 = agent?.put(`/api/views/${result?.body._id}`);
    const updated2 = await jsonToFormData(
      { ...viewerInfo2, threeThumbnail: updated?.body.threeThumbnail },
      updateTest2 as request.Test
    ).attach("skyboxFile", skyboxFile);

    expect(updated2?.status).toEqual(200);
    // superagent does not let you pass null / false as FormData fields so we can only check files and modelUnits
    expect(updated2?.body.threeThumbnail).toEqual(updated?.body.threeThumbnail);
    expect(updated2?.body.skyboxFile).toBeTruthy();

    // make sure updated skybox matches
    let updatedFile2 = await agent
      ?.get(`/api/files/${updated2?.body.skyboxFile}`)
      .buffer()
      .parse(parse.image);
    expect(Buffer.compare(updatedFile2?.body, updatedFileContents)).toEqual(0);

    // cleanup
    await deleteViewer(result?.body);
  });

  it("Should update alternateMaps", async () => {
    expect.assertions(11);
    const test = agent?.post("/api/views");
    const result = await jsonToFormData(viewerInfo, test as request.Test)
      .attach("threeFile", threeFile)
      .attach("alternateMaps[]", skyboxFile);
    expect(result.status).toEqual(201);

    // add another alternate map
    const updateTest = agent?.put(`/api/views/${result?.body._id}`);
    const updated = await jsonToFormData(
      {
        ...viewerInfo2,
        alternateMaps: JSON.stringify(result?.body.alternateMaps)
      },
      updateTest as request.Test
    ).attach("alternateMaps[]", threeThumbnailFile);

    expect(updated?.status).toEqual(200);
    expect(updated?.body.alternateMaps.length).toEqual(2);

    // fetch both alternate maps
    const alternate1 = await agent
      ?.get(`/api/files/${updated?.body.alternateMaps[0]}`)
      .buffer()
      .parse(parse.image);

    const alternate2 = await agent
      ?.get(`/api/files/${updated?.body.alternateMaps[1]}`)
      .buffer()
      .parse(parse.image);

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
    expect(alternate1DataMatch).toEqual(true);
    expect(alternate2DataMatch).toEqual(true);

    // delete an alternate map
    const update2Test = agent?.put(`/api/views/${result?.body._id}`);
    const updated2 = await jsonToFormData(
      {
        ...viewerInfo2,
        alternateMaps: JSON.stringify([updated.body.alternateMaps[0]])
      },
      update2Test as request.Test
    );

    expect(updated2?.body.alternateMaps.length).toEqual(1);

    // make sure deleted map no longer exists
    const alternate3 = await agent
      ?.get(`/api/files/${updated2?.body.alternateMaps[0]}`)
      .buffer()
      .parse(parse.image);

    const alternate3DataMatch = alternateMapData.some(
      data => Buffer.compare(alternate3?.body, data) === 0
    );
    expect(alternate3DataMatch).toEqual(true);

    const alternate4 = await agent?.get(
      `/api/files/${updated?.body.alternateMaps[1]}`
    );

    expect(alternate4?.status).toEqual(404);

    // cleanup
    await deleteViewer(result?.body);
  });
});
