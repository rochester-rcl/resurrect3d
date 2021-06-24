interface IMailConfig {
  password: string;
  username: string;
  service: string;
  verificationRoute: string;
}

type EnvVars =
  | "MONGO_URL"
  | "PORT"
  | "BASENAME"
  | "MAX_UPLOAD_SIZE"
  | "PRIVATE_KEY"
  | "SALT_ROUNDS";
type EnvVar = string | number | null;

interface IMessage {
  message: string;
}