import mongoose, { Connection } from "mongoose";
import { Server } from "http";
import { initMongo, initServer } from "../src/server";
import UserModel from "../src/models/User";
import getEnv from "../src/utils/env";

let connection: Connection | null = null;

export async function startApp(port: number): Promise<Server> {
  const testDbUrl = getEnv("MONGO_TEST_URL") as string;
  ({ connection } = await initMongo(testDbUrl));
  return initServer(connection, port);
}

function closeApp(app: Server): Promise<void> {
  return new Promise(resolve => app.close(() => resolve()));
}

export async function stopApp(app: Server): Promise<void> {
  await connection?.close();
  await closeApp(app);
}

export async function deleteUser(id: string): Promise<void> {
  const query = UserModel.deleteOne({ _id: id });
  await query;
}
