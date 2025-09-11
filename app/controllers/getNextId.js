var _ = require('lodash');
  
module.exports = function getNextId(collection) {
    var nextId = 1;
    _.forEach(function(item) {
      nextId = item.id >= nextId ? item.id + 1 : nextId;
    });
    return nextId;
  }