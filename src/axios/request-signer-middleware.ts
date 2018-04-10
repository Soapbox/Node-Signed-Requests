import * as uuid from "uuid";
import * as moment from "moment";
import Payload from "../payload";
import Signature from "../signature";
import { AxiosRequestConfig } from "axios";
import { removeTrailingSlash } from "../utils";
import { IConfig, mergeOverridesWithDefaults } from "../config";

export default function(overrides?: IConfig): (c: AxiosRequestConfig) => AxiosRequestConfig {
  const config = mergeOverridesWithDefaults(overrides);

  return (requestConfig: AxiosRequestConfig): AxiosRequestConfig => {
    const id = uuid.v4();
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    const url = removeTrailingSlash(`${requestConfig.baseURL}${requestConfig.url}`);
    const payload = new Payload(id, requestConfig.method, timestamp, url, requestConfig.data);
    const signature = new Signature(payload.toString(), config.algorithm, config.key);

    requestConfig.headers = requestConfig.headers || {};
    requestConfig.headers[config.headers.id] = id;
    requestConfig.headers[config.headers.timestamp] = timestamp;
    requestConfig.headers[config.headers.algorithm] = config.algorithm;
    requestConfig.headers[config.headers.signature] = signature.toString();

    return requestConfig;
  };
}
