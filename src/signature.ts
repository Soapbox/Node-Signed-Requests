import { createHmac } from "crypto";

export default class Signature {
  private signature: string;

  constructor(payload: string, algorithm: string, key: string) {
    this.signature = createHmac(algorithm, key)
      .update(payload)
      .digest("hex");
  }

  public equals(signature: Signature|string): boolean {
    if (signature instanceof Signature) {
      signature = signature.toString();
    }

    return signature === this.signature;
  }

  public toString(): string {
    return this.signature;
  }
}
