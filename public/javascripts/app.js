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
  var App, Loader, Main, Router,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  require('lib/util');

  Router = require('router');

  Loader = require('loader');

  Main = require('main');

  module.exports = App = (function(_super) {

    __extends(App, _super);

    function App() {
      return App.__super__.constructor.apply(this, arguments);
    }

    App.prototype.initialize = function() {
      var _this;
      window.Util.animationFrame();
      this.cont = $('#container');
      this.$body = $(document.body);
      this.router = new Router;
      _this = this;
      this.router.on('route:root', function() {
        return _this.start(Loader);
      });
      this.router.on('route:main', function() {
        return _this.start(Main);
      });
      return Backbone.history.start();
    };

    App.prototype.start = function(page) {
      this.$body.addClass('transitioning');
      window.scrollTo(0, 0);
      return this.unrenderCurrent(function() {
        this.current = new page({
          el: this.cont
        });
        return this.renderCurrent();
      });
    };

    App.prototype.renderCurrent = function() {
      var _this;
      this.cont.addClass(this.current.name);
      _this = this;
      return this.current.render(function() {
        return _this.$body.removeClass('transitioning');
      });
    };

    App.prototype.unrenderCurrent = function(callback) {
      if (callback == null) {
        callback = function() {
          return null;
        };
      }
      return this.current.unrender(function() {
        this.cont.removeClass(this.current.name);
        this.cont.html('');
        return callback.apply(this);
      }, this);
    };

    App.prototype.current = {
      unrender: function(callback, ctx) {
        if (callback == null) {
          callback = (function() {
            return null;
          });
        }
        if (ctx == null) {
          ctx = this;
        }
        return callback.apply(ctx);
      },
      render: function(callback, ctx) {
        if (callback == null) {
          callback = (function() {
            return null;
          });
        }
        if (ctx == null) {
          ctx = this;
        }
        return callback.apply(ctx);
      },
      name: ''
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

    Interpreter.prototype.blend = 3;

    Interpreter.prototype.contrast = 0;

    Interpreter.prototype.brightness = 0;

    Interpreter.prototype.sharpen = 1.5;

    Interpreter.prototype.distanceLimit = 4.5;

    Interpreter.prototype.initialize = function() {
      this.render();
      this.UserMedia = new UserMedia({
        el: $('<canvas>')
      });
      this.UserMedia.p = this;
      return this.UserMedia.on('imageData', this.detect);
    };

    Interpreter.prototype.render = function() {
      return HighLighter.context = this.ctx = this.el.getContext('2d');
    };

    Interpreter.prototype.pause = function() {
      return this.UserMedia.paused = true;
    };

    Interpreter.prototype.unpause = function() {
      return this.UserMedia.paused = false;
    };

    Interpreter.prototype.detect = function() {
      var data;
      if (this.p.imageData.length > this.p.blend) {
        this.p.imageData = [];
      }
      this.p.imageData.push(this.imageData);
      if (this.p.imageData.length === this.p.blend) {
        data = this.p.blend === 1 ? this.p.imageData[0] : this.p.averageImageData();
        this.p.imageData.shift();
        if (this.p.brightness !== 0 || this.p.contrast !== 0) {
          data = ImageFilters.BrightnessContrastGimp(data, this.p.brightness, this.p.contrast);
        }
        if (this.p.sharpen !== 0) {
          data = ImageFilters.Sharpen(data, this.p.sharpen);
        }
        this.p.ctx.putImageData(data, 0, 0);
        this.p.markers = this.p.detector.detect(data);
        this.p.markers = this.p.markers.map(function(marker, index) {
          return new Marker(marker.id, marker.corners, index);
        });
        this.p.interpret();
        return this.p.highlight();
      }
    };

    Interpreter.prototype.highlight = function() {
      HighLighter.drawCorners(this.markers);
      return HighLighter.drawIDs(this.markers);
    };

    Interpreter.prototype.interpret = function() {
      var candidate, candidates, current, lineStarter, lsSuccess, markers, results, success, _i, _j, _k, _len, _len1, _len2;
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
          current.radius = current.size * this.distanceLimit;
          candidates = markers.filter(function(marker) {
            return marker.available && marker.index !== current.index && current.lookAhead(marker.x, marker.y);
          });
          if (candidates.length !== 0) {
            for (_i = 0, _len = candidates.length; _i < _len; _i++) {
              candidate = candidates[_i];
              candidate.distanceFromCurrent = candidate.distanceFrom(current.x, current.y);
            }
            candidates.sort(this.sortByDistance);
            if (candidates[0].distanceFromCurrent <= current.radius) {
              results.push(candidates[0].id);
              current = candidates[0];
              current.colour = 'lime';
              current.available = false;
              success = true;
            }
          }
          if (success === false) {
            results.push(0);
            candidates = markers.filter(function(marker) {
              return marker.available && marker.index !== current.index && lineStarter.isAbove(marker.x, marker.y);
            });
            if (candidates.length !== 0) {
              for (_j = 0, _len1 = candidates.length; _j < _len1; _j++) {
                candidate = candidates[_j];
                candidate.distanceFromCurrent = lineStarter.distanceAbove(candidate.x, candidate.y);
              }
              candidates.sort(this.sortByDistance);
              if (candidates[0].distanceFromCurrent <= current.radius) {
                lsSuccess = true;
                current = candidates[0];
                while (lsSuccess) {
                  lsSuccess = false;
                  current.radius = current.size * this.distanceLimit;
                  candidates = markers.filter(function(marker) {
                    return marker.available && marker.index !== current.index && current.lookBehind(marker.x, marker.y);
                  });
                  if (candidates.length !== 0) {
                    for (_k = 0, _len2 = candidates.length; _k < _len2; _k++) {
                      candidate = candidates[_k];
                      candidate.distanceFromCurrent = candidate.distanceFrom(current.x, current.y);
                    }
                    candidates.sort(this.sortByDistance);
                    if (candidates[0].distanceFromCurrent <= current.radius) {
                      lsSuccess = true;
                      current = candidates[0];
                    }
                  } else {
                    lineStarter = current;
                  }
                }
                results.push(current.id);
                current.colour = 'yellow';
                current.available = false;
                success = true;
              }
            }
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

    Interpreter.prototype.sortByDistance = function(a, b) {
      if (a.distanceFromCurrent < b.distanceFromCurrent) {
        return -1;
      } else if (a.distanceFromCurrent > b.distanceFromCurrent) {
        return 1;
      } else {
        return 0;
      }
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
          this.drawRadius(marker);
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

    Highlighter.prototype.drawRadius = function(marker) {
      var ctx;
      ctx = this.context;
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (marker.radius) {
        ctx.arc(marker.x, marker.y, marker.radius, 0, Math.PI * 2, false);
      }
      ctx.stroke();
      return ctx.closePath();
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

    Marker.prototype.lookBehind = function(x, y) {
      var g, p;
      if (!this.lookBehindPoints) {
        p = Util.clone(this.corners);
        g = this.geom;
        if (g[0].m === Infinity || g[0].m === -Infinity) {
          p[1] = p[0].y > p[1].y ? 480 : 0;
        } else if (p[0].x > p[1].x) {
          p[1].x = 640;
          p[1].y = g[0].m * 640 + g[0].c;
        } else {
          p[1].x = 0;
          p[1].y = g[0].c;
        }
        if (g[2].m === Infinity || g[2].m === -Infinity) {
          p[2] = p[3].y > p[2].y ? 480 : 0;
        } else if (p[3].x > p[2].x) {
          p[2].x = 640;
          p[2].y = g[2].m * 640 + g[2].c;
        } else {
          p[2].x = 0;
          p[2].y = g[2].c;
        }
        this.lookBehindPoints = p;
      }
      return this.pointInPolygon(this.lookBehindPoints, x, y);
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

    Marker.prototype.distanceAbove = function(x, y) {
      var d, g;
      g = this.geom;
      d = Math.abs((g[0].m * x) - y + g[0].c);
      d /= Math.sqrt(g[0].m * g[0].m + 1);
      return d;
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

window.require.define({"interpreter/remote": function(exports, require, module) {
  var Remote, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('interpreter/templates/remote');

  module.exports = Remote = (function(_super) {

    __extends(Remote, _super);

    function Remote() {
      return Remote.__super__.constructor.apply(this, arguments);
    }

    Remote.prototype.initialize = function() {
      return this.render();
    };

    Remote.prototype.render = function() {
      var cancel, connect, open, pin, submit, _ths;
      this.$el.html(template());
      _ths = this;
      open = this.$('.remote');
      connect = this.$('.go');
      cancel = this.$('.cancel');
      pin = this.$('input');
      open.on('click', function() {
        _ths.$el.removeClass('hide');
        return pin.focus();
      });
      cancel.on('click', function() {
        return _ths.$el.addClass('hide');
      });
      submit = function() {
        var val;
        val = pin.val();
        if (val.length === 4 && !isNaN(parseFloat(val)) && isFinite(val)) {
          return _ths.connect(val);
        } else {
          return Util.alert('Sorry, that\s not valid. Please enter the pin shown on the remote.');
        }
      };
      connect.on('click', function() {
        return submit();
      });
      return pin.on('keypress', function(e) {
        if (e.which === 13) {
          return submit();
        }
      });
    };

    Remote.prototype.connect = function(pin) {
      return console.log(pin);
    };

    return Remote;

  })(Backbone.View);
  
}});

window.require.define({"interpreter/templates/remote": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div>\n  <h3>Enter your pin:</h3>\n  <input type=\"tel\" name=\"pin-number\" maxlength=\"4\" placeholder=\"****\">\n  <button class=\"go\">Connect</button>\n  <button class=\"cancel\">Cancel</button>\n</div>\n<a class=\"remote\">\n  <img src=\"/svg/remote-yellow.svg\" width=\"46\">\n</a>";});
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
          if (!self.paused) {
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

    UserMedia.prototype.paused = false;

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
      window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(callback) {
        return setTimeout(callback, 20);
      };
      self = this;
      $(document).on('mousemove', function(e) {
        self.mouse.x = e.pageX;
        return self.mouse.y = e.pageY;
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

    util.prototype.alert = function(msg) {
      return alert(msg);
    };

    return util;

  })(Backbone.View);

  window.Util = new util;
  
}});

window.require.define({"loader": function(exports, require, module) {
  var Loader, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('templates/loader');

  module.exports = Loader = (function(_super) {

    __extends(Loader, _super);

    function Loader() {
      return Loader.__super__.constructor.apply(this, arguments);
    }

    Loader.prototype.initialize = function() {};

    Loader.prototype.render = function(callback, ctx) {
      var header, icons;
      if (callback == null) {
        callback = (function() {
          return null;
        });
      }
      if (ctx == null) {
        ctx = this;
      }
      this.$el.html(template());
      header = this.$('header');
      icons = this.$('.icon');
      return setTimeout(function() {
        header.animate({
          opacity: 1,
          translateY: '0px'
        }, {
          easing: 'ease'
        });
        return icons.each(function(index) {
          if (index === 2) {
            return $(this).animate({
              opacity: 1,
              translateY: '0px'
            }, {
              easing: 'ease',
              delay: index * 150 + 100,
              complete: function() {
                return callback.apply(ctx);
              }
            });
          } else {
            return $(this).animate({
              opacity: 1,
              translateY: '0px'
            }, {
              easing: 'ease',
              delay: index * 150 + 100
            });
          }
        });
      }, 25);
    };

    Loader.prototype.unrender = function(callback, ctx) {
      var header, icons;
      if (callback == null) {
        callback = (function() {
          return null;
        });
      }
      if (ctx == null) {
        ctx = this;
      }
      header = this.$('header');
      icons = this.$('.icon');
      header.animate({
        opacity: 0,
        translateY: '-200px'
      }, {
        duration: 300,
        easing: 'ease-in'
      });
      return icons.each(function(index) {
        if (index === 2) {
          return $(this).animate({
            opacity: 0,
            translateY: '150px'
          }, {
            easing: 'ease-in',
            delay: index * 150,
            duration: 300,
            complete: function() {
              return callback.apply(ctx);
            }
          });
        } else {
          return $(this).animate({
            opacity: 0,
            translateY: '150px'
          }, {
            easing: 'ease-in',
            delay: index * 150,
            duration: 300
          });
        }
      });
    };

    Loader.prototype.name = 'loader';

    return Loader;

  })(Backbone.View);
  
}});

window.require.define({"main": function(exports, require, module) {
  var App, Interpreter, Remote, data, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Interpreter = require('interpreter');

  data = require('data/test');

  Remote = require('interpreter/remote');

  template = require('templates/main');

  module.exports = App = (function(_super) {

    __extends(App, _super);

    function App() {
      return App.__super__.constructor.apply(this, arguments);
    }

    App.prototype.initialize = function() {
      var stats;
      stats = new Stats;
      stats.setMode(0);
      return this.$el.append(stats.domElement);
    };

    App.prototype.start = function() {
      var $code, gui;
      this.interpreter = new Interpreter({
        el: this.$('#canvas')
      });
      $code = $('code');
      this.interpreter.on('error', function(error) {
        stats.end();
        stats.begin();
        return $('#alert').html('Error: ' + error);
      });
      this.interpreter.on('success', function(results) {
        var code, result, _i, _len;
        stats.end();
        stats.begin();
        code = "";
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          code += data[result];
        }
        $('#alert').html('Success! ' + code);
        code = js_beautify(code);
        return $code.html(code);
      });
      window.inte = this.interpreter;
      gui = new dat.GUI({
        autoPlace: false
      });
      gui.add(this.interpreter, 'blend', 1, 30).step(16);
      gui.add(this.interpreter, 'brightness', -100, 100);
      gui.add(this.interpreter, 'contrast', -100, 100);
      gui.add(this.interpreter, 'sharpen', 0, 10).setValue(0);
      gui.add(this.interpreter, 'distanceLimit', 1, 30);
      return this.$el.append(gui.domElement);
    };

    App.prototype.render = function(callback, ctx) {
      var nav, remote, _this;
      if (callback == null) {
        callback = (function() {
          return null;
        });
      }
      if (ctx == null) {
        ctx = this;
      }
      _this = this;
      this.$el.html(template());
      remote = new Remote({
        el: this.$('.pin-entry')
      });
      nav = this.$('nav');
      nav.animate({
        opacity: 1,
        translateY: '0px'
      }, {
        easing: 'ease-out',
        duration: 250,
        complete: function() {
          return callback.apply(ctx);
        }
      });
      return this.start();
    };

    App.prototype.unrender = function(callback, ctx) {
      var nav;
      if (callback == null) {
        callback = (function() {
          return null;
        });
      }
      if (ctx == null) {
        ctx = this;
      }
      nav = this.$('nav');
      return nav.animate({
        opacity: 0,
        translateY: '70px'
      }, {
        easing: 'ease-in',
        duration: 250,
        complete: function() {
          return callback.apply(ctx);
        }
      });
    };

    App.prototype.name = 'main';

    return App;

  })(Backbone.View);
  
}});

window.require.define({"router": function(exports, require, module) {
  var Router,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Router = (function(_super) {

    __extends(Router, _super);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.routes = {
      "": "root",
      "CodeCards": "main",
      ":404": "root"
    };

    return Router;

  })(Backbone.Router);
  
}});

window.require.define({"templates/loader": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<header class=\"logo\">\n  <h3 class=\"decoded\">Decoded</h3>\n  <h1><span>{</span>code<span>}</span>cards</h1>\n</header>\n\n<a class=\"icon source\" href=\"#CodeCards\">\n  <img src=\"/svg/source-code.svg\">\n  <h3>CodeCards</h3>\n</a>\n\n<a class=\"icon remote\" href=\"#remote\">\n  <img src=\"/svg/remote.svg\">\n  <h3>Remote Control</h3>\n</a>\n\n<a class=\"icon design\" href=\"#designer\">\n  <img src=\"/svg/design.svg\">\n  <h3>Scenario Designer</h3>\n</a>";});
}});

window.require.define({"templates/main": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<nav>\n  <a class=\"logo\" href=\"#\">\n    <h3 class=\"decoded\">Decoded</h3>\n    <h1><span>{</span>code<span>}</span>cards</h1>\n  </a>\n  <section class=\"pin-entry hide\"></section>\n</nav>\n<canvas id=\"canvas\" width=\"640\" height=\"480\" style=\"max-width: 100%\"></canvas>\n<div style=\"position: absolute; top: 0; left: 660px\">\n  <h3 id=\"alert\"></h3>\n  <pre><code class=\"language-js\"></code></pre>\n</div>";});
}});

