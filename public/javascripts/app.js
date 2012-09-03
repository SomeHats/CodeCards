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

window.require.define({"data/test": function(exports, require, module) {
  
  module.exports = ["\n", "}", ") {", ")", "while (", "robot", ".turn(", ".look(", ".move(", " forward ", " left ", " right "];
  
}});

window.require.define({"initialize": function(exports, require, module) {
  var App, Interpreter, data,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Interpreter = require('interpreter');

  require('lib/util');

  data = require('data/test');

  module.exports = App = (function(_super) {

    __extends(App, _super);

    function App() {
      return App.__super__.constructor.apply(this, arguments);
    }

    App.prototype.initialize = function() {
      var $code;
      window.Util.animationFrame();
      this.interpreter = new Interpreter({
        el: $('canvas')
      });
      $code = $('code');
      this.interpreter.on('error', function(error) {
        return $('#alert').html('Error: ' + error);
      });
      return this.interpreter.on('success', function(results) {
        var code, result, _i, _len;
        code = "";
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          code += data[result];
        }
        code = js_beautify(code);
        $('#alert').html('Success!');
        $code.html(code);
        return Prism.highlightElement($code[0], false);
      });
    };

    return App;

  })(Backbone.View);
  
}});

window.require.define({"interpreter": function(exports, require, module) {
  var HighLighter, Interpreter, Marker, UserMedia,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  UserMedia = require('interpreter/usermedia');

  HighLighter = require('interpreter/highlighter');

  Marker = require('interpreter/marker');

  module.exports = Interpreter = (function(_super) {

    __extends(Interpreter, _super);

    function Interpreter() {
      return Interpreter.__super__.constructor.apply(this, arguments);
    }

    Interpreter.prototype.imageData = [];

    Interpreter.prototype.initialize = function() {
      this.UserMedia = new UserMedia({
        el: $('<canvas>')
      });
      this.UserMedia.p = this;
      HighLighter.context = this.ctx = this.el.getContext('2d');
      this.UserMedia.on('imageData', this.detect);
      return this.blend = 10;
    };

    Interpreter.prototype.detect = function() {
      var data;
      this.p.imageData.push(this.imageData);
      if (this.p.imageData.length === this.p.blend) {
        data = this.p.averageImageData();
        console.log(data);
        this.p.imageData = [];
        this.p.ctx.putImageData(data, 0, 0);
        this.p.markers = this.p.detector.detect(data);
        this.p.markers = this.p.markers.map(function(marker, index) {
          return new Marker(marker.id, marker.corners, index);
        });
        this.p.interpret.apply(this.p);
        return this.p.highlight.apply(this.p);
      }
    };

    Interpreter.prototype.highlight = function() {
      HighLighter.drawCorners(this.markers);
      return HighLighter.drawIDs(this.markers);
    };

    Interpreter.prototype.interpret = function() {
      var candidate, candidates, current, lineStarter, markers, results, success, _i, _len;
      results = [];
      markers = this.markers;
      current = markers.filter(function(marker) {
        return marker.id === 0;
      });
      if (current.length === 0) {
        return this.trigger('error', 'No start marker found!');
      } else if (current.length > 1) {
        return this.trigger('error', 'Too many start markers visible');
      } else {
        current = current[0];
        current.colour = 'magenta';
        current.available = false;
        lineStarter = current;
        success = true;
        while (success) {
          success = false;
          if (current.contains(Util.mouse.x, Util.mouse.y)) {
            current.colour = 'cyan';
            current.highlightExtra = true;
          }
          candidates = markers.filter(function(marker) {
            return marker.available && marker.index !== current.index && current.lookAhead(marker.x, marker.y);
          });
          if (candidates.length === 0) {
            current = lineStarter;
            results.push(0);
            candidates = markers.filter(function(marker) {
              return marker.available && marker.index !== current.index && current.isAbove(marker.x, marker.y);
            });
          }
          if (candidates.length !== 0) {
            for (_i = 0, _len = candidates.length; _i < _len; _i++) {
              candidate = candidates[_i];
              candidate.distanceFromCurrent = candidate.distanceFrom(current.x, current.y);
            }
            candidates.sort(function(a, b) {
              if (a.distanceFromCurrent < b.distanceFromCurrent) {
                return -1;
              } else if (a.distanceFromCurrent > b.distanceFromCurrent) {
                return 1;
              } else {
                return 0;
              }
            });
            results.push(candidates[0].id);
            current = candidates[0];
            current.colour = 'lime';
            current.available = false;
            success = true;
          }
        }
        return this.trigger('success', results);
      }
    };

    Interpreter.prototype.averageImageData = function() {
      var data, i, j, v, _i, _j, _ref, _ref1;
      data = this.imageData;
      for (i = _i = 0, _ref = data[0].data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        v = 0;
        for (j = _j = 0, _ref1 = data.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          v += data[j].data[i];
        }
        v /= data.length;
        data[0].data[i] = Math.round(v);
      }
      return data[0];
    };

    Interpreter.prototype.detector = new AR.Detector(15);

    return Interpreter;

  })(Backbone.View);
  
}});

