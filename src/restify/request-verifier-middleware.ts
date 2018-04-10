import Payload from "../../src/payload";
import Signature from "../../src/signature";
import { removeTrailingSlash } from "../utils";
import { BadRequestError } from "restify-errors";
import ExpiredRequestError from "../errors/expired-request";
import InvalidSignatureError from "../errors/invalid-signature";
import { IConfig, mergeOverridesWithDefaults } from "../config";
import { Request, RequestHandler, Response, Next } from "restify";

export default function(overrides?: IConfig): RequestHandler {
  const config = mergeOverridesWithDefaults(overrides);

  return async (req: any, res: Response, next: Next) => {
    try {
      if (req.header(config.headers.id) === undefined) {
        throw new BadRequestError("id header must be provided");
      } else if (req.header(config.headers.timestamp) === undefined) {
        throw new BadRequestError("timestamp header must be provided");
      } else if (req.header(config.headers.algorithm) === undefined) {
        throw new BadRequestError("algorithm header must be provided");
      } else if (req.header(config.headers.signature) === undefined) {
        throw new BadRequestError("signature header must be provided");
      }

      const now = new Date().getTime();
      const requestIssuedAt = new Date(req.header(config.headers.timestamp)).getTime();

      if ((now - requestIssuedAt) > (config.toleranceInSeconds * 1000)) {
        throw new ExpiredRequestError("The request has expired");
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
        throw new InvalidSignatureError("The provided signature is not valid");
      }
    } catch (err) {
      return next(err);
    }

    return next();
  };
}
