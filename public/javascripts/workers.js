if (typeof window === 'undefined') {
  var isWorker = true;
  global = {};
} else {
  var isWorker = false;
}
(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

if (isWorker) {
  var window = {};
  var require = window.require = global.require;
}


self.onmessage = function(event) {
  if(event.data.event === 'start') {
    var Worker = global.require(event.data.data)
    new Worker(self);
  }
}

window.require.define({"workers/init": function(exports, require, module) {
  var Init,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Init = (function(_super) {

  __extends(Init, _super);

  function Init() {
    return Init.__super__.constructor.apply(this, arguments);
  }

  Init.prototype.initialize = function() {
    return this.send('log', 'All\'s well!');
  };

  return Init;

})(require('workers/worker'));

}});

window.require.define({"workers/worker": function(exports, require, module) {
  var Worker, eventSplitter;

eventSplitter = /\s+/;

module.exports = Worker = (function() {

  function Worker(slf) {
    var _ths;
    _ths = this;
    slf.onmessage = function(e) {
      return _ths.trigger(e.event, e.data);
    };
    this.send = function(event, data) {
      return slf.postMessage({
        event: event,
        data: data
      });
    };
    this.initialize();
  }

  Worker.prototype.initialize = function() {
    return null;
  };

  Worker.prototype.on = function(events, callback, context) {
    var calls, event, list;
    if (!callback) {
      return this;
    }
    events = events.split(eventSplitter);
    calls = this._callbacks || (this._callbacks = {});
    while (event = events.shift()) {
      list = calls[event] || (calls[event] = []);
      list.push(callback, context);
    }
    return this;
  };

  Worker.prototype.off = function(events, callback, context) {
    var calls, event, i, list;
    _.keys = Object.keys || function(obj) {
      var key, keys;
      if (obj !== Object(obj)) {
        throw new TypeError("Invalid object");
      }
      keys = [];
      for (key in obj) {
        if (_.has(obj, key)) {
          keys[keys.length] = key;
        }
      }
      return keys;
    };
    if (!(calls = this._callbacks)) {
      return this;
    }
    if (!(events || callback || context)) {
      delete this._callbacks;
      return this;
    }
    events = (events ? events.split(eventSplitter) : _.keys(calls));
    while (event = events.shift()) {
      if (!(list = calls[event]) || !(callback || context)) {
        delete calls[event];
        continue;
      }
      i = list.length - 2;
      while (i >= 0) {
        if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
          list.splice(i, 2);
        }
        i -= 2;
      }
    }
    return this;
  };

  Worker.prototype.trigger = function(events) {
    var all, args, calls, event, i, length, list, rest;
    if (!(calls = this._callbacks)) {
      return this;
    }
    rest = [];
    events = events.split(eventSplitter);
    i = 1;
    length = arguments_.length;
    while (i < length) {
      rest[i - 1] = arguments_[i];
      i++;
    }
    while (event = events.shift()) {
      if (all = calls.all) {
        all = all.slice();
      }
      if (list = calls[event]) {
        list = list.slice();
      }
      if (list) {
        i = 0;
        length = list.length;
        while (i < length) {
          list[i].apply(list[i + 1] || this, rest);
          i += 2;
        }
      }
      if (all) {
        args = [event].concat(rest);
        i = 0;
        length = all.length;
        while (i < length) {
          all[i].apply(all[i + 1] || this, args);
          i += 2;
        }
      }
    }
    return this;
  };

  return Worker;

})();

}});

