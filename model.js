var _ = require('lodash');

module.exports = require('./component').extend({
  toJSON: function(options) {
    return _.clone(this.attributes);
  },
  set: function(key, val, options) {
    if (key == null) return this;
    var attrs;
    if (typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options || (options = {});
    for (var attr in attrs) {
      this.attributes[attr] = attrs[attr];
    }
    return this;
  },
  save: function(attributes, options) {
    this.set(attributes);
    return this.getStore().putItem(this.toJSON(), options);
  },
  destroy: function(options) {
    return this.getStore().deleteItem(this.toJSON(), options);
  },
  fetch: function(options) {
    return this.getStore().getItem(this.toJSON(), options).then(function(res) {
      return _.extend(this.attributes, res);
    }.bind(this));
  },
  get: function(attr) {
    return this.attributes[attr];
  },
  getStore: function() {
    return this.collection.getStore.apply(this.collection, arguments);
  },
  pick: function() {
    var args = [].slice.call(arguments);
    args.unshift(this.attributes);
    return _.pick.apply(_, args);
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
})
