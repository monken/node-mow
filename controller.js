var _ = require('lodash'),
  Promise = require('bluebird');

module.exports = require('./component').extend({
  initActions: function() {
    _.forEach(this.actions || {}, this.initAction, this);
  },
  initAction: function(action, path) {
    if (_.isString(action.path)) path = action.path;
    if (!path.match(/^\//) && path !== '') return; // actions start with a slash
    var app = this.express,
      actions = this.actions || {};
    path = ['', this.configKey].join('/') + path;
    var handlers = action.handler;
    if (!_.isArray(handlers)) handlers = [handlers];

    action.method = action.method || 'get';
    var methods = action.method;
    if (!_.isArray(methods)) methods = [methods];
    methods.forEach(function(method) {
      this.logger.debug(method.toUpperCase() + '\t' + path);
      ['begin', 'end'].forEach(function(sAction) {
        if (!actions[sAction]) return;
        sHandlers = actions[sAction].handler;
        if (!_.isArray(sHandlers)) sHandlers = [sHandlers];
        if (actions[sAction].method.indexOf(method) !== -1)
          handlers[sAction === 'begin' ? 'unshift' : 'push'].apply(handlers, sHandlers);
      }, this);
      handlers = handlers.map(function(handler) {
        return function(req, res, next) {
          try {
            var ret = _.isString(handler) ? this[handler].call(this, req, res, next) : handler.call(this, req, res, next);
            if (ret && !(ret instanceof Promise)) ret = Promise.resolve(ret);
            if (ret instanceof Promise) ret.then(function(body) {
              res.body = body;
              next();
            }, next);
          } catch (e) {
            next(e);
          };
        }.bind(this);
      }, this);
      handlers.unshift(function(req, res, next) {
        this.logger.debug(method.toUpperCase(), path, ' with params', req.params);
        next();
      }.bind(this));
      handlers.unshift(path);
      if (actions.catch) {
        handlers.push(function(err, req, res, next) {
          Promise.try(function() {
            return actions.catch.handler.call(this, err, req, res, next);
          }.bind(this)).then(function() {
            next()
          }, next);
        }.bind(this));
      }
      app[method].apply(app, handlers);
      handlers.shift();
    }, this);
  },
  initViews: function() {
    if (!this.views) return;
    this.views = this.initComponentWith(this.views, this.cwd + '/view/');
  },
  initModels: function() {
    if (!this.models) return;
    this.models = this.initComponentWith(this.models, this.cwd + '/model/');
  },
  getView: function(name, clone) {
    return this.getComponent('views', name, clone);
  },
  getModel: function(name, clone) {
    return this.getComponent('models', name, clone);
  },
  handleError: function(req, res, e) {
    res.status(500).send('an error occurred\n');
  },
}, {
  attributes: {
    actions: {
      required: true,
      initializer: 'initActions',
    },
    cwd: {
      required: true,
    },
    configKey: {
      required: true,
    },
    express: {
      required: true,
    },
    getController: {
      required: true,
    },
    views: {},
    models: {},
  },
});
