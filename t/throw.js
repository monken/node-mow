var assert = require('assert'),
  Component = require('../component');

describe('component', function() {
  it('throws', function() {
    var c = new Component();
    try {
      c.throw('ExceptionName', 'message with %s variable and context', 1, {
        foo: 'bar'
      });
    } catch (e) {
      assert.equal(e.message, 'message with 1 variable and context');
      assert.deepEqual(e.context, {
        foo: 'bar'
      });
    }
  });
});
