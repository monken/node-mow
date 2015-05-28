var _ = require('lodash');

module.exports = require('./component').extend({

}, {
  attributes: {
    handler: {
      required: true,
    },
    attributes: {
      default: function() { return {} },
    },
    method: {
      required: true,
      default: function() { return ['get'] },
    }
  }
});