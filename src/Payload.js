const Payload = function Payload(id, method, timestamp, uri, content) {
  this.id = id;
  this.method = method;
  this.timestamp = timestamp;
  this.uri = uri;
  this.content = content;
};

Payload.prototype.toString = function() {
  return JSON.stringify({
    id: this.id,
    method: this.method,
    timestamp: this.timestamp,
    uri: this.uri,
    content: this.content,
  });
};

module.exports = Payload;
