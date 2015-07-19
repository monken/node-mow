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
    return this.getStore(options.store).listItems();
  },
  add: function(models, options) {
    var singular = !_.isArray(models);
    models = singular ? (models ? [models] : []) : models.slice();
    models = models.map(function(model) {
      model = _.isPlainObject(model) ? new this.model({
        attributes: model
      }) : model;
      _.defaults(model, {
        collection: this
      });
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
    destroy: function(options) {
      return this.collection.getStore().deleteItem(this.toJSON(), options);
    },
    fetch: function(options) {
      return this.collection.getStore().getItem(this.toJSON(), options).then(function(res) {
        return _.extend(this.attributes, res);
      }.bind(this));
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
