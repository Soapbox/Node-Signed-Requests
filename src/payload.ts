export default class Payload {
  constructor(
    private id: string,
    private method: string,
    private timestamp: string,
    private uri: string,
    private content: string|object,
  ) {}

  public toString(): string {
    return JSON.stringify({
      id: this.id,
      method: this.method.toUpperCase(),
      timestamp: this.timestamp,
      uri: this.uri,
      content: this.getProperlyFormedContent(),
    });
  }

  private getProperlyFormedContent(): string {
    if (typeof this.content === "object") {
      return JSON.stringify(this.content);
    }

    if (this.content === undefined) {
      return "";
    }

    return this.content;
  }
}
