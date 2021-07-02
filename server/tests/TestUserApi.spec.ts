import mongoose from "mongoose";
import request from "supertest";
import { Server } from "http";
import { initMongo, initServer } from "../src/server";
import getEnv from "../src/utils/env";
import { startApp, stopApp } from "./TestUtils";

let agent: request.SuperTest<request.Test> | null = null;
let app: Server | null = null;

const userInfo = {
  username: "testuser",
  email: "testuser@test.com",
  password: "thisisatest"
};

const user2Info = {
  username: "testuser2",
  email: "testuser2@test.com",
  password: "thisisatest"
};

const user3Info = {
  username: "testuser3",
  email: "testuser3@test.com",
  password: "thisisatest"
};

const user4Info = {
  username: "testuser4",
  email: "testuser4@test.com",
  password: "thisisatest"
};

beforeAll(async () => {
  app = await startApp();
  agent = request.agent(app);
});

afterAll(async () => {
  await stopApp(app as Server);
});

describe("User API Tests", () => {
  it("Should create a user", async () => {
    expect.assertions(5);
    const res = await agent?.post("/api/users").send(userInfo);
    expect(res).not.toBeUndefined();
    expect(res?.status).toEqual(201);
    const { username, email, password } = res?.body;
    expect(username).toEqual(userInfo.username);
    expect(email).toEqual(userInfo.email);
    expect(password).not.toEqual(userInfo.password);
  });

  it("Should verify, authenticate, and log in a user", async () => {
    expect.assertions(18);

    // make sure user isn't authenticated
    const auth1 = await agent?.get("/api/users/authenticate");
    expect(auth1?.body.authenticated).toEqual(false);
    const savedUser = await agent?.post("/api/users").send(user2Info);
    const { token } = savedUser?.body;

    // make sure user can't actually log in without verification
    const notLoggedIn = await agent?.post("/api/users/login").send(user2Info);
    expect(notLoggedIn?.status).toEqual(401);

    // verification
    const res = await agent?.get(`/api/users/verify/${token}`);
    expect(res).not.toBeUndefined();
    expect(res?.status).toEqual(200);
    let { username, email, password, verified } = res?.body;
    expect(username).toEqual(user2Info.username);
    expect(email).toEqual(user2Info.email);
    expect(password).not.toEqual(user2Info.password);
    expect(verified).toEqual(true);

    // login
    const loggedIn = await agent?.post("/api/users/login").send(user2Info);
    expect(loggedIn).not.toBeUndefined();
    expect(res?.status).toEqual(200);
    ({ username, email, password, verified } = res?.body);
    expect(username).toEqual(user2Info.username);
    expect(email).toEqual(user2Info.email);
    expect(password).not.toEqual(user2Info.password);
    expect(verified).toEqual(true);

    // authentication
    const auth2 = await agent?.get("/api/users/authenticate");
    const { authenticated } = auth2?.body;
    expect(authenticated).toEqual(true);

    // logout
    const loggedOut = await agent?.get("/api/users/logout");
    expect(loggedOut).not.toBeUndefined();
    expect(loggedOut?.status).toEqual(200);

    // attempt to authenticate
    const auth3 = await agent?.get("/api/users/authenticate");
    expect(auth3?.body.authenticated).toEqual(false);
  });

  it("Should delete a user", async () => {
    expect.assertions(5);
    const user1 = await agent?.post("/api/users").send(user3Info);
    await agent?.get(`/api/users/verify/${user1?.body.token}`);
    const user2 = await agent?.post("/api/users").send(user4Info);
    await agent?.get(`/api/users/verify/${user2?.body.token}`);

    // log in as user1, attempt to delete user2
    await agent?.post("/api/users/login").send(user3Info);
    const deleteRes1 = await agent?.delete(`/api/users/${user2?.body._id}`);
    expect(deleteRes1).not.toBeUndefined();
    expect(deleteRes1?.status).toEqual(403);

    // allow user1 to delete themselves
    const deleteRes2 = await agent?.delete(`/api/users/${user1?.body._id}`);
    expect(deleteRes2).not.toBeUndefined();
    expect(deleteRes2?.status).toEqual(200);

    // make sure user1 can't log back in
    const loggedInRes = await agent?.post("/api/users/login").send(user3Info);
    expect(loggedInRes?.status).toEqual(401);
  });
});
