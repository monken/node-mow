var _ = require('lodash'),
  http = require('http');

module.exports = require('./component').extend({
  buildControllers: function() {
    this.initUse();
    var controllers = require('require-all')(__dirname + '/../../controller/');
    return _(controllers).map(this.buildController, this).value();
  },
  buildController: function(controller, base) {
    if (_.isPlainObject(controller)) {
      return _(controller).map(function(controller, subbase) {
        return this.buildController(controller, [base, subbase].join('/'));
      }, this).value();
    } else if (_.isFunction(controller)) {
      var instance = new controller({
        express: this.express,
        base: base,
        filename: base,
        logger: this.logger,
      });
      return instance;
    } else {
      this.logger.error('controller is not a function', controller);
    }
  },
  run: function() {
    var server = http.createServer(this.express);
    server.on('error', function(e) {
      if (e.code === 'EADDRINUSE') this.logger.fatal('port %s already in use', this.listen.port);
    });

    server.listen(this.listen.port, this.listen.host, function(err) {
      this.logger.info('listening on http://' + [this.listen.host, this.listen.port].join(':'));
    }.bind(this));

  },
  initUse: function() {
    var middlewares = this.initComponentWith(this.use, '');
    _.values(middlewares).forEach(function(middleware) {
      this.express.use(middleware);
    }, this);
  }
}, {
  attributes: {
    controllers: {
      initializer: 'buildControllers',
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