window.require.define({"interpreter/highlighter": function(exports, require, module) {
  var Highlighter;

  Highlighter = (function() {

    function Highlighter() {}

    Highlighter.prototype.drawCorners = function(markers) {
      var corners, ctx, marker, _i, _len, _results;
      ctx = this.context;
      _results = [];
      for (_i = 0, _len = markers.length; _i < _len; _i++) {
        marker = markers[_i];
        corners = marker.corners;
        if (marker.highlightExtra) {
          this.drawLookahead(marker);
        }
        ctx.strokeStyle = marker.colour;
        ctx.lineWidth = 3;
        ctx.beginPath();
        this.trace(corners);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = 'cyan';
        _results.push(ctx.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4));
      }
      return _results;
    };

    Highlighter.prototype.drawIDs = function(markers) {
      var corner, ctx, marker, x, y, _i, _j, _len, _len1, _ref, _results;
      ctx = this.context;
      ctx.strokeStyle = "green";
      ctx.lineWidth = 1;
      _results = [];
      for (_i = 0, _len = markers.length; _i < _len; _i++) {
        marker = markers[_i];
        x = Infinity;
        y = Infinity;
        _ref = marker.corners;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          corner = _ref[_j];
          x = Math.min(x, corner.x);
          y = Math.min(y, corner.y);
        }
        _results.push(ctx.strokeText(marker.id, x, y));
      }
      return _results;
    };

    Highlighter.prototype.drawLookahead = function(marker) {
      var ctx;
      ctx = this.context;
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (marker.lookAheadPoints) {
        this.trace(marker.lookAheadPoints);
      } else {
        this.graphLine(marker.geom[0].m, marker.geom[0].c, marker.corners[0].x);
        this.graphLine(marker.geom[2].m, marker.geom[2].c, marker.corners[2].x);
        this.graphLine(marker.geom[3].m, marker.geom[3].c, marker.corners[3].x);
      }
      ctx.stroke();
      return ctx.closePath();
    };

    Highlighter.prototype.graphLine = function(m, c, x) {
      var ctx;
      ctx = this.context;
      if (m === Infinity || m === -Infinity) {
        ctx.moveTo(x, 0);
        return ctx.lineTo(x, this.height);
      } else {
        ctx.moveTo(0, c);
        return ctx.lineTo(this.width, m * this.width + c);
      }
    };

    Highlighter.prototype.trace = function(points) {
      var ctx, i, l, _i, _results;
      l = points.length;
      ctx = this.context;
      ctx.moveTo(points[0].x, points[0].y);
      _results = [];
      for (i = _i = 1; 1 <= l ? _i <= l : _i >= l; i = 1 <= l ? ++_i : --_i) {
        _results.push(ctx.lineTo(points[i % l].x, points[i % l].y));
      }
      return _results;
    };

    Highlighter.prototype.width = 640;

    Highlighter.prototype.height = 480;

    return Highlighter;

  })();

  module.exports = new Highlighter;
  
}});

