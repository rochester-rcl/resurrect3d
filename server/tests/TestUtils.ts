import mongoose from "mongoose";
import { Server } from "http";
import { initMongo, initServer } from "../src/server";
import getEnv from "../src/utils/env";

export async function startApp(): Promise<Server> {
  const testDbUrl = getEnv("MONGO_TEST_URL") as string;
  const { connection } = await initMongo(testDbUrl);
  return initServer(connection);
}

export async function stopApp(app: Server): Promise<void> {
  await cleanUp();
  await mongoose.disconnect();
  app.close();
}

export async function cleanUp() {
  Object.values(mongoose.connection.collections).forEach(async collection => {
    await collection.deleteMany({});
  });
  mongoose.connections.forEach(async conn => {
    await conn.close();
  });
}
