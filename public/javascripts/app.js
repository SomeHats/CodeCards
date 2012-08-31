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

window.require.define({"initialize": function(exports, require, module) {
  var App, Interpreter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Interpreter = require('interpreter');

  require('lib/util');

  module.exports = App = (function(_super) {

    __extends(App, _super);

    function App() {
      return App.__super__.constructor.apply(this, arguments);
    }

    App.prototype.initialize = function() {
      window.Util.animationFrame();
      return this.interpreter = new Interpreter({
        el: $('canvas')
      });
    };

    return App;

  })(Backbone.View);
  
}});

window.require.define({"interpreter": function(exports, require, module) {
  var Interpreter, UserMedia,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  UserMedia = require('interpreter/usermedia');

  module.exports = Interpreter = (function(_super) {

    __extends(Interpreter, _super);

    function Interpreter() {
      return Interpreter.__super__.constructor.apply(this, arguments);
    }

    Interpreter.prototype.initialize = function() {
      this.UserMedia = new UserMedia({
        el: this.el
      });
      this.UserMedia.p = this;
      return this.UserMedia.on('imageData', this.detect);
    };

    Interpreter.prototype.detect = function() {
      this.p.markers = this.p.detector.detect(this.imageData);
      this.p.highlight.apply(this.p);
      return this.p.interpret.apply(this.p);
    };

    Interpreter.prototype.highlight = function() {};

    Interpreter.prototype.interpret = function() {};

    Interpreter.prototype.detector = new AR.Detector(15);

    return Interpreter;

  })(Backbone.View);
  
}});

window.require.define({"interpreter/usermedia": function(exports, require, module) {
  var UserMedia,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = UserMedia = (function(_super) {

    __extends(UserMedia, _super);

    function UserMedia() {
      return UserMedia.__super__.constructor.apply(this, arguments);
    }

    UserMedia.prototype.initialize = function() {
      var error, self, success;
      self = this;
      success = function(stream) {
        var ctx, video;
        console.log('hello');
        video = document.createElement('video');
        video.autoplay = true;
        if (window.webkitURL && window.webkitURL.createObjectURL) {
          video.src = window.webkitURL.createObjectURL(stream);
        } else {
          video.src = stream;
        }
        self.ctx = ctx = self.el.getContext('2d');
        return Util.on('animationFrame', function() {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            if (self.el.isSetUp) {
              self.ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
              self.imageData = self.ctx.getImageData(0, 0, self.el.width, self.el.height);
              return self.trigger('imageData');
            } else if (video.videoWidth) {
              self.el.setAttribute('width', video.videoWidth);
              self.el.setAttribute('height', video.videoHeight);
              self.el.width = video.videoWidth;
              self.el.height = video.videoHeight;
              return self.el.isSetUp = true;
            }
          }
        });
      };
      error = function() {
        console.log(this);
        return console.log(self);
      };
      if (navigator.getUserMedia) {
        return navigator.getUserMedia({
          video: true
        }, success, error);
      } else if (navigator.mozGetUserMedia) {
        return navigator.mozGetUserMedia({
          video: true
        }, success, error);
      } else if (navigator.webkitGetUserMedia) {
        return navigator.webkitGetUserMedia({
          video: true
        }, success, error);
      } else {
        return error();
      }
    };

    return UserMedia;

  })(Backbone.View);
  
}});

window.require.define({"lib/mediator": function(exports, require, module) {
  var Mediator;

  Mediator = (function() {

    function Mediator() {}

    Mediator.prototype.events = {};

    Mediator.prototype.getCallbacksFor = function(keyString) {
      var callbacks, getFrom, keys;
      keys = keyString.split(':');
      callbacks = [];
      getFrom = function(events) {
        var key;
        key = keys.shift();
        if (key) {
          if (!events[key]) {
            events[key] = [];
          }
          callbacks.push(events[key]);
          return getFrom(events[key]);
        }
      };
      getFrom(this.events);
      return callbacks;
    };

    Mediator.prototype.on = function(keys, callback) {
      var bind, name, self, _results;
      self = this;
      bind = function(key, callback) {
        var callbacks;
        callbacks = self.getCallbacksFor(key);
        return callbacks[callbacks.length - 1].push(callback);
      };
      if (typeof keys === 'object' && keys instanceof Object) {
        _results = [];
        for (name in keys) {
          _results.push(bind(name, keys[name]));
        }
        return _results;
      } else if (typeof keys === 'string' || keys instanceof String) {
        return bind(keys, callback);
      }
    };

    Mediator.prototype.trigger = function(keyString, data) {
      var call, callback, callbacks, _i, _len, _results;
      callbacks = this.getCallbacksFor(keyString);
      _results = [];
      for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
        callback = callbacks[_i];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = callback.length; _j < _len1; _j++) {
            call = callback[_j];
            _results1.push(call(data));
          }
          return _results1;
        })());
      }
      return _results;
    };

    return Mediator;

  })();

  module.exports = new Mediator;
  
}});

window.require.define({"lib/util": function(exports, require, module) {
  var util,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  util = (function(_super) {

    __extends(util, _super);

    function util() {
      window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
    }

    util.prototype.animationFrame = function() {
      window.Util.trigger('animationFrame');
      window.requestAnimationFrame(Util.animationFrame);
      return null;
    };

    return util;

  })(Backbone.View);

  window.Util = new util;
  
}});

