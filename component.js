var _ = require('lodash'),
	util = require('util');

var Component = module.exports = function(args) {
	args = args || {};
	this.initAttributes(args);
	this.callInitializers();
};

Component.extend = require('./extend');

_.extend(Component.prototype, {
	initAttributes: function(args) {
		_.forEach(this.constructor.attributes, function(value, attr) {
			this.initAttribute(value, attr, args);
		}, this);
	},
	initAttribute: function(config, attr, args) {
		var value = _.without([args[attr], this[attr], config.default], undefined)[0];
		if(value === config.default && _.isFunction(value)) value = value.apply(this);
		if(_.isUndefined(value) && config.builder) value = this[config.builder].apply(this);
		if(config.required && (_.isUndefined(value) || _.isNull(value))) {
			this.throw('AttributeRequired', 'attribute "' + attr + '" is required');
		}
		this[attr] = value;
	},
	initComponentWith: function(components, base, config) {
    config = config || {};
    if (!_.isArray(components) && !_.isPlainObject(components)) components = [components];
    var collection = {};
    _.forEach(components, function(component, name) {
      var Constructor;
      if (_.isString(component))
        Constructor = require(base + component);
      else if (_.isPlainObject(component)) {
        Constructor = require(base + component.name);
        config = _.extend(config, component.arguments);
        component = _.isNumber(name) ? component.name : name;
      } else Constructor = component;
      if (_.isFunction(Constructor)) {
        this.logger.debug('component ' + base + component + ' initialized');
        collection[component] = new Constructor(config);
      }
    }, this);
    return collection;
  },
	callInitializers: function() {
		_.forEach(this.constructor.attributes, function(config, attr) {
			if(_.isFunction(config.initializer))
				config.initializer.apply(this, arguments);
			else if(_.isString(config.initializer))
				this[config.initializer].apply(this, arguments);
		}, this);
	},
	throw: function(name, message) {
		var args = [].slice.call(arguments, 2);
		args.unshift(message);
		throw { name: name, message: util.format.apply(util, args) };
	},
});
_.extend(Component, {
	attributes: {
		logger: {
			required: true,
			default: console,
		},
		config: {
			required: true,
			default: {},
		},
	}
});
