import axios from 'axios';
import * as nock from 'nock';
import * as uuid from 'uuid';
import { expect } from 'chai';
import { stub, useFakeTimers } from 'sinon';
import Config, { defaultConfig } from '../../src/config';
import axiosRequestSigner from '../../src/axios/request-signer-middleware';

describe('RequestSignerMiddleware', function() {
  const baseURL = 'https://localhost';
  const id = '303103f5-3dca-4704-96ad-860717769ec9';
  const now = '2001-01-01 00:00:00';
  const algorithm = 'sha256';
  const key = 'key';
  let config: Config;
  let clock;
  let uuidStub;

  beforeEach(() => {
    let headers = {};
    config = { algorithm, key, headers };
    clock = useFakeTimers(new Date(now).getTime());
    uuidStub = stub(uuid, 'v4').callsFake(() => id);
  });

  afterEach(() => {
    clock.restore();
    uuidStub.restore();
  });

  it('sets the correct headers on the request by default', async function() {
    nock(baseURL)
      .get('/')
      .reply(function(uri, requestBody) {
        expect(this.req.headers).to.include.all.keys(
          Object.values(defaultConfig.headers),
        );

        return [200];
      });

    const axiosInstance = axios.create({ baseURL });

    axiosInstance.interceptors.request.use(axiosRequestSigner(config));

    await axiosInstance.get('/');
  });

  describe('id header', function() {
    it('can be configured', async function() {
      config.headers.id = 'custom-signed-id';

      nock(baseURL)
        .get('/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers).to.include.keys('custom-signed-id');
          expect(this.req.headers).to.not.include.keys(defaultConfig.headers.id);

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.get('/');
    });

    it('sets the id header with the correct value', async function() {
      nock(baseURL)
        .get('/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers[defaultConfig.headers.id]).to.equal(id);

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.get('/');
    });
  });

  describe('timestamp header', function() {
    it('can be configured', async function() {
      config.headers.timestamp = 'custom-signed-timestamp';

      nock(baseURL)
        .get('/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers).to.include.keys('custom-signed-timestamp');
          expect(this.req.headers).to.not.include.keys(defaultConfig.headers.timestamp);

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.get('/');
    });

    it('sets the timestamp header with the correct value', async function() {
      nock(baseURL)
        .get('/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers[defaultConfig.headers.timestamp]).to.equal(now);

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.get('/');
    });
  });

  describe('algorithm header', function() {
    it('can be configured', async function() {
      config.headers.algorithm = 'custom-algorithm';

      nock(baseURL)
        .get('/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers).to.include.keys('custom-algorithm');
          expect(this.req.headers).to.not.include.keys(defaultConfig.headers.algorithm);

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.get('/');
    });

    it('sets the algorithm header with the correct value', async function() {
      nock(baseURL)
        .get('/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers[defaultConfig.headers.algorithm]).to.equal(algorithm);

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.get('/');
    });
  });

  describe('signature header', function() {
    it('can be configured', async function() {
      config.headers.signature = 'custom-signature';

      nock(baseURL)
        .get('/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers).to.include.keys('custom-signature');
          expect(this.req.headers).to.not.include.keys(defaultConfig.headers.signature);

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.get('/');
    });

    it('contains the proper value for simple POSTs', async function() {
      nock(baseURL)
        .post('/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers[defaultConfig.headers.signature]).to.equal(
            'b9f912a4fc4b2952a48380579d3e4a1c55c0537ce583b3da7cc9f6c67fe4caa7'
          );

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.post('/', { test: 'test' });
    });

    it('contains the proper value for simple POSTs containing ã character', async function() {
      nock(baseURL)
        .post('/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers[defaultConfig.headers.signature]).to.equal(
            'd35d92484222fce7e5c194381e5f53342caae6fa626cd61e3431bddc549b34e1'
          );

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.post('/', { test: 'ã' });
    });

    it('contains the proper value for simple POSTs containing 好 character', async function() {
      nock(baseURL)
        .post('/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers[defaultConfig.headers.signature]).to.equal(
            '65ff94dce4894eb306a76ff0d397ec264b1c4980b57afbc3dd9526af242d239b'
          );

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.post('/', { test: '好' });
    });

    it('contains the proper value for simple POSTs containing a url', async function() {
      nock(baseURL)
        .post('/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers[defaultConfig.headers.signature]).to.equal(
            'ebd68bfe7ed51c050fb92db098946cd21b7b23be6f682360a5e893840a1dc52f'
          );

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.post('/', { test: baseURL });
    });

    it('contains the proper value for complex POSTs', async function() {
      nock(baseURL)
        .post('/poop')
        .reply(function(uri, requestBody) {
          expect(this.req.headers[defaultConfig.headers.signature]).to.equal(
            '0c3f0c81ba1fa3df9d3e0a1d72c4d491125153c0dea8355b6d48fe7ef1a4dacc'
          );

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.post('/poop', {
        users: [{
          id: 1,
          name: 'Chris Hayes',
          email: 'hayes@soapboxhq.com',
        }, {
          id: 2,
          name: 'Jaspaul Bola',
          email: 'jaspaul@soapboxhq.com',
        }, {
          id: 3,
          name: 'Mr Penã 💩',
          email: 'Mr-Penã@soapboxhq.com',
        }],
      });
    });

    it('contains the proper value when the URL has a trailing slash', async function() {
      nock(baseURL)
        .post('/poop/')
        .reply(function(uri, requestBody) {
          expect(this.req.headers[defaultConfig.headers.signature]).to.equal(
            '0c3f0c81ba1fa3df9d3e0a1d72c4d491125153c0dea8355b6d48fe7ef1a4dacc'
          );

          return [200];
        });

      const axiosInstance = axios.create({ baseURL });

      axiosInstance.interceptors.request.use(axiosRequestSigner(config));

      await axiosInstance.post('/poop/', {
        users: [{
          id: 1,
          name: 'Chris Hayes',
          email: 'hayes@soapboxhq.com',
        }, {
          id: 2,
          name: 'Jaspaul Bola',
          email: 'jaspaul@soapboxhq.com',
        }, {
          id: 3,
          name: 'Mr Penã 💩',
          email: 'Mr-Penã@soapboxhq.com',
        }],
      });
    });
  });
});
