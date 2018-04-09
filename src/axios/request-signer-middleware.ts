import * as uuid from 'uuid';
import * as moment from 'moment';
import Payload from '../payload';
import Signature from '../signature';
import { AxiosRequestConfig } from "axios";
import Config, { mergeOverridesWithDefaults } from '../config';

function removeTrailingSlash(str: string): string {
  return str.replace(/\/+$/, "");
}

export default function(overrides?: Config): any {
  const config = mergeOverridesWithDefaults(overrides);

  return (requestConfig: AxiosRequestConfig): AxiosRequestConfig => {
    const id = uuid.v4();
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
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
