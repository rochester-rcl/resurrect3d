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

beforeAll(async () => {
  app = await startApp();
  agent = request.agent(app);
});

afterAll(async () => {
  await stopApp(app as Server);
});
