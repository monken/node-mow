var assert = require('assert'),
  _ = require('lodash'),
  PromiseA = require('bluebird');

var Component = require('../mow/component');

describe('component', function() {
  it('constructor', function() {
    assert.ok(_.isFunction(Component), 'Component is a function');
    assert.ok(_.isFunction(Component.extend), 'Component has "extend" function');
  });
  it('defaults', function() {
    var c = new Component();
    assert.equal(c.logger, c.constructor.attributes.logger.default, 'Default attribute value');
  });
  it('constructorAttr', function() {
    var c = new Component({
      logger: new Date
    });
    assert.ok(c.logger instanceof Date, 'Attribute value from args takes precedence');
  });
  it('requiredAttrs', function() {
    assert.throws(function() {
      var c = new Component({
        logger: null
      });
    }, 'required attributes cannot be null/undefined');
  });

  it('Promise isa Promise', function() {
    var p = PromiseA.resolve();
    assert.ok(p instanceof Promise, 'promise is a promise');
  });
});