window.require.define({"interpreter/marker": function(exports, require, module) {
  var Marker,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Marker = (function(_super) {

    __extends(Marker, _super);

    function Marker(id, corners, index) {
      var i, _i;
      this.id = id;
      this.corners = corners;
      this.index = index != null ? index : 1024;
      this.geom = [];
      for (i = _i = 0; _i <= 3; i = ++_i) {
        this.x += this.corners[i].x;
        this.y += this.corners[i].y;
        this.geom[i] = {};
        this.geom[i].m = (this.corners[i].y - this.corners[(i + 1) % 4].y) / (this.corners[i].x - this.corners[(i + 1) % 4].x);
        this.geom[i].c = this.corners[i].y - this.geom[i].m * this.corners[i].x;
      }
      this.x /= 4;
      this.y /= 4;
      this.size = Math.sqrt(Math.pow(this.corners[0].x - this.corners[2].x, 2) + Math.pow(this.corners[0].y - this.corners[2].y, 2));
      this.size += Math.sqrt(Math.pow(this.corners[1].x - this.corners[3].x, 2) + Math.pow(this.corners[1].y - this.corners[3].y, 2));
      this.size /= 2;
      this.colour = 'red';
      this.available = true;
    }

    Marker.prototype.distanceFrom = function(x, y) {
      return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    };

    Marker.prototype.contains = function(x, y) {
      return this.pointInPolygon(this.corners, x, y);
    };

    Marker.prototype.lookAhead = function(x, y) {
      var g, p;
      if (!this.lookAheadPoints) {
        p = Util.clone(this.corners);
        g = this.geom;
        if (g[0].m === Infinity || g[0].m === -Infinity) {
          p[1] = p[0].y < p[1].y ? 480 : 0;
        } else if (p[0].x < p[1].x) {
          p[1].x = 640;
          p[1].y = g[0].m * 640 + g[0].c;
        } else {
          p[1].x = 0;
          p[1].y = g[0].c;
        }
        if (g[2].m === Infinity || g[2].m === -Infinity) {
          p[2] = p[3].y < p[2].y ? 480 : 0;
        } else if (p[3].x < p[2].x) {
          p[2].x = 640;
          p[2].y = g[2].m * 640 + g[2].c;
        } else {
          p[2].x = 0;
          p[2].y = g[2].c;
        }
        this.lookAheadPoints = p;
      }
      return this.pointInPolygon(this.lookAheadPoints, x, y);
    };

    Marker.prototype.isAbove = function(x, y) {
      var g, p;
      if (!this.isAbovePoints) {
        p = Util.clone(this.corners);
        g = this.geom;
        if (g[0].m === Infinity || g[0].m === -Infinity) {
          if (p[0].y < p[1].y) {
            p[0].y = p[3].y = 0;
            p[1].y = p[2].y = 480;
            p[2].x = p[3].x = 640;
          } else {
            p[0].y = p[3].y = 480;
            p[1].y = p[2].y = p[2].x = p[3].x = 0;
          }
        } else if (p[0].x < p[1].x) {
          p[0].x = p[3].x = p[3].y = p[2].y = 0;
          p[0].y = g[0].c;
          p[1].x = p[2].x = 640;
          p[1].y = g[0].m * 640 + g[0].c;
        } else {
          p[0].x = p[3].x = 640;
          p[0].y = g[0].m * 640 + g[0].c;
          p[3].y = 480;
          p[1].x = p[2].x = 0;
          p[1].y = g[0].c;
          p[2].y = 480;
        }
        this.isAbovePoints = p;
      }
      return this.pointInPolygon(this.isAbovePoints, x, y);
    };

    Marker.prototype.pointInPolygon = function(p, x, y) {
      var c, i, j, _i, _ref;
      c = false;
      for (i = _i = _ref = p.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
        j = (i + 1) % p.length;
        if ((((p[i].y <= y) && (y < p[j].y)) || ((p[j].y <= y) && (y < p[i].y))) && (x < (p[j].x - p[i].x) * (y - p[i].y) / (p[j].y - p[i].y) + p[i].x)) {
          c = !c;
        }
      }
      return c;
    };

    Marker.prototype.x = 0;

    Marker.prototype.y = 0;

    return Marker;

  })(AR.Marker);
  
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

    util.prototype.mouse = {
      x: 0,
      y: 0
    };

    function util() {
      var self;
      window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
      self = this;
      $(document).on('mousemove', function(e) {
        self.mouse.x = e.clientX;
        return self.mouse.y = e.clientY;
      });
    }

    util.prototype.animationFrame = function() {
      window.Util.trigger('animationFrame');
      window.requestAnimationFrame(Util.animationFrame);
      return null;
    };

    util.prototype.clone = function(obj) {
      var attr, copy, item;
      if (null === obj || "object" !== typeof obj) {
        return obj;
      }
      if (obj instanceof Array) {
        copy = [];
        copy = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = obj.length; _i < _len; _i++) {
            item = obj[_i];
            _results.push(this.clone(item));
          }
          return _results;
        }).call(this);
        return copy;
      }
      if (obj instanceof Object) {
        copy = {};
        for (attr in obj) {
          if (obj.hasOwnProperty(attr)) {
            copy[attr] = this.clone(obj[attr]);
          }
        }
        return copy;
      }
      throw new Error("Unable to copy obj! Its type isn't supported.");
    };

    return util;

  })(Backbone.View);

  window.Util = new util;
  
}});

