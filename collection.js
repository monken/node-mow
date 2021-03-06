var _ = require('lodash'),
  Promise = require('bluebird');

module.exports = require('./component').extend({
  getStore: function(name, clone) {
    name = name || this.store;
    return this.getComponent('stores', '_' + name, clone);
  },
  buildStores: function() {
    _.keys(this._stores).forEach(function(name) {
      var store = this.getComponent('_stores', name, this.stores[name]);
      this.stores['_' + name] = store;
    }, this);
  },
  fetch: function(options) {
    options = options || {};
    return this.getStore(options.store).listItems(options);
  },
  save: function(options) {
    options = options || {};
    return this.getStore(options.store).putItems(_.invoke(this.models, 'toJSON'), options);
  },
  add: function(models, options) {
    var singular = !_.isArray(models);
    models = singular ? (models ? [models] : []) : models.slice();
    models = models.map(function(model) {
      model = _.isPlainObject(model) ? new this.model({
        attributes: model,
        logger: this.logger,
      }) : model;
      _.defaults(model, {
        collection: this
      });
      return model;
    }, this);
    this.models.push.apply(this.models, models);
    return singular ? models[0] : this;
  },
  model: require('./model'),
}, {
  attributes: {
    _stores: {
      initializer: 'buildStores',
    },
    stores: {
      default: function() {
        return {};
      },
    },
    store: {},
    models: {
      default: function() {
        return [];
      },
    }
  },
});
