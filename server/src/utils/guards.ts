import { HttpError } from "../controllers/helpers";
export function isHttpError(err: HttpError | Error): err is HttpError {
    return (err as HttpError).status !== undefined;
}