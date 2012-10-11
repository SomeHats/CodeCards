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


window.require.define({"data/languages/js.lang": function(exports, require, module) {
  
module.exports = {
  name: 'js',
  version: 0,
  words: {
    1: ")",
    2: "(",
    3: "}",
    4: "{",
    5: "]",
    6: "[",
    7: ") { ",
    8: "})",
    9: "()",
    10: " + ",
    11: " - ",
    12: " * ",
    13: " / ",
    14: " % ",
    15: " ++ ",
    16: " -- ",
    17: " = ",
    18: " += ",
    19: " -= ",
    20: " *= ",
    21: " /= ",
    22: " %= ",
    23: " <<= ",
    24: " >>= ",
    25: " >>>= ",
    26: " &= ",
    27: " ^= ",
    28: " |= ",
    29: " & ",
    30: " | ",
    31: " ^ ",
    32: " ~ ",
    33: " << ",
    34: " >> ",
    35: " >>> ",
    36: " == ",
    37: " != ",
    38: " === ",
    39: " !== ",
    40: " > ",
    41: " >= ",
    42: " < ",
    43: " <= ",
    44: " && ",
    45: " || ",
    46: " ! ",
    47: ".",
    48: " ? ",
    49: " : ",
    50: ", ",
    51: " delete ",
    52: " function ",
    53: " get ",
    54: " in ",
    55: " instanceof ",
    56: " let ",
    57: " new ",
    58: " set ",
    59: " this",
    60: " typeof ",
    61: " void",
    62: " yield ",
    63: " break;",
    64: " continue;",
    65: " debugger;",
    66: " do {",
    67: " for (",
    68: " if (",
    69: " else ",
    70: " return ",
    71: " switch(",
    72: " case ",
    73: " throw ",
    74: " try {",
    75: " catch (",
    76: " finally {",
    77: " var ",
    78: " while (",
    79: " with (",
    80: "true",
    81: "false",
    82: "undefined",
    83: "null",
    84: "NaN",
    85: "Infinity",
    90: "arguments",
    91: "decodeURI(",
    92: "decodeURIComponent(",
    93: "encodeURI(",
    94: "encodeURIComponent(",
    95: "eval(",
    96: "isFinite(",
    97: "isNaN(",
    98: "parseFloat(",
    99: "parseInt("
  }
};

}});

window.require.define({"data/languages/js.math.lang": function(exports, require, module) {
  
module.exports = {
  name: 'js.math',
  version: 0,
  "extends": {
    'js': 0
  },
  words: {
    100: "Math",
    101: ".E",
    102: ".LN2",
    103: ".LN10",
    104: ".LOG2E",
    105: ".LOG10E",
    106: ".PI",
    107: ".SQRT1_2",
    108: ".SQRT2",
    109: ".abs(",
    110: ".acos(",
    111: ".asin(",
    112: ".atan(",
    113: ".atan2(",
    114: ".ceil(",
    115: ".cos(",
    116: ".exp(",
    117: ".floor(",
    118: ".log(",
    119: ".max(",
    120: ".min(",
    121: ".pow(",
    122: ".random(",
    123: ".round(",
    124: ".sin(",
    125: ".sqrt(",
    126: ".tan("
  }
};

}});

window.require.define({"data/languages/robot.lang": function(exports, require, module) {
  
module.exports = {
  name: "robot",
  version: 0,
  "extends": {
    "js.math": 0
  },
  words: {
    500: "robot",
    501: ".look(",
    504: ".touch(",
    502: ".move(",
    503: ".turn(",
    510: "forward",
    511: "back",
    512: "left",
    513: "right",
    520: "empty",
    521: "wall",
    522: "cake"
  }
};

}});

window.require.define({"data/languages/sample.lang": function(exports, require, module) {
  
module.exports = {
  name: 'sample',
  version: 3,
  "extends": {
    'js': 1
  },
  words: {
    1: "hello ",
    2: {
      word: "world ",
      display: "<strong>world </strong>",
      group: "example group",
      before: [1],
      after: ["example group", 1]
    }
  }
};

}});

