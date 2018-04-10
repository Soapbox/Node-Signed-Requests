import axios from 'axios';
import * as uuid from 'uuid';
import { expect } from 'chai';
import { createServer } from 'restify';
import { stub, useFakeTimers } from 'sinon';
import Config, { defaultConfig } from '../../src/config';
import axiosRequestSigner from '../../src/axios/request-signer-middleware';
import restifyRequestVerifier from '../../src/restify/request-verifier-middleware';

describe('RequestVerifierMiddleware', function() {
  const port = 8080;
  const baseURL = `http://[::]:${port}`;
  const id = '303103f5-3dca-4704-96ad-860717769ec9';
  const now = '2001-01-01 00:00:00';
  const algorithm = 'sha256';
  const key = 'key';
  let config: Config;
  let clock;
  let uuidStub;
  let server;
  let axiosInstance;

  beforeEach(function() {
    config = { algorithm, key };

    server = createServer();
    server.use(restifyRequestVerifier(config));
    server.listen(port);

    axiosInstance = axios.create({ baseURL });

    clock = useFakeTimers({
      now: new Date(now).getTime(),
      toFake: ['Date'],
    });
    uuidStub = stub(uuid, 'v4').callsFake(() => id);
  });

  afterEach(function() {
    server.close();

    clock.restore();
    uuidStub.restore();
  });

  it('allows request when signature is valid', async function() {
    server.post('/', function(req, res, next) {
      res.send(200);
      next();
    });

    axiosInstance.interceptors.request.use(axiosRequestSigner(config));

    const response = await axiosInstance.post('/');

    expect(response.status).to.equal(200);
  });

  describe('denies invalid requests', function() {
    it('returns 400 when request id header is missing', async function() {
      server.post('/', function(req, res, next) {
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use(function(config) {
        delete config.headers[defaultConfig.headers.id];
        return config;
      });
      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      try {
        await axiosInstance.post('/');
      } catch ({ response }) {
        expect(response.status).to.equal(400);
        expect(response.data).to.deep.equal(
          { code: 'BadRequest', message: 'id header must be provided'}
        );
      }
    });

    it('returns 400 when request timestamp header is missing', async function() {
      server.post('/', function(req, res, next) {
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use(function(config) {
        delete config.headers[defaultConfig.headers.timestamp];
        return config;
      });
      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      try {
        await axiosInstance.post('/');
      } catch ({ response }) {
        expect(response.status).to.equal(400);
        expect(response.data).to.deep.equal(
          { code: 'BadRequest', message: 'timestamp header must be provided'}
        );
      }
    });

    it('returns 400 when request algorithm header is missing', async function() {
      server.post('/', function(req, res, next) {
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use(function(config) {
        delete config.headers[defaultConfig.headers.algorithm];
        return config;
      });
      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      try {
        await axiosInstance.post('/');
      } catch ({ response }) {
        expect(response.status).to.equal(400);
        expect(response.data).to.deep.equal(
          { code: 'BadRequest', message: 'algorithm header must be provided'}
        );
      }
    });

    it('returns 400 when request signature header is missing', async function() {
      server.post('/', function(req, res, next) {
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use(function(config) {
        delete config.headers[defaultConfig.headers.signature];
        return config;
      });
      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      try {
        await axiosInstance.post('/');
      } catch ({ response }) {
        expect(response.status).to.equal(400);
        expect(response.data).to.deep.equal(
          { code: 'BadRequest', message: 'signature header must be provided'}
        );
      }
    });

    it('returns 400 when signature is invalid', async function() {
      server.post('/', function(req, res, next) {
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use(function(config) {
        config.headers[defaultConfig.headers.timestamp] = 'invalid-signature';
        return config;
      });
      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      try {
        await axiosInstance.post('/');
      } catch ({ response }) {
        expect(response.status).to.equal(400);
      }
    });

    it('returns 400 when request has expired', async function() {
      server.post('/', function(req, res, next) {
        expect(false).to.be.true; // this should never be called
      });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      // Advance the clock to simulate a delayed/expired request
      server.pre(function(req, res, next) {
        clock.tick((defaultConfig.toleranceInSeconds + 1) * 1000);
        next();
      });

      try {
        await axiosInstance.post('/');
      } catch ({ response }) {
        expect(response.status).to.equal(400);
      }
    });
  });
});