var _ = require('lodash'),
  Promise = require('bluebird');

module.exports = require('./component').extend({
  getStore: function(name, clone) {
    name = name || this.store;
    return this.getComponent('stores', name, clone || this.stores[name]);
  },
  buildStores: function() {
    _.forEach(this._stores, function(store, name) {
      this.stores[name] = this.getComponent('_stores', name, this.stores[name]);
    }, this);
  },
  fetch: function(options) {
    options = options || {};
    return this.getStore(options.store).listItems();
  },
  add: function(models, options) {
    var singular = !_.isArray(models);
    models = singular ? (models ? [models] : []) : models.slice();
    models = models.map(function(model) {
      model = _.isPlainObject(model) ? new this.model({ attributes: model }) : model;
      _.defaults(model, { collection: this });
      return model;
    }, this);
    this.models.push.apply(this.models, models);
    return singular ? models[0] : models;
  },
  model: require('./component').extend({
    toJSON: function(options) {
      return _.clone(this.attributes);
    },
    save: function(options) {
      return this.collection.getStore().putItem(this.toJSON(), options);
    },
  }, {
    attributes: {
      attributes: {
        default: function() {
          return {};
        },
      },
      idAttribute: {
        default: 'Id',
      }
    }
  }),
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