window.require.define({"data/missions/sample.mission": function(exports, require, module) {
  
module.exports = {
  language: {
    robot: 0
  },
  initialize: function(el) {
    var $el, template, _ths;
    _ths = this;
    template = require('data/missions/templates/sample');
    $el = $(el);
    $el.addClass('sample');
    $el.html(template());
    this.canvas = $el.find('canvas');
    this.ctx = this.canvas[0].getContext('2d');
    this.width = 640;
    this.height = 480;
    this.size = 32;
    this.animator.clear = function() {
      return _ths.drawScene();
    };
    Util.on('animationFrame', function() {
      return _ths.animator.tick();
    });
    return this.reset();
  },
  reset: function() {
    this.score = 0;
    this.remaining = 100;
    this.updateScore();
    this.displayMap = Util.clone(this.map);
    this.animator.reset();
    return this.drawRobot({
      x: 2,
      y: 2,
      rot: 0
    });
  },
  run: function(str) {
    var animator, back, cake, displayMap, empty, forward, gameMap, i, left, right, robot, success, wall, _i, _ref, _results, _ths;
    this.reset();
    _ths = this;
    gameMap = Util.clone(this.map);
    displayMap = this.displayMap = Util.clone(this.map);
    empty = 0;
    wall = 1;
    cake = 2;
    forward = 0;
    back = 2;
    right = 1;
    left = 3;
    animator = this.animator;
    robot = {
      look: function(direction) {
        var change, tile;
        if (direction == null) {
          direction = forward;
        }
        tile = empty;
        direction = (this.direction + direction) % 4;
        change = {
          x: this.pos.x,
          y: this.pos.y
        };
        while (tile === empty) {
          switch (direction) {
            case 0:
              change = {
                x: change.x + 1,
                y: change.y
              };
              break;
            case 1:
              change = {
                x: change.x,
                y: change.y + 1
              };
              break;
            case 2:
              change = {
                x: change.x - 1,
                y: change.y
              };
              break;
            case 3:
              change = {
                x: change.x,
                y: change.y - 1
              };
          }
          tile = gameMap[change.y] === void 0 || gameMap[change.y][change.x] === void 0 ? wall : gameMap[change.y][change.x];
        }
        return tile;
      },
      move: function(direction) {
        var change;
        if (direction == null) {
          direction = forward;
        }
        direction = (this.direction + direction) % 4;
        change = {
          x: this.pos.x,
          y: this.pos.y
        };
        switch (direction) {
          case 0:
            change = {
              x: this.pos.x + 1,
              y: this.pos.y
            };
            break;
          case 1:
            change = {
              x: this.pos.x,
              y: this.pos.y + 1
            };
            break;
          case 2:
            change = {
              x: this.pos.x - 1,
              y: this.pos.y
            };
            break;
          case 3:
            change = {
              x: this.pos.x,
              y: this.pos.y - 1
            };
        }
        if (gameMap[change.y] !== void 0 && gameMap[change.y][change.x] !== void 0 && gameMap[change.y][change.x] !== 1) {
          this.pos.x = change.x;
          this.pos.y = change.y;
          animator.animate('robot', 200, change);
          if (gameMap[change.y][change.x] === cake) {
            gameMap[change.y][change.x] = empty;
            return animator.callback(function() {
              displayMap[change.y][change.x] = empty;
              _ths.score++;
              return _ths.updateScore();
            });
          }
        }
      },
      touch: function(direction) {
        var change;
        if (direction == null) {
          direction = forward;
        }
        direction = (this.direction + direction) % 4;
        switch (direction) {
          case 0:
            change = {
              x: this.pos.x + 1,
              y: this.pos.y
            };
            break;
          case 1:
            change = {
              x: this.pos.x,
              y: this.pos.y + 1
            };
            break;
          case 2:
            change = {
              x: this.pos.x - 1,
              y: this.pos.y
            };
            break;
          case 3:
            change = {
              x: this.pos.x,
              y: this.pos.y - 1
            };
        }
        if (gameMap[change.y] === void 0 || gameMap[change.y][change.x] === void 0) {
          return wall;
        } else {
          return gameMap[change.y][change.x];
        }
      },
      turn: function(direction) {
        direction = (this.direction + direction) % 4;
        animator.animate('robot', 200, {
          rot: direction
        });
        return this.direction = direction;
      },
      direction: 0,
      pos: {
        x: 2,
        y: 2
      }
    };
    animator.register('robot', {
      x: robot.pos.x,
      y: robot.pos.y,
      rot: 0,
      draw: function(geom) {
        return _ths.drawRobot(geom);
      }
    });
    success = true;
    try {
      eval("var fn = function () {\n " + str + " \n}");
    } catch (e) {
      Util.alert('Error: ' + e.message);
      success = false;
    }
    if (success) {
      _results = [];
      for (i = _i = 0, _ref = this.remaining; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        fn();
        _results.push(animator.callback(function() {
          _ths.remaining--;
          return _ths.updateScore();
        }));
      }
      return _results;
    }
  },
  animator: new Animator(false),
  drawRobot: function(geom) {
    var ctx, rot, size, x, y;
    size = this.size;
    ctx = this.ctx;
    x = geom.x;
    y = geom.y;
    rot = geom.rot;
    ctx.fillStyle = 'blue';
    ctx.fillRect(x * size + 1, y * size + 1, size - 1, size - 1);
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo((x + 0.5) * size, (y + 0.5) * size);
    switch (rot) {
      case 0:
        ctx.lineTo((x + 1) * size, (y + 0.5) * size);
        break;
      case 1:
        ctx.lineTo((x + 0.5) * size, (y + 1) * size);
        break;
      case 2:
        ctx.lineTo(x * size, (y + 0.5) * size);
        break;
      case 3:
        ctx.lineTo((x + 0.5) * size, y * size);
    }
    ctx.stroke();
    return ctx.lineWidth = 1;
  },
  drawScene: function() {
    var ctx, height, m, size, width, x, y, _i, _j, _k, _ref, _ref1, _ref2, _results;
    width = this.width;
    height = this.height;
    size = this.size;
    ctx = this.ctx;
    m = this.displayMap || this.map;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    x = y = 0;
    for (x = _i = 0, _ref = width / size; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
      ctx.moveTo(x * size + 0.5, 0);
      ctx.lineTo(x * size + 0.5, height);
    }
    for (y = _j = 0, _ref1 = height / size; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
      ctx.moveTo(0, y * size + 0.5);
      ctx.lineTo(width, y * size + 0.5);
    }
    ctx.stroke();
    _results = [];
    for (y = _k = 0, _ref2 = m.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; y = 0 <= _ref2 ? ++_k : --_k) {
      _results.push((function() {
        var _l, _ref3, _results1;
        _results1 = [];
        for (x = _l = 0, _ref3 = m[y].length; 0 <= _ref3 ? _l < _ref3 : _l > _ref3; x = 0 <= _ref3 ? ++_l : --_l) {
          if (m[y][x]) {
            if (m[y][x] === 1) {
              ctx.fillStyle = 'orange';
            }
            if (m[y][x] === 2) {
              ctx.fillStyle = 'lime';
            }
            if (m[y][x] !== 3) {
              _results1.push(ctx.fillRect(x * size + 1, y * size + 1, size - 1, size - 1));
            } else {
              _results1.push(void 0);
            }
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      })());
    }
    return _results;
  },
  updateScore: function() {
    $('#score').text("Score: " + this.score);
    return $('#remain').text("Remaining: " + this.remaining);
  },
  map: [[2, 2, 2, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 2, 2, 2], [2, 2, 0, 0, 0, 0, 0, 1, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 2, 2], [2, 0, 0, 0, 2, 0, 0, 1, 0, 2, 2, 0, 1, 0, 0, 2, 0, 0, 0, 2], [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0], [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0], [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0], [2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2], [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2], [2, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 1, 0, 2, 2, 0, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0], [0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0], [0, 2, 0, 2, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 2, 0, 2, 0], [0, 2, 0, 2, 0, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 0, 2, 0, 2, 0], [0, 0, 0, 2, 0, 1, 2, 2, 0, 0, 0, 0, 2, 2, 1, 0, 2, 0, 0, 0], [0, 0, 0, 0, 0, 1, 2, 2, 2, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 0]]
};

}});

window.require.define({"data/missions/templates/sample": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<canvas width=\"640\" height=\"480\"></canvas>\n<h3 id=\"remain\">Remaining:</h3>\n<h3 id=\"score\">Score:</h3>";});
}});

