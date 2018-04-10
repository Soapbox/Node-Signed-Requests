import Payload from "../../src/payload";
import Signature from "../../src/signature";
import { Request, RequestHandler, Response, Next } from "restify";
import { IConfig, mergeOverridesWithDefaults } from "../config";
import * as errors from "restify-errors";

function removeTrailingSlash(str: string): string {
  return str.replace(/\/+$/, "");
}

export default function(overrides?: IConfig): RequestHandler {
  const config = mergeOverridesWithDefaults(overrides);

  return async (req: any, res: Response, next: Next) => {
    try {
      if (req.header(config.headers.id) === undefined) {
        throw new errors.BadRequestError("id header must be provided");
      } else if (req.header(config.headers.timestamp) === undefined) {
        throw new errors.BadRequestError("timestamp header must be provided");
      } else if (req.header(config.headers.algorithm) === undefined) {
        throw new errors.BadRequestError("algorithm header must be provided");
      } else if (req.header(config.headers.signature) === undefined) {
        throw new errors.BadRequestError("signature header must be provided");
      }

      const now = new Date().getTime();
      const requestIssuedAt = new Date(req.header(config.headers.timestamp)).getTime();

      if ((now - requestIssuedAt) > (config.toleranceInSeconds * 1000)) {
        throw new errors.BadRequestError("The request has expired");
      }

      const payload = new Payload(
        req.header(config.headers.id),
        req.method.toUpperCase(),
        req.header(config.headers.timestamp),
        removeTrailingSlash(req.absoluteUri(req.url)),
        req.body,
      );

      const signature = new Signature(payload.toString(), config.algorithm, config.key);

      if (!signature.equals(req.header(config.headers.signature))) {
        throw new errors.BadRequestError("The provided signature is not valid");
      }
    } catch (err) {
      return next(err);
    }

    return next();
  };
}
