import { initMongo, initServer } from "./src/server";

async function start(): Promise<void> {
  const { connection } = await initMongo();
  initServer(connection);
}

(async () => {
  await start();
})();