window.require.define({"initialize": function(exports, require, module) {
  var App, Loader, Main, Remote, Router,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

require('lib/util');

Router = require('router');

Loader = require('loader');

Main = require('main');

Remote = require('remote/remote');

module.exports = App = (function(_super) {

  __extends(App, _super);

  function App() {
    return App.__super__.constructor.apply(this, arguments);
  }

  App.prototype.initialize = function() {
    var router, _this;
    window.Util.animationFrame();
    this.cont = $('#container');
    this.$body = $(document.body);
    router = new Router;
    _this = this;
    router.on('route:root', function() {
      return _this.start(Loader);
    });
    router.on('route:main', function() {
      return _this.start(Main);
    });
    router.on('route:remote', function() {
      return _this.start(Remote);
    });
    Backbone.history.start();
    return window.router = router;
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
  var HighLighter, Interpreter, UserMedia, WebWorker,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

UserMedia = require('interpreter/usermedia');

HighLighter = require('interpreter/highlighter');

WebWorker = require('lib/worker');

module.exports = Interpreter = (function(_super) {

  __extends(Interpreter, _super);

  function Interpreter() {
    return Interpreter.__super__.constructor.apply(this, arguments);
  }

  Interpreter.prototype.imageData = [];

  Interpreter.prototype.blend = 3;

  Interpreter.prototype.contrast = 0;

  Interpreter.prototype.brightness = 0;

  Interpreter.prototype.sharpen = 0;

  Interpreter.prototype.distanceLimit = 4.5;

  Interpreter.prototype.initialize = function() {
    var worker, _ths;
    _ths = this;
    this.render();
    this.UserMedia = new UserMedia({
      el: $('<canvas>')
    });
    this.UserMedia.p = this;
    worker = this.worker = new WebWorker({
      name: 'init'
    });
    worker.on('log', function(data) {
      return console.log(data);
    });
    worker.send('start', 'workers/init');
    this.UserMedia.on('imageData', function() {
      var data;
      if (worker.ready) {
        data = {
          img: this.UserMedia.imageData,
          blend: this.blend,
          contrast: this.contrast,
          brightness: this.brightness,
          sharpen: this.sharpen,
          distanceLimit: this.distanceLimit,
          mousex: Util.mouse.x,
          mousey: Util.mouse.y
        };
        return worker.send('raw-image', data);
      }
    }, this);
    worker.on('filtered-image', function(img) {
      return this.imgData = img;
    }, this);
    worker.on('error', function(data) {
      this.trigger('error', data.msg);
      return this.draw(data.markers);
    }, this);
    worker.on('success', function(data) {
      this.trigger('success', data.results);
      return this.draw(data.markers);
    }, this);
    return worker.on('pause', function() {
      return this.UserMedia.paused = true;
    }, this);
  };

  Interpreter.prototype.set = function(attribute, value) {
    this[attribute] = value;
    return this.worker.send('set', {
      attribute: attribute,
      value: value
    });
  };

  Interpreter.prototype.render = function() {
    return HighLighter.context = this.ctx = this.el.getContext('2d');
  };

  Interpreter.prototype.draw = function(markers) {
    this.ctx.putImageData(this.imgData, 0, 0);
    HighLighter.drawCorners(markers);
    return HighLighter.drawIDs(markers);
  };

  Interpreter.prototype.pause = function() {
    return this.UserMedia.paused = true;
  };

  Interpreter.prototype.unpause = function() {
    return this.UserMedia.paused = false;
  };

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
    this.graphLine(marker.geom[0].m, marker.geom[0].c, marker.corners[0].x);
    this.graphLine(marker.geom[2].m, marker.geom[2].c, marker.corners[2].x);
    this.graphLine(marker.geom[3].m, marker.geom[3].c, marker.corners[3].x);
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

window.require.define({"interpreter/language": function(exports, require, module) {
  var Language;

module.exports = Language = (function() {

  function Language(lang) {
    var key, language, words;
    this.words = {
      0: "\n"
    };
    for (key in lang) {
      try {
        language = require('data/languages/' + key + '.lang');
      } catch (e) {
        console.log('Language definition ' + key + ' not found :(');
      }
      if (lang[key] !== '*' && language.version !== lang[key]) {
        console.log('Wrong language version for ' + key, language.version, lang[key]);
      } else {
        words = language.words;
        if (language["extends"]) {
          language = new Language(language["extends"]);
        }
        this.merge(this.words, language.words);
        this.merge(this.words, words);
      }
    }
  }

  Language.prototype.merge = function(target, source) {
    var key, _results;
    _results = [];
    for (key in source) {
      _results.push(target[key] = source[key]);
    }
    return _results;
  };

  return Language;

})();

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
        _ths.$el.addClass('hide');
        pin.blur();
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
    var socket, status, _ths;
    _ths = this;
    status = this.$('.status');
    status.html('Connecting...');
    socket = io.connect('http://' + window.location.host, {
      'force new connection': true
    });
    socket.on('error', function(e) {
      status.html('Could not connect.');
      Util.alert('Could not establish connection :(');
      return console.log(e);
    });
    socket.on('deny', function() {
      status.html('Wrong pin.');
      Util.alert('There wasn\'t a remote with that pin online. Are you sure it was correct?');
      return _ths.$('.remote').trigger('click');
    });
    socket.on('accept', function() {
      status.html('Connected: ' + pin);
      socket.emit('client', {
        event: 'join',
        data: pin
      });
      socket.on('remote', function(data) {
        return _ths.trigger(data.event, data.data);
      });
      return _ths.send = function(event, data) {
        return socket.emit('client', {
          event: event,
          data: data
        });
      };
    });
    return socket.emit('new client', pin);
  };

  Remote.prototype.send = function(event, data) {
    return null;
  };

  return Remote;

})(Backbone.View);

}});

window.require.define({"interpreter/stats": function(exports, require, module) {
  var Stats,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Stats = (function(_super) {

  __extends(Stats, _super);

  function Stats() {
    return Stats.__super__.constructor.apply(this, arguments);
  }

  Stats.prototype.last = 0;

  Stats.prototype.fps = 20;

  Stats.prototype.interval = 50;

  Stats.prototype.tick = function() {
    var current, interval, last;
    last = this.last;
    if (last === 0) {
      this.last = Date.now();
    } else {
      current = Date.now();
      interval = this.interval = current - last;
      this.fps = 1000 / interval;
      this.trigger('tick');
      return this.last = current;
    }
  };

  return Stats;

})(Backbone.Model);

}});

window.require.define({"interpreter/templates/remote": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<div>\n  <h3>Enter your pin:</h3>\n  <input type=\"tel\" name=\"pin-number\" maxlength=\"4\" placeholder=\"****\">\n  <button class=\"go\">Connect</button>\n  <button class=\"cancel\">Cancel</button>\n</div>\n<a class=\"remote\">\n  <img src=\"/svg/remote-yellow.svg\" width=\"46\">\n</a>\n<p class=\"status\"></p>";});
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
      console.log('User Media denied :(');
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

  function util() {
    return util.__super__.constructor.apply(this, arguments);
  }

  util.prototype.mouse = {
    x: 0,
    y: 0
  };

  util.prototype.initialize = function() {
    var doc, _ths;
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(callback) {
      return setTimeout(callback, 20);
    };
    _ths = this;
    doc = $(document);
    return doc.on('mousemove', function(e) {
      _ths.mouse.x = e.pageX;
      return _ths.mouse.y = e.pageY;
    });
  };

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

  util.prototype.isDescendant = function(child, parent) {
    var node;
    node = child.parentNode;
    while (node !== null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  return util;

})(Backbone.View);

window.Util = new util;

}});

window.require.define({"lib/worker": function(exports, require, module) {
  var WebWorker,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = WebWorker = (function(_super) {

  __extends(WebWorker, _super);

  function WebWorker() {
    return WebWorker.__super__.constructor.apply(this, arguments);
  }

  WebWorker.prototype.initialize = function() {
    var worker, _ths;
    worker = this.worker = new Worker('/javascripts/workers.js');
    _ths = this;
    worker.onmessage = function(e) {
      return _ths.trigger(e.data.event, e.data.data);
    };
    this.send('start', 'workers/' + this.get('name'));
    return this.on('WW_READY', function(r) {
      return _ths.ready = r;
    });
  };

  WebWorker.prototype.send = function(event, data) {
    return this.worker.postMessage({
      event: event,
      data: data
    });
  };

  WebWorker.prototype.ready = false;

  return WebWorker;

})(Backbone.Model);

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
  var App, Interpreter, Language, Mission, Remote, Stats, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Interpreter = require('interpreter');

Remote = require('interpreter/remote');

Stats = require('interpreter/stats');

Mission = require('data/missions/sample.mission');

Language = require('interpreter/language');

template = require('templates/main');

module.exports = App = (function(_super) {

  __extends(App, _super);

  function App() {
    return App.__super__.constructor.apply(this, arguments);
  }

  App.prototype.start = function() {
    var $code, language, _ths;
    this.interpreter = new Interpreter({
      el: this.$('#canvas')
    });
    this.mission = Mission;
    Mission.initialize($('#mission')[0]);
    language = this.language = new Language(Mission.language);
    this.on('change:play', function() {
      this.interpreter.UserMedia.paused = !this.play;
      if (!this.play) {
        Mission.run(this.code);
        return $('#alert').html('Paused.');
      } else {
        return Mission.reset();
      }
    });
    $code = $('code');
    _ths = this;
    this.interpreter.on('error', function(error) {
      if (_ths.play) {
        _ths.stats.tick();
        $('#alert').html('Error: ' + error);
        return _ths.remote.send('tick', {
          fps: _ths.stats.fps,
          interval: _ths.stats.interval,
          status: 'error',
          message: error
        });
      }
    });
    return this.interpreter.on('success', function(results) {
      var code, result, _i, _len;
      if (_ths.play) {
        _ths.stats.tick();
        code = "";
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          result = results[_i];
          code += language.words[result];
        }
        $('#alert').html('Running...');
        code = js_beautify(code);
        $code.html(code);
        _ths.remote.send('tick', {
          fps: _ths.stats.fps,
          interval: _ths.stats.interval,
          status: 'success',
          code: code
        });
        return _ths.code = code;
      }
    });
  };

  App.prototype.setupRemote = function() {
    var remote, _ths;
    _ths = this;
    remote = this.remote = new Remote({
      el: this.$('.pin-entry')
    });
    return remote.on('change-setting', function(data) {
      if (data.concerns) {
        _ths[data.concerns][data.setting] = data.value;
        return _ths[data.concerns].trigger('change:' + data.setting);
      } else {
        _ths[data.setting] = data.value;
        return _ths.trigger('change:' + data.setting);
      }
    });
  };

  App.prototype.interact = function() {
    var sec, toggler;
    sec = this.$('section');
    toggler = this.$('.toggler');
    toggler.on('click', function() {
      return sec.toggleClass('extended');
    });
    return this.on('change:expandcamera', function() {
      if (this.expandcamera) {
        return sec.addClass('extended');
      } else {
        return sec.removeClass('extended');
      }
    });
  };

  App.prototype.render = function(callback, ctx) {
    var nav, _ths;
    if (callback == null) {
      callback = (function() {
        return null;
      });
    }
    if (ctx == null) {
      ctx = this;
    }
    _ths = this;
    this.$el.html(template());
    this.stats = new Stats;
    this.interact();
    this.setupRemote();
    nav = this.$('nav');
    return setTimeout(function() {
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
      return _ths.start();
    }, 25);
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

  App.prototype.play = true;

  App.prototype.code = "Util.alert('No code available.');";

  return App;

})(Backbone.View);

}});

window.require.define({"remote/remote": function(exports, require, module) {
  var Remote, UI, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

UI = require('ui/ui');

template = require('remote/template');

module.exports = Remote = (function(_super) {

  __extends(Remote, _super);

  function Remote() {
    return Remote.__super__.constructor.apply(this, arguments);
  }

  Remote.prototype.initialize = function() {
    var socket, _ths;
    this.connected = false;
    _ths = this;
    socket = io.connect('http://' + window.location.host, {
      'force new connection': true
    });
    socket.on('connect', function() {
      return this.connected = true;
    });
    socket.on('error', function(e) {
      Util.alert('Could not connect to remote server.');
      return router.navigate('/', {
        trigger: true
      });
    });
    socket.on('client', function(data) {
      return _ths.trigger(data.event, data.data);
    });
    this.on('join', this.connectionEstablished);
    return this.socket = socket;
  };

  Remote.prototype.connectionEstablished = function() {
    var navItems, pages, pin;
    pin = this.$('.pin');
    pin.animate({
      opacity: 0,
      translateY: '200px'
    }, {
      easing: 'ease-in',
      duration: 300,
      complete: function() {
        return pin.css('display', 'none');
      }
    });
    this.$('.hide').removeClass('hide');
    navItems = this.$('nav li');
    pages = this.$('section');
    return navItems.on('click', function() {
      var el;
      el = $(this);
      if (!el.hasClass('active')) {
        navItems.filter('.active').removeClass('active');
        el.addClass('active');
        pages.filter('.active').removeClass('active');
        return pages.filter('#' + el.attr('title')).addClass('active');
      }
    });
  };

  Remote.prototype.render = function(callback, ctx) {
    var socket, _ths;
    if (callback == null) {
      callback = (function() {
        return null;
      });
    }
    if (ctx == null) {
      ctx = this;
    }
    socket = this.socket;
    _ths = this;
    socket.emit('new remote');
    return socket.on('accept', function(pin) {
      _ths.$el.html(template({
        pin: pin
      }));
      _ths.setupUI();
      return setTimeout(function() {
        return _ths.$('.pin').animate({
          opacity: 1,
          translateY: '0px'
        }, {
          easing: 'ease',
          complete: function() {
            return callback.apply(ctx);
          }
        });
      }, 25);
    });
  };

  Remote.prototype.unrender = function(callback, ctx) {
    if (callback == null) {
      callback = (function() {
        return null;
      });
    }
    if (ctx == null) {
      ctx = this;
    }
    this.socket.disconnect();
    return this.$('.pin').animate({
      opacity: 0,
      translateY: '200px'
    }, {
      easing: 'ease-in',
      duration: 300,
      complete: function() {
        return callback.apply(ctx);
      }
    });
  };

  Remote.prototype.setupUI = function() {
    var canvas, code, counter, ctx, fps, i, lastWidth, max, result, sliders, socket, stats, toggles, _i, _ths;
    _ths = this;
    socket = this.socket;
    sliders = this.$('.slider');
    sliders.each(function() {
      var el, slider;
      el = $(this);
      slider = new UI.Slider({
        el: this
      });
      return slider.on('change', function(value) {
        return socket.emit('remote', {
          event: 'change-setting',
          data: {
            concerns: el.data('concerns' || null),
            setting: el.attr('id'),
            value: parseFloat(value)
          }
        });
      });
    });
    toggles = this.$('.toggle');
    toggles.each(function() {
      var el, toggle;
      el = $(this);
      toggle = new UI.Toggle({
        el: this
      });
      return toggle.on('change', function(value) {
        return socket.emit('remote', {
          event: 'change-setting',
          data: {
            concerns: el.data('concerns' || null),
            setting: el.attr('id'),
            value: value
          }
        });
      });
    });
    result = this.$('#result');
    code = this.$('#preview');
    fps = this.$('#fps');
    canvas = fps.find('canvas');
    ctx = canvas[0].getContext('2d');
    ctx.strokeStyle = 'black';
    counter = fps.find('span');
    lastWidth = fps.width();
    canvas.attr('width', lastWidth);
    stats = [];
    max = 10;
    for (i = _i = 0; 0 <= lastWidth ? _i <= lastWidth : _i >= lastWidth; i = 0 <= lastWidth ? ++_i : --_i) {
      stats[i] = 0;
    }
    return this.on('tick', function(data) {
      var factor, n, width, _j;
      if (data.status === 'error') {
        result.html('Error: ' + data.message);
        code.html('');
      } else if (data.status === 'success') {
        result.html('Code Preview:');
        code.html(data.code);
      } else {
        result.html('Connection problem');
        code.html('Please wait...');
      }
      n = data.fps;
      max = max < n ? n : max;
      width = fps.width();
      stats.push(n);
      if (width !== 0) {
        counter.html(n.toFixed(2) + ' fps');
        if (width !== lastWidth) {
          lastWidth = width;
          canvas.attr('width', width);
        }
        stats.push(n);
        while (stats.length > width) {
          stats.shift();
        }
        ctx.clearRect(0, 0, width, 100);
        ctx.beginPath();
        factor = max / 100;
        for (i = _j = 0; 0 <= width ? _j <= width : _j >= width; i = 0 <= width ? ++_j : --_j) {
          ctx.moveTo(i, 100);
          ctx.lineTo(i, 100 - (stats[i] / factor));
        }
        return ctx.stroke();
      }
    });
  };

  Remote.prototype.name = 'remote';

  return Remote;

})(Backbone.View);

}});

window.require.define({"remote/template": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div class=\"pin\">\n  <p>Here's your pin!</p>\n  <h3>";
  foundHelper = helpers.pin;
  stack1 = foundHelper || depth0.pin;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "pin", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h3>\n  <span>Enter it on the device you wish to control.</span>\n  <p class=\"minor\">Waiting for connection...</p>\n</div>\n<nav class=\"hide\">\n  <ul>\n    <li class=\"active\" title=\"general\">General</li>\n    <li title=\"camera\">Camera</li>\n    <li title=\"stats\">Statistics</li>\n    <li title=\"codepreview\">Preview</li>\n    <li>Another Item</li>\n  </ul>\n</nav>\n<div class=\"hide\">\n  <section class=\"active\" id=\"general\">\n    <h2>General</h2>\n    <div class=\"toggle\" id=\"play\"\n      data-label=\"Play\"\n      data-true=\"Go!\"\n      data-false=\"Resume Reader\"\n      data-value=\"1\"></div>\n  </section>\n  <section id=\"camera\">\n    <h2>Camera</h2>\n    <div class=\"toggle\" id=\"expandcamera\"\n      data-label=\"Camera\"\n      data-true=\"Hide\"\n      data-false=\"Show\"\n      data-value=\"0\"></div>\n    <div class=\"slider\" id=\"brightness\" \n      data-label=\"Brightness\"\n      data-min=\"-100\"\n      data-max=\"100\"\n      data-value=\"0\"\n      data-concerns=\"interpreter\"></div>\n    <div class=\"slider\" id=\"contrast\" \n      data-label=\"Contrast\"\n      data-min=\"-100\"\n      data-max=\"100\"\n      data-value=\"0\"\n      data-concerns=\"interpreter\"></div>\n    <div class=\"slider\" id=\"blend\" \n      data-label=\"Blend Frames\"\n      data-min=\"1\"\n      data-max=\"25\"\n      data-value=\"3\"\n      data-concerns=\"interpreter\"></div>\n    <div class=\"slider\" id=\"sharpen\" \n      data-label=\"Sharpen\"\n      data-min=\"0\"\n      data-max=\"5\"\n      data-value=\"0\"\n      data-float=\"true\"\n      data-concerns=\"interpreter\"></div>\n  </section>\n  <section id=\"stats\">\n    <h2>Statistics</h2>\n    <div class=\"graph\" id=\"fps\">\n      <canvas height=\"100\"></canvas>\n      <span></span>\n    </div>\n  </section>\n  <section id=\"codepreview\">\n    <h2>Code Preview</h2>\n    <pre><code id=\"preview\"></code></pre>\n  </section>\n</div>";
  return buffer;});
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
    "remote": "remote",
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


  return "<nav>\n  <a class=\"logo\" href=\"#\">\n    <h3 class=\"decoded\">Decoded</h3>\n    <h1><span>{</span>code<span>}</span>cards</h1>\n  </a>\n  <section class=\"pin-entry hide\"></section>\n</nav>\n<section>\n  <div id=\"camview\">\n    <div>\n      <canvas id=\"canvas\" width=\"640\" height=\"480\"></canvas>\n    </div>\n    <a class=\"toggler\"></a>\n  </div>\n  <div id=\"mainview\">\n    <div id=\"code\">\n      <h3 id=\"alert\">Please allow your webcam...</h3>\n      <pre><code class=\"language-js\"></code></pre>\n    </div>\n    <div id=\"mission\">\n    </div>\n  </div>\n</section>";});
}});

