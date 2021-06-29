import mongoose from "mongoose";
import request from "supertest";
import { initMongo, initServer } from "../src/server";
import getEnv from "../src/utils/env";

let agent: request.SuperTest<request.Test> | null = null;

const userInfo = {
  username: "testuser",
  email: "testuser@test.com",
  password: "thisisatest"
};

beforeAll(async () => {
  const testDbUrl = getEnv("MONGO_TEST_URL") as string;
  const { connection } = await initMongo(testDbUrl);
  const app = initServer(connection);
});

afterAll(async () => {
  await cleanUp();
  await mongoose.disconnect();
});

async function cleanUp() {
  Object.values(mongoose.connection.collections).forEach(async collection => {
    await collection.deleteMany({});
  });
  mongoose.connections.forEach(async conn => {
    await conn.close();
  });
}

describe("API Tests", () => {
  it("Should create a user", async () => {
    expect.assertions(1);
    const res = await agent?.post("/api/users").send(userInfo);
    console.log(res);
    expect(res).not.toEqual(undefined);
    expect(res?.status).toEqual(201);
  });
});
