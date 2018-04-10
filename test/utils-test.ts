import { expect } from "chai";
import { removeTrailingSlash } from "../src/utils";

describe("Utils", () => {
  describe("removeTrailingSlash", () => {
    it("leaves strings without trailing slashes as is", () => {
      const url = "https://google.ca";

      expect(removeTrailingSlash(url)).to.equal("https://google.ca");
    });

    it("removes single trailing slash", () => {
      const url = "https://google.ca/";

      expect(removeTrailingSlash(url)).to.equal("https://google.ca");
    });

    it("removes multiple trailing slashes", () => {
      const url = "https://google.ca///";

      expect(removeTrailingSlash(url)).to.equal("https://google.ca");
    });
  });
});