window.require.define({"ui/slider": function(exports, require, module) {
  var Slider, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('ui/templates/slider');

module.exports = Slider = (function(_super) {

  __extends(Slider, _super);

  function Slider() {
    return Slider.__super__.constructor.apply(this, arguments);
  }

  Slider.prototype.initialize = function() {
    var el, o, _ths;
    _ths = this;
    o = this.options;
    el = this.$el;
    this.model = new Backbone.Model({
      label: o.label || el.data('label' || 'Label'),
      max: o.max || parseFloat(el.data('max' || 100)),
      min: o.min || parseFloat(el.data('min' || 0)),
      value: o.value || parseFloat(el.data('value' || 50)),
      float: o.float || el.data('float' || false)
    });
    this.o = this.model.toJSON();
    this.model.on('change', function() {
      return _ths.o = this.toJSON();
    });
    this.model.on('change:value', function() {
      return _ths.update();
    });
    return this.render();
  };

  Slider.prototype.render = function() {
    var doc, input, model, track, _ths;
    model = this.model.toJSON();
    this.$el.html(template(model));
    this.$el.addClass('slider');
    track = this.track = this.$('.track');
    input = this.input = this.$('input');
    this.thumb = this.$('.thumb');
    doc = $(document);
    this.update();
    _ths = this;
    track.on('mousedown', function(e) {
      var start;
      e.preventDefault();
      start = Date.now();
      _ths.setFromCoord(e.pageX);
      doc.on('mousemove.slider' + start, function(e) {
        e.preventDefault();
        return _ths.setFromCoord(e.pageX);
      });
      return doc.one('mouseup', function(e) {
        e.preventDefault();
        doc.off('mousemove.slider' + start);
        return _ths.setFromCoord(e.pageX);
      });
    });
    return track.on('touchstart', function(e) {
      var touch, tracking;
      e.preventDefault();
      touch = e.changedTouches[0];
      tracking = touch.identifier;
      _ths.setFromCoord(touch.pageX);
      doc.on('touchmove.slider' + tracking, function(e) {
        var touches, _i, _len, _ref, _results;
        touches = e.changedTouches;
        _ref = e.changedTouches;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          touch = _ref[_i];
          if (touch.identifier === tracking) {
            _results.push(_ths.setFromCoord(touch.pageX));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      return doc.one('touchend', function(e) {
        var touches, _i, _len, _ref, _results;
        touches = e.changedTouches;
        _ref = e.changedTouches;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          touch = _ref[_i];
          if (touch.identifier === tracking) {
            _ths.setFromCoord(touch.pageX);
            _results.push(doc.off('touchmove.slider' + tracking));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    });
  };

  Slider.prototype.update = function() {
    var o, v;
    o = this.o;
    v = this.model.get('value');
    this.thumb.css('left', ((v - o.min) / (o.max - o.min)) * 100 + '%');
    this.input.val(v);
    return this.trigger('change', v);
  };

  Slider.prototype.setValue = function(v) {
    var o, value;
    o = this.o;
    value = o.min + v * (o.max - o.min);
    return this.model.set('value', o.float ? value.toFixed(2) : Math.round(value));
  };

  Slider.prototype.setFromCoord = function(x) {
    var left, max, min, v;
    left = this.track.offset().left;
    min = left + 19;
    max = left + this.track.width() - 19;
    if (x < min) {
      v = 0;
    } else if (x > max) {
      v = 1;
    } else {
      v = (x - min) / (max - min);
    }
    return this.setValue(v);
  };

  return Slider;

})(Backbone.View);

}});

window.require.define({"ui/templates/slider": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "  <div class=\"label\">";
  foundHelper = helpers.label;
  stack1 = foundHelper || depth0.label;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>\n  <input type=\"number\" value=\"";
  foundHelper = helpers.value;
  stack1 = foundHelper || depth0.value;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "value", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" max=\"";
  foundHelper = helpers.max;
  stack1 = foundHelper || depth0.max;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "max", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" min=\"";
  foundHelper = helpers.min;
  stack1 = foundHelper || depth0.min;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "min", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\n  <div class=\"track\">\n    <div class=\"thumb\"></div>\n  </div>\n";
  return buffer;});
}});

window.require.define({"ui/templates/toggle": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div class=\"label\">";
  foundHelper = helpers.label;
  stack1 = foundHelper || depth0.label;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>\n<button>";
  foundHelper = helpers.text;
  stack1 = foundHelper || depth0.text;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</button>";
  return buffer;});
}});

