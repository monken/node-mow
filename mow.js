var _ = require('lodash'),
  http = require('http');

module.exports = require('./component').extend({
  buildControllers: function() {
    this.initUse();
    this.buildModels();
    this.buildViews();
    var dir = this.cwd + '/controller/';
    this.controllers = this.initComponentsFromPath(dir, this.controllers, {
      express: this.express,
      cwd: this.cwd,
      models: this.models,
      views: this.views,
      logger: this.logger,
      getController: function(name) {
        return this.controllers[name];
      }.bind(this),
    });
    return;
  },
  buildModels: function() {
    this.buildStores();
    var dir = this.cwd + '/model/';
    this.models = this.initComponentsFromPath(dir, this.models, { _stores: this.stores });
  },
  buildViews: function() {
    var dir = this.cwd + '/view/';
    this.views = this.initComponentsFromPath(dir, this.views);
  },
  buildStores: function() {
    var dir = this.cwd + '/store/';
    this.stores = this.initComponentsFromPath(dir, this.stores);
  },
  run: function() {
    var server = http.createServer(this.express);
    server.on('error', function(e) {
      if (e.code === 'EADDRINUSE') this.logger.fatal('port %s already in use', this.listen.port);
    }.bind(this));

    server.listen(this.listen.port, this.listen.host, function(err) {
      this.logger.info('listening on http://' + [this.listen.host, this.listen.port].join(':'));
    }.bind(this));

  },
  initUse: function() {
    if (this._initUse) return;
    else this._initUse = true;
    var middlewares = this.initComponentsWith(this.use);
    _.values(middlewares).forEach(function(middleware) {
      this.express.use(middleware);
    }, this);
  }
}, {
  attributes: {
    controllers: {
      initializer: 'buildControllers',
      default: function() {
        return {};
      }
    },
    models: {
      default: function() {
        return {};
      }
    },
    views: {
      default: function() {
        return {};
      }
    },
    stores: {
      default: function() {
        return {};
      }
    },
    listen: {
      required: true,
      default: function() {
        return {
          host: 'localhost',
          port: 3000,
        }
      },
    },
    use: {
      default: function() {
        return []
      },
    },
    express: {
      required: true,
      default: function() {
        return require('express')();
      },
    },
  }
});
