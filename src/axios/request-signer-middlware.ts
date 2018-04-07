import * as uuid from 'uuid';
import { AxiosRequestConfig } from "axios";
import Signature from '../signature';
import Payload from '../payload';
import * as moment from 'moment';

export interface Config {
  algorithm: string,
  key: string,
  headers?: {
    id?: string;
    timestamp?: string;
    algorithm?: string;
    signature?: string;
  }
};

export const defaultHeaders = Object.freeze({
  id: 'x-signed-id',
  timestamp: 'x-signed-timestamp',
  algorithm: 'x-algorithm',
  signature: 'x-signature',
});

function removeTrailingSlash(str: string): string {
  return str.replace(/\/+$/, "");
}

export default function(config?: Config): any {
  config.headers = Object.assign({}, defaultHeaders, config.headers);

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