window.require.define({"ui/toggle": function(exports, require, module) {
  var Toggle, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('ui/templates/toggle');

module.exports = Toggle = (function(_super) {

  __extends(Toggle, _super);

  function Toggle() {
    return Toggle.__super__.constructor.apply(this, arguments);
  }

  Toggle.prototype.initialize = function() {
    var el, o, _ths;
    _ths = this;
    o = this.options;
    el = this.$el;
    this.model = new Backbone.Model({
      label: o.label || el.data('label' || 'Label'),
      value: o.value || parseInt(el.data('value' || true)) ? true : false,
      "true": o["true"] || el.data('true' || 'True'),
      "false": o["false"] || el.data('false' || 'False')
    });
    this.o = this.model.toJSON();
    this.model.on('change', function() {
      _ths.o = this.toJSON();
      _ths.o.text = _ths.o.value ? _ths.o["true"] : _ths.o["false"];
      return _ths.trigger('change', _ths.o.value);
    });
    this.model.trigger('change');
    return this.render();
  };

  Toggle.prototype.render = function() {
    var button, model, _ths;
    _ths = this;
    model = this.o;
    this.$el.html(template(model));
    this.$el.addClass('toggle');
    button = this.$('button');
    return button.on('click', function() {
      var value;
      value = !_ths.model.get('value');
      button.text(_ths.model.get(value ? 'true' : 'false'));
      return _ths.model.set('value', value);
    });
  };

  return Toggle;

})(Backbone.View);

}});

window.require.define({"ui/ui": function(exports, require, module) {
  var UI;

module.exports = UI = {
  Slider: require('ui/slider'),
  Toggle: require('ui/toggle')
};

}});

