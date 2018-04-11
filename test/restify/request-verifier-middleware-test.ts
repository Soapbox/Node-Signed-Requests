import axios, { AxiosInstance } from "axios";
import * as uuid from "uuid";
import { expect } from "chai";
import { createServer, plugins, Server } from "restify";
import { stub, useFakeTimers } from "sinon";
import { IConfig, defaultConfig, mergeOverridesWithDefaults } from "../../src/config";
import axiosRequestSigner from "../../src/axios/request-signer-middleware";
import restifyRequestVerifier from "../../src/restify/request-verifier-middleware";

describe("RequestVerifierMiddleware", () => {
  const host = "127.0.0.1";
  const port = 8080;
  const baseURL = `http://${host}:${port}`;
  const id = "303103f5-3dca-4704-96ad-860717769ec9";
  const now = "2001-01-01 00:00:00";
  const algorithm = "sha256";
  const key = "key";
  let config: IConfig;
  let clock;
  let uuidStub;
  let server: Server;
  let axiosInstance: AxiosInstance;

  beforeEach(() => {
    config = { algorithm, key };

    server = createServer({ ignoreTrailingSlash: true } as any);
    server.use(plugins.bodyParser());
    server.use(restifyRequestVerifier(config));
    server.listen(port, host);

    axiosInstance = axios.create({ baseURL });

    clock = useFakeTimers({
      now: new Date(now).getTime(),
      toFake: ["Date"],
    });
    uuidStub = stub(uuid, "v4").callsFake(() => id);
  });

  afterEach(() => {
    server.close();

    clock.restore();
    uuidStub.restore();
  });

  describe("allows valid requests", () => {
    it("validates signature when request signature is valid", async () => {
      server.post("/", (req, res, next) => {
        res.send(200);
        next();
      });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      const response = await axiosInstance.post("/", { body: "truth" });

      expect(response.status).to.equal(200);
    });

    it("validates signature when request signature is valid and headers are uppercase", async () => {
      server.post("/", (req, res, next) => {
        res.send(200);
        next();
      });

      config = mergeOverridesWithDefaults(config);

      for (const k in config.headers) {
        if (config.headers.hasOwnProperty(k)) {
          config.headers[k] = config.headers[k].toUpperCase();
        }
      }

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      const response = await axiosInstance.post("/", { body: "truth" });

      expect(response.status).to.equal(200);
    });

    it("validates signature when URL has a trailing slash", async () => {
      server.post("/endpoint", (req, res, next) => {
        res.send(200);
        next();
      });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      const response = await axiosInstance.post("/endpoint/", { body: "truth" });

      expect(response.status).to.equal(200);
    });

    it("validates signature when payload has unicode characters", async () => {
      server.post("/", (req, res, next) => {
        res.send(200);
        next();
      });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      const response = await axiosInstance.post("/", { body: "💩" });

      expect(response.status).to.equal(200);
    });
  });

  describe("denies invalid requests", () => {
    it("returns 400 when request id header is missing", async () => {
      server.post("/", (req, res, next) => {
        // tslint:disable-next-line:no-unused-expression
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use((requestConfig) => {
        delete requestConfig.headers[defaultConfig.headers.id];
        return requestConfig;
      });
      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      try {
        await axiosInstance.post("/", { body: "truth" });
      } catch ({ response }) {
        expect(response.status).to.equal(400);
        expect(response.data).to.deep.equal(
          { code: "BadRequest", message: "id header must be provided"},
        );
      }
    });

    it("returns 400 when request timestamp header is missing", async () => {
      server.post("/", (req, res, next) => {
        // tslint:disable-next-line:no-unused-expression
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use((requestConfig) => {
        delete requestConfig.headers[defaultConfig.headers.timestamp];
        return requestConfig;
      });
      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      try {
        await axiosInstance.post("/", { body: "truth" });
      } catch ({ response }) {
        expect(response.status).to.equal(400);
        expect(response.data).to.deep.equal(
          { code: "BadRequest", message: "timestamp header must be provided"},
        );
      }
    });

    it("returns 400 when request timestamp header value is not a valid timestamp", async () => {
      server.post("/", (req, res, next) => {
        // tslint:disable-next-line:no-unused-expression
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use((requestConfig) => {
        requestConfig.headers[defaultConfig.headers.timestamp] = "not a timestamp";
        return requestConfig;
      });
      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      try {
        await axiosInstance.post("/", { body: "truth" });
      } catch ({ response }) {
        expect(response.status).to.equal(400);
        expect(response.data).to.deep.equal(
          { code: "BadRequest", message: "timestamp header value must be a valid timestamp"},
        );
      }
    });

    it("returns 400 when request algorithm header is missing", async () => {
      server.post("/", (req, res, next) => {
        // tslint:disable-next-line:no-unused-expression
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use((requestConfig) => {
        delete requestConfig.headers[defaultConfig.headers.algorithm];
        return requestConfig;
      });
      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      try {
        await axiosInstance.post("/", { body: "truth" });
      } catch ({ response }) {
        expect(response.status).to.equal(400);
        expect(response.data).to.deep.equal(
          { code: "BadRequest", message: "algorithm header must be provided"},
        );
      }
    });

    it("returns 400 when request signature header is missing", async () => {
      server.post("/", (req, res, next) => {
        // tslint:disable-next-line:no-unused-expression
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use((requestConfig) => {
        delete requestConfig.headers[defaultConfig.headers.signature];
        return requestConfig;
      });
      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      try {
        await axiosInstance.post("/", { body: "truth" });
      } catch ({ response }) {
        expect(response.status).to.equal(400);
        expect(response.data).to.deep.equal(
          { code: "BadRequest", message: "signature header must be provided"},
        );
      }
    });

    it("returns 400 when signature is invalid", async () => {
      server.post("/", (req, res, next) => {
        // tslint:disable-next-line:no-unused-expression
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use((requestConfig) => {
        requestConfig.headers[defaultConfig.headers.signature] = "invalid-signature";
        return requestConfig;
      });
      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      try {
        await axiosInstance.post("/", { body: "truth" });
      } catch ({ response }) {
        expect(response.status).to.equal(400);
        expect(response.data).to.deep.equal(
          { code: "BadRequest", message: "The provided signature is not valid"},
        );
      }
    });

    it("returns 400 when request has expired", async () => {
      server.post("/", (req, res, next) => {
        // tslint:disable-next-line:no-unused-expression
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      // Advance the clock to simulate a delayed/expired request
      server.pre((req, res, next) => {
        clock.tick((defaultConfig.toleranceInSeconds + 1) * 1000);
        next();
      });

      try {
        await axiosInstance.post("/", { body: "truth" });
      } catch ({ response }) {
        expect(response.status).to.equal(400);
        expect(response.data).to.deep.equal(
          { code: "BadRequest", message: "The request has expired"},
        );
      }
    });
  });
});
