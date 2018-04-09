import * as merge from 'deepmerge';

export default interface Config {
  algorithm: string,
  key: string,
  toleranceInSeconds?: number,
  headers?: {
    id?: string;
    timestamp?: string;
    algorithm?: string;
    signature?: string;
  }
};

export const defaultConfig = Object.freeze({
  toleranceInSeconds: 60,
  headers: {
    id: 'x-signed-id',
    timestamp: 'x-signed-timestamp',
    algorithm: 'x-algorithm',
    signature: 'x-signature',
  },
});

export function mergeOverridesWithDefaults(config: Config) {
  return merge(defaultConfig, config);
}
