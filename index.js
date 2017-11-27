module.exports = {
  mapping: {},
  sources: {

    default: function(key_def, callback) {
      callback(null, key_def);
    },

    'ENV': function(key_def, callback) {
      callback(null, process.env[key_def]);
    },

    'FILE': function(key_def, callback) {
      var fs = require('fs');

      fs.stat(key_def.path, function(err, stat) {
        if (err) { return callback(err); }

        var _f = function(obj, i) { return obj[i]; }
        var _d = require(key_def.path);
        var _v = key_def.key.split('.').reduce(_f, _d);

        if (_v) {
          return callback(null, _v);
        }

        callback(null, null);
      });
    }
  },

  map: function(key, def) {
    this.mapping[key] = def;
    return this.mapping;
  },

  mapAll: function(defs) {
    Object.assign(this.mapping, defs);
    return this.mapping;
  },

  addSource: function(source_name, source_func) {
    this.sources[source_name] = source_func;
  },

  getFromSource: function(source_name, key_name, callback) {
    var mapping = this.mapping[key_name];
    if (!mapping) { return callback(null, null); }

    var def = mapping[source_name];
    if (!def) { return callback(null, null); }

    this.sources[source_name](def, callback)
  },

  get: function(key_name, callback) {
    var self         = this;
    var sources_keys = Object.keys(this.sources);

    this.getFromSource(sources_keys.shift(), key_name, function lambda(err, val) {
      if (err) {
        return callback(err);
      }

      if (val) {
        return callback(null, val);
      }

      if (sources_keys.length > 0) {
        return self.getFromSource(sources_keys.shift(), key_name, lambda);
      }

      callback(null, null);
    });
  }
};
