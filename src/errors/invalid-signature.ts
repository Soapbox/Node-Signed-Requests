import { BadRequestError } from "restify-errors";

export default class InvalidSignature extends BadRequestError {
}
