const { createHmac } = require('crypto');

class Signature {
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

module.exports = Signature;
