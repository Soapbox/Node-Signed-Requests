import { createHmac } from 'crypto';

export default class Signature {
  signature: string;

  constructor(payload, algorithm, key) {
    this.signature = createHmac(algorithm, key)
      .update(payload)
      .digest("hex");
  }

  equals(signature) {
    if (typeof signature === 'object') {
      signature = signature.toString();
    }

    return signature === this.signature;
  }

  toString() {
    return this.signature;
  }
}
