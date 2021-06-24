export default function getEnvVar(key: EnvVars): EnvVar {
  switch (key) {
    case "MONGO_URL":
      return process.env.MONGO_URL || "http://localhost:27017/resurrectdb";

    case "PORT":
      return process.env.PORT ? parseFloat(process.env.PORT) : 8000;

    case "BASENAME":
      return process.env.BASENAME || "";

    case "MAX_UPLOAD_SIZE":
      return process.env.MAX_UPLOAD_SIZE || 200;

    case "PRIVATE_KEY":
      return process.env.PRIVATE_KEY || "";

    case "SALT_ROUNDS":
      return process.env.SALT_ROUNDS || 10;

    default:
      return null;
  }
}
