export default class Payload {
  constructor(
    private id: string,
    private method: string,
    private timestamp: string,
    private uri: string,
    private content: string|object
  ) {}

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
