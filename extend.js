var _ = require('lodash');

module.exports = function extend(protoProps, staticProps) {
  var parent = this;
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && _.has(protoProps, 'constructor')) {
    child = function() {
      parent.apply(this, arguments);
      protoProps.constructor.apply(this, arguments);
    };
  } else {
    child = function() {
      return parent.apply(this, arguments);
    };
  }

  // Add static properties to the constructor function, if supplied.
  _.extend(child, parent);
  _.extend(child, staticProps);

  ['attributes'].forEach(function(attribute) {
    if(staticProps) _.extend(child[attribute], staticProps[attribute]);
    _.defaults(child[attribute], parent[attribute]);
  });

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  var Surrogate = function() {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate;

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) _.extend(child.prototype, protoProps);

  ['actions'].forEach(function(attribute) {
    if(protoProps) _.extend(child.prototype[attribute], parent.prototype[attribute]);
  });

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype;

  return child;
};
