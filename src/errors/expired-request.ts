import { BadRequestError } from "restify-errors";

export default class ExpiredRequest extends BadRequestError {
}
