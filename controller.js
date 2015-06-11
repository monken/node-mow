var _ = require('lodash'),
  Promise = require('bluebird');

module.exports = require('./component').extend({
  initActions: function() {
    _.forEach(this.actions || {}, this.initAction, this);
  },
  initAction: function(action, path) {
    if (!path.match(/^\//)) return; // actions start with a slash
    var app = this.express,
      actions = this.actions || {};
    path = ['', this.base].join('/') + path;
    this.logger.debug(path);
    var handlers = action.handler;
    if (!_.isArray(handlers)) handlers = [handlers];

    action.method = action.method || 'get';
    var methods = action.method;
    if (!_.isArray(methods)) methods = [methods];
    methods.forEach(function(method) {
      ['begin', 'end'].forEach(function(sAction) {
        if (!actions[sAction]) return;
        sHandlers = actions[sAction].handler;
        if (!_.isArray(sHandlers)) sHandlers = [sHandlers];
        if (actions[sAction].method.indexOf(method) !== -1)
          handlers[sAction === 'begin' ? 'unshift' : 'push'].apply(handlers, sHandlers);
      }, this);
      handlers = handlers.map(function(handler) {
        return function(req, res, next) {
          this.logger.debug('calling controller', path, ' with params', req.params);
          try {
            var ret = _.isString(handler) ? this[handler].apply(this, arguments) : handler.apply(this, arguments);
            if (ret instanceof Promise) ret.then(next, function(e) {
              if (actions.catch) actions.catch.handler.call(this, req, res, e);
              if (actions.end) actions.end.handler.call(this, req, res);
            }.bind(this));
          } catch (e) {
            if (actions.catch) actions.catch.handler.call(this, req, res, e);
            if (actions.end) actions.end.handler.call(this, req, res);
          };
        }.bind(this);
      }, this);
      handlers.unshift(path);
      app[method].apply(app, handlers);
      handlers.shift();
    }, this);
  },
  initViews: function() {
    if (!this.views) return;
    this.views = this.initComponentWith(this.views, '../../view/');
  },
  initModels: function() {
    if (!this.models) return;
    this.models = this.initComponentWith(this.models, '../../model/');
  },
  getView: function(view) {
    if (!this.views[view]) this.throw('ViewNotFound', 'view "%s" doesn\'t exist', view);
    return this.views[view];
  },
  getModel: function(model) {
    if (!this.models[model]) this.throw('ModelNotFound', 'model "%s" doesn\'t exist', model);
    return this.models[model];
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
    base: {
      required: true,
    },
    express: {
      required: true,
    },
    views: {
      initializer: 'initViews',
    },
    models: {
      initializer: 'initModels',
    },
  },
});
