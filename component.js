var _ = require('lodash'),
  util = require('util'),
  find = require('find');

var Component = module.exports = function(args) {
  args = args || {};
  this.isInstance = true;
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
    if (value === config.default && _.isFunction(value)) value = value.apply(this);
    if (_.isUndefined(value) && config.builder) value = this[config.builder].apply(this);
    if (config.required && (_.isUndefined(value) || _.isNull(value))) {
      this.throw('AttributeRequired', 'attribute "%s" is required', attr);
    }
    this[attr] = value;
  },
  initComponentsFromPath: function(path, config, defaults) {
    var components = {};
    find.fileSync(/\.js$/, path).forEach(function(file) {
      var name = file.substr(path.length).replace(/\.js$/, '');
      var wildcard = name.replace(/[^\/]+$/, '*');
      components[name] = {
        name: file,
        arguments: _.defaults({
          file: file,
        }, config[name], config[wildcard], defaults, {
          configKey: name,
        }),
      };
    }, this);
    return this.initComponentsWith(components);
  },
  initComponentsWith: function(components, config) {
    config = config || {};
    if (!_.isArray(components) && !_.isPlainObject(components)) components = [components];
    var collection = {};
    _.forEach(components, function(component, name) {
      var Constructor, config;
      if (_.isString(component))
        Constructor = require(component);
      else if (_.isPlainObject(component)) {
        Constructor = require(component.name);
        config = _.defaults({
          logger: this.logger,
          cwd: this.cwd,
        }, component.arguments, config);
        name = _.isNumber(name) ? component.name : name;
      } else Constructor = component;
      if (_.isFunction(Constructor)) {
        if (Constructor.isInstance) collection[name] = Constructor;
        else collection[name] = new Constructor(config);
        this.logger.debug('component %s initialized', component.arguments.configKey || name);
      }
    }, this);
    return collection;
  },
  getComponent: function(attr, name, clone) {
    clone = clone || {};
    if (!this[attr][name]) this.throw('ComponentNotFound', '%s "%s" doesn\'t exist', attr, name);
    if(clone) return this[attr][name].clone(clone);
    else return this[attr][name];
  },
  callInitializers: function() {
    _.forEach(this.constructor.attributes, function(config, attr) {
      if (_.isFunction(config.initializer))
        config.initializer.apply(this, arguments);
      else if (_.isString(config.initializer))
        this[config.initializer].apply(this, arguments);
    }, this);
  },
  clone: function(attrs) {
    var attributes = _.pick(this, _.keys(this.constructor.attributes));
    return new this.constructor(_.extend(attributes, attrs));
  },
  throw: function(name, message) {
    var args = [].slice.call(arguments, 2);
    args.unshift(message);
    if(_.isPlainObject(args[args.length - 1]))
      var context = args.pop();
    var e = new Error();
    _.extend(e, {
      name: name,
      context: context,
      message: util.format.apply(util, args)
    });
    throw e;
  },
});
_.extend(Component, {
  attributes: {
    cwd: {
      required: true,
      default: function() {
        return process.cwd();
      },
    },
    logger: {
      required: true,
      default: console,
    },
    config: {
      required: true,
      default: function() { return {}; },
    },
    file: {
    },
  }
});
