export default interface Config {
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
