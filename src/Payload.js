class Payload {
  constructor(id, method, timestamp, uri, content) {
    this.id = id;
    this.method = method;
    this.timestamp = timestamp;
    this.uri = uri;
    this.content = content;
  }

  getProperlyFormedContent() {
    if (typeof this.content === 'object') {
      return JSON.stringify(this.content);
    }

    return this.content;
  }

  toString() {
    return JSON.stringify({
      id: this.id,
      method: this.method,
      timestamp: this.timestamp,
      uri: this.uri,
      content: this.getProperlyFormedContent(),
    });
  }
}

module.exports = Payload;
