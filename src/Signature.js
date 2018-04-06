const { createHmac } = require('crypto');

const Signature = function Signature(payload, algorithm, key) {
  this.signature = createHmac(algorithm, key)
    .update(payload)
    .digest("hex");
};

Signature.prototype.equals = function(signature) {
  if (typeof signature === 'object') {
    signature = signature.toString();
  }

  return signature === this.signature;
};

Signature.prototype.toString = function() {
  return this.signature;
};

module.exports = Signature;
