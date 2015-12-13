var Promise = require('bluebird'),
  _ = require('lodash'),
  moment = require('moment'),
  crypto = require('crypto'),
  fs = Promise.promisifyAll(require('fs'));

module.exports = require('./component').extend({
  createItem: function(row, options) {
    return this.putItem(row, _.extend({
      create: true,
    }, options));
  },
  updateItem: function(row, options) {
    return this.putItem(row, _.extend({
      create: false,
    }, options));
  },
  putItem: function(row, options) {
    throw "not implemented";
  },
  prepareItems: function(rows, options) {
    if (!_.isArray(rows) || rows.length === 0) return [];
    return rows.map(function(row) {
      var key = this.buildKey(row);
      if (this.idAttribute) row[this.idAttribute] = key;
      var now = moment().toISOString();
      return _.defaults({
        UpdateDate: now,
      }, row, {
        CreateDate: now,
      });
    }.bind(this));
  },
  putItems: function(key, options) {
    this.throw("not implemented");
  },
  deleteItem: function(key, options) {
    this.throw("not implemented");
  },
  getItem: function(key, options) {
    this.throw("not implemented");
  },
  listItems: function(options) {
    this.throw("not implemented");
  },
  keyDigest: function() {
    var args = Array.prototype.slice.call(arguments, 0);
    return crypto.createHash('sha256').update(args.join("\0"))
      .digest('base64')
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, ""); // URL safe base64 string
  },
  buildKey: function(key) {
    if (this.idAttribute && !_.isUndefined(key[this.idAttribute])) {
      return key[this.idAttribute];
    }
    if (_.isObject(key)) {
      if (_.isArray(this.keyAttribute)) {
        var keys = this.keyAttribute.map(function(attr) {
          return key[attr];
        });
        return this.keyDigest.apply(this, keys);
      } else if (_.isString(this.keyAttribute)) {
        return key[this.keyAttribute];
      } else {
        return this.keyDigest(crypto.randomBytes(32));
      }
    } else return key;
  },
}, {
  attributes: {
    keyAttribute: {
      //required: true,
    },
    idAttribute: {

    },
  }
});
