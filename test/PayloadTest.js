const assert = require('assert');
const Payload = require('../src/Payload');

describe('Payload', function() {
  it('it can be constructed', function() {
    const id = '12345';
    const method = 'GET';
    const timestamp = new Date().toString();
    const uri = 'https://localhost';
    const content = 'content';

    assert.ok(new Payload(id, method, timestamp, uri, content));
  });

  describe('toString()', function () {

  });
});
