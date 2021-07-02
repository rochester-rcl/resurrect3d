import mongoose from "mongoose";
import request from "supertest";
import { Server } from "http";
import { stopApp, startApp } from "./TestUtils";
import { IUserDocument } from "../src/models/User";

let agent: request.SuperTest<request.Test> | null = null;
let app: Server | null = null;
let user: IUserDocument | null;

const userInfo = {
  username: "testuser",
  email: "testuser@test.com",
  password: "thisisatest"
};

const viewerInfo = {
  
}

beforeAll(async () => {
  app = await startApp();
  agent = request.agent(app);
  // create, verify, and log in a user for the tests
  const userResponse = await agent?.post("/api/users").send(userInfo);
  user = userResponse.body;
  await agent?.get(`/api/users/verify/${user?.token}`);
  await agent?.post("/api/users/login").send(userInfo);
});

afterAll(async () => {
  await stopApp(app as Server);
});

describe("Viewer API Tests", () => {
  it("Should create a viewer", async () => {

  });
});
