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


window.require.define({"CodeCards/CodeCards": function(exports, require, module) {
  var CodeCards, Controller, Interpreter, Mission, Stats, codeTemplate, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Interpreter = require('CodeCards/interpreter');

Controller = require('CodeCards/controller');

Stats = require('lib/stats');

Mission = require('CodeCards/mission');

template = require('templates/CodeCards');

codeTemplate = require('CodeCards/templates/code');

Handlebars.registerHelper('safe', function(html) {
  return new Handlebars.SafeString(html);
});

module.exports = CodeCards = (function(_super) {

  __extends(CodeCards, _super);

  function CodeCards() {
    return CodeCards.__super__.constructor.apply(this, arguments);
  }

  CodeCards.prototype.start = function() {
    var $code, mission, _ths;
    $code = $('#code>div');
    _ths = this;
    this.interpreter = new Interpreter({
      el: this.$('#canvas')
    });
    this.interpreter.on('error', function(error) {
      if (_ths.play) {
        $('#code-status').html('Error: ' + error);
        _ths.stats.tick();
        return _ths.controller.send('tick', {
          fps: _ths.stats.fps,
          interval: _ths.stats.interval,
          status: 'error',
          message: error
        });
      }
    });
    this.interpreter.on('success', function(results) {
      var code;
      if (_ths.play) {
        $('#code-status').html('Running...');
        _ths.stats.tick();
        code = mission.language.build(results);
        $code.html(codeTemplate(code));
        _ths.controller.send('tick', {
          fps: _ths.stats.fps,
          interval: _ths.stats.interval,
          status: 'success',
          code: code.html
        });
        _ths.code = code.string;
        return _ths.trigger('code', code.string);
      }
    });
    this.setupController();
    this.mission = mission = new Mission('fox');
    return this.on('change:play', function() {
      this.interpreter.UserMedia.paused = !this.play;
      if (!this.play) {
        this.mission.run(this.code);
        return $('#alert').html('Paused.');
      } else {
        return this.mission.reset();
      }
    });
  };

  CodeCards.prototype.setupController = function() {
    var controller, _ths;
    _ths = this;
    return controller = this.controller = new Controller({
      el: this.$('.pin-entry'),
      CC: this
    });
  };

  CodeCards.prototype.interact = function() {
    var camView, canCont, sec, toggler;
    sec = this.$('section');
    toggler = this.$('.toggler');
    toggler.on('click', function() {
      return sec.toggleClass('extended');
    });
    this.on('toggle-camera', function(val) {
      if (!val) {
        return sec.addClass('extended');
      } else {
        return sec.removeClass('extended');
      }
    });
    canCont = this.$('#camview .cnvs');
    camView = this.$('#camview');
    return canCont.on('click', function() {
      return camView.toggleClass('hide-cnvs');
    });
  };

  CodeCards.prototype.render = function(callback, ctx) {
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

  CodeCards.prototype.unrender = function(callback, ctx) {
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

  CodeCards.prototype.name = 'main';

  CodeCards.prototype.play = true;

  CodeCards.prototype.code = "Util.alert('No code available.');";

  return CodeCards;

})(Backbone.View);

}});

window.require.define({"CodeCards/controller": function(exports, require, module) {
  var Controller, RC, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('CodeCards/templates/controller');

RC = require('remote/RC');

module.exports = Controller = (function(_super) {

  __extends(Controller, _super);

  function Controller() {
    return Controller.__super__.constructor.apply(this, arguments);
  }

  Controller.prototype.initialize = function() {
    var CC, rc;
    rc = this.rc = new RC.Local({
      el: $('#local-RC')
    });
    CC = this.options.CC;
    rc.options.add([
      {
        "with": CC,
        event: 'toggle-camera',
        label: 'Camera',
        type: 'toggle-button',
        value: true,
        "true": 'Show',
        "false": 'Hide',
        group: 'Camera'
      }, {
        "with": CC.interpreter,
        property: 'brightness',
        label: 'Brightness',
        type: 'range',
        min: -100,
        max: 100,
        group: 'Camera'
      }, {
        "with": CC.interpreter,
        property: 'contrast',
        label: 'Contrast',
        type: 'range',
        min: -100,
        max: 100,
        group: 'Camera'
      }, {
        "with": CC.interpreter,
        property: 'sharpen',
        label: 'Sharpen',
        type: 'range',
        float: true,
        min: 0,
        max: 5,
        group: 'Camera'
      }, {
        "with": CC.interpreter,
        property: 'distanceLimit',
        label: 'Distance Limit',
        type: 'range',
        float: true,
        min: 0,
        max: 15,
        group: 'Camera'
      }
    ]);
    return this.render();
  };

  Controller.prototype.render = function() {
    var cancel, connect, open, pin, status, submit, _ths;
    this.$el.html(template());
    _ths = this;
    open = this.$('.remote');
    connect = this.$('.go');
    cancel = this.$('.cancel');
    pin = this.$('input');
    status = this.$('.status');
    this.rc.on('status', function(msg) {
      if (msg === 'Wrong pin.') {
        open.trigger('click');
      }
      return status.html(msg);
    });
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
        return _ths.rc.connect(val);
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

  Controller.prototype.send = function(event, data) {
    return this.rc.send(event, data);
  };

  return Controller;

})(Backbone.View);

}});

window.require.define({"CodeCards/interpreter": function(exports, require, module) {
  var HighLighter, Interpreter, UserMedia, WebWorker,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

UserMedia = require('lib/usermedia');

HighLighter = require('lib/highlighter');

WebWorker = require('lib/worker');

module.exports = Interpreter = (function(_super) {

  __extends(Interpreter, _super);

  function Interpreter() {
    return Interpreter.__super__.constructor.apply(this, arguments);
  }

  Interpreter.prototype.imageData = [];

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
          blend: 1,
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

window.require.define({"CodeCards/language": function(exports, require, module) {
  var Language;

module.exports = Language = (function() {

  function Language(lang, process) {
    var key, language, words;
    if (process == null) {
      process = true;
    }
    this.words = {
      0: {
        word: "\n",
        print: "Start ->"
      }
    };
    this.replace = [];
    this.format = [];
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
        if (language.replace) {
          this.replace = this.replace.concat(language.replace || []);
        }
        if (language.format) {
          if (typeof language.format === 'string') {
            this.format.push(language.format);
          } else if (typeof language.format === 'object') {
            this.format = this.format.concat(language.format);
          } else {
            throw new TypeError("format can only be string or array, not " + (typeof language.format));
          }
        }
        if (language["extends"]) {
          language = new Language(language["extends"], false);
          this.replace = this.replace.concat(language.replace || []);
          this.format = this.format.concat(language.format);
        }
        this.merge(this.words, language.words);
        this.merge(this.words, words);
      }
    }
    if (process) {
      this.buildGroups();
      this.buildReplacers();
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

  Language.prototype.build = function(source) {
    var addError, css, eList, err, errors, format, html, i, item, line, lineList, lineNo, out, replace, tag, word, words, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _ref, _ref1, _ref2;
    tag = 'div';
    out = "";
    words = this.words;
    for (_i = 0, _len = source.length; _i < _len; _i++) {
      item = source[_i];
      out += this.getWord(item);
    }
    _ref = this.replace;
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      replace = _ref[_j];
      out = out.replace(replace.replace, replace["with"]);
    }
    _ref1 = this.format;
    for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
      format = _ref1[_k];
      if (this.formatters[format]) {
        out = this.formatters[format](out);
      }
    }
    lineNo = 0;
    errors = [];
    eList = {};
    addError = function(msg) {
      eList[lineNo] = true;
      return errors.push("" + lineNo + ": " + msg);
    };
    for (i = _l = 0, _ref2 = source.length; 0 <= _ref2 ? _l <= _ref2 : _l >= _ref2; i = 0 <= _ref2 ? ++_l : --_l) {
      if (source[i] === 0) {
        lineNo += 1;
      } else {
        word = words[source[i]];
        if (word && word.follows) {
          err = false;
          if (typeof word.follows === 'number' && source[i - 1] !== word.follows) {
            addError("\"" + (this.getWord(source[i]).trim()) + "\" must follow \"" + (this.getWord(word.follows).trim()) + "\"");
          } else if (typeof word.follows === 'string' && (typeof words[source[i - 1]].group === 'undefined' || words[source[i - 1]].group !== word.follows)) {
            addError("\"" + (this.getWord(source[i]).trim()) + "\" can't follow \"" + (this.getWord(source[i - 1]).trim()) + "\"");
          }
        }
      }
    }
    html = "";
    lineNo = 0;
    lineList = out.split("\n");
    for (_m = 0, _len3 = lineList.length; _m < _len3; _m++) {
      line = lineList[_m];
      lineNo++;
      css = eList[lineNo] ? 'line error' : 'line';
      html += "<" + tag + " class=\"" + css + "\" data-line=\"" + lineNo + "\">" + line + "</" + tag + ">";
    }
    return {
      string: out,
      html: html,
      errors: errors
    };
  };

  Language.prototype.getWord = function(key) {
    var out, word;
    word = this.words[key];
    if (typeof word === 'string') {
      return word;
    }
    if (typeof word === 'object') {
      out = word.word || word.display || word.print || false;
      if (out === false) {
        throw new ReferenceError("Can't find a suitable property to return on word " + key);
      }
      return out;
    }
  };

  Language.prototype.buildGroups = function() {
    var group, groups, key, words, _i, _len, _ref;
    groups = {};
    words = this.words;
    for (key in words) {
      if (words[key].group) {
        if (typeof words[key].group !== 'string') {
          throw new TypeError("Group name must be string, not " + (typeof words[key].group) + " in " + key + ".");
        } else {
          _ref = words[key].group.split(' ');
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            group = _ref[_i];
            if (!groups[group]) {
              groups[group] = [];
            }
            groups[group].push(key);
          }
        }
      }
    }
    return this.groups = groups;
  };

  Language.prototype.buildReplacers = function() {
    var data, group, groups, key, name, replace, template, _i, _j, _len, _len1, _ref, _ref1;
    this.setupHandlebars();
    groups = this.groups;
    data = {};
    for (name in groups) {
      group = [];
      _ref = groups[name];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        group.push(this.regexEscape(this.getWord(key)));
      }
      data[name] = "(" + (group.join('|')) + ")";
    }
    _ref1 = this.replace;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      replace = _ref1[_j];
      if (typeof replace !== 'object') {
        throw new TypeError("Replace should be object, not " + (typeof replace) + ".");
      } else {
        template = Handlebars.compile(replace.replace);
        replace.replace = new RegExp(template(data), "g");
      }
    }
    return null;
  };

  Language.prototype.setupHandlebars = function() {
    return Handlebars.registerHelper('not', function(str) {
      return "(?!" + str + ")";
    });
  };

  Language.prototype.regexEscape = function(str) {
    str = str.replace('\\', '\\\\');
    str = str.replace('.', '\\.');
    str = str.replace('+', '\\+');
    str = str.replace('*', '\\*');
    str = str.replace('?', '\\?');
    str = str.replace('^', '\\^');
    str = str.replace('$', '\\$');
    str = str.replace('[', '\\[');
    str = str.replace(']', '\\]');
    str = str.replace('(', '\\(');
    str = str.replace(')', '\\)');
    str = str.replace('|', '\\|');
    str = str.replace('{', '\\}');
    str = str.replace('}', '\\}');
    str = str.replace('/', '\\/');
    str = str.replace('\'', '\\\'');
    return str = str.replace('#', '\\#');
  };

  Language.prototype.formatters = {
    js_beautify: js_beautify
  };

  return Language;

})();

}});

window.require.define({"CodeCards/mission": function(exports, require, module) {
  var Language, Mission,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Language = require('CodeCards/language');

module.exports = Mission = (function(_super) {

  __extends(Mission, _super);

  function Mission() {
    return Mission.__super__.constructor.apply(this, arguments);
  }

  Mission.prototype.initialize = function(name) {
    var controller, language, m;
    this.m = m = {
      view: '2up',
      interpreter: 'linear',
      continuous: false
    };
    controller = App.codeCards.controller;
    _.extend(m, require("data/missions/" + name + ".mission"));
    if (typeof m.initialize !== 'function') {
      throw new TypeError("mission.initialize should be a function not " + (typeof m.initialize) + ".");
    }
    if (typeof m.language !== 'object') {
      throw new TypeError("mission.language should be an object not " + (typeof m.language) + ".");
    }
    if (typeof m.reset !== 'function') {
      throw new TypeError("mission.reset should be a function not " + (typeof m.reset) + ".");
    }
    if (typeof m.run !== 'function') {
      throw new TypeError("mission.run should be a function not " + (typeof m.run) + ".");
    }
    if (_.indexOf(this.accepted.view, m.view) === -1) {
      throw new RangeError("mission.view should be " + (this.accepted.view.join(' or ')) + ", not " + m.view + ".");
    }
    if (_.indexOf(this.accepted.interpreter, m.interpreter) === -1) {
      throw new RangeError("mission.interpreter should be " + (this.accepted.interpreter.join(' or ')) + ", not " + m.interpreter + ".");
    }
    if (typeof m.continuous !== 'boolean') {
      throw new TypeError("mission.continuous should be boolean not " + (typeof m.continuous) + ".");
    }
    if (!m.continuous) {
      controller.rc.options.add({
        "with": App.codeCards,
        property: 'play',
        event: 'change:play',
        label: 'Mission',
        type: 'toggle-button',
        "true": 'Play!',
        "false": 'Reset',
        value: true
      });
    }
    if (m.view === '2up') {
      $('#mainview').removeClass('view-fullscreen');
      controller.rc.options.add({
        "with": this,
        event: 'fullscreen',
        label: 'Fullscreen mode',
        type: 'toggle-button',
        "true": 'Turn off',
        "false": 'Turn on',
        value: false
      });
      this.on('fullscreen', function(fs) {
        if (fs) {
          return $('#mainview').addClass('view-fullscreen');
        } else {
          return $('#mainview').removeClass('view-fullscreen');
        }
      });
    } else {
      $('#mainview').addClass('view-fullscreen');
    }
    m.initialize({
      rc: controller.rc,
      el: $('#mission')[0]
    });
    return language = this.language = new Language(m.language);
  };

  Mission.prototype.run = function(data) {
    return this.m.run(data);
  };

  Mission.prototype.reset = function() {
    return this.m.reset();
  };

  Mission.prototype.accepted = {
    view: ['2up', 'fullscreen'],
    interpreter: ['linear']
  };

  return Mission;

})(Backbone.View);

}});

window.require.define({"CodeCards/templates/code": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return "\n    <h4>Errors:</h4>\n  ";}

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <div>";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>\n  ";
  return buffer;}

  buffer += "<pre><code>";
  foundHelper = helpers.html;
  stack1 = foundHelper || depth0.html;
  foundHelper = helpers.safe;
  stack2 = foundHelper || depth0.safe;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "safe", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</code></pre>\n<div class=\"errors\">\n  ";
  foundHelper = helpers.errors;
  stack1 = foundHelper || depth0.errors;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.length);
  stack2 = helpers['if'];
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  ";
  foundHelper = helpers.errors;
  stack1 = foundHelper || depth0.errors;
  stack2 = helpers.each;
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>";
  return buffer;});
}});

window.require.define({"CodeCards/templates/controller": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<div>\n  <h3>Enter your pin:</h3>\n  <input type=\"tel\" name=\"pin-number\" maxlength=\"4\" placeholder=\"****\">\n  <button class=\"go\">Connect</button>\n  <button class=\"cancel\">Cancel</button>\n</div>\n<a class=\"remote\">\n  <img src=\"/svg/remote-yellow.svg\" width=\"46\">\n</a>\n<p class=\"status\"></p>";});
}});

window.require.define({"data/languages/blank.lang": function(exports, require, module) {
  
module.exports = {
  name: "blank",
  version: 0,
  words: {
    600: 'x',
    601: 'x',
    602: 'x',
    603: 'x',
    604: 'x',
    605: 'x',
    606: 'x',
    607: 'x',
    608: 'x',
    609: 'x',
    610: 'xx',
    611: 'xx',
    612: 'xx',
    613: 'xx',
    614: 'xx',
    615: 'xx',
    616: 'xx',
    617: 'xx',
    618: 'xx',
    619: 'xx',
    620: 'xxx',
    621: 'xxx',
    622: 'xxx',
    623: 'xxx',
    624: 'xxx',
    625: 'xxx',
    626: 'xxx',
    627: 'xxx',
    628: 'xxx',
    629: 'xxx',
    630: 'xxxx',
    631: 'xxxx',
    632: 'xxxx',
    633: 'xxxx',
    634: 'xxxx',
    635: 'xxxx',
    636: 'xxxx',
    637: 'xxxx',
    638: 'xxxx',
    639: 'xxxx',
    640: 'xxxxx',
    641: 'xxxxx',
    642: 'xxxxx',
    643: 'xxxxx',
    644: 'xxxxx',
    645: 'xxxxx',
    646: 'xxxxx',
    647: 'xxxxx',
    648: 'xxxxx',
    649: 'xxxxx',
    650: 'xxxxxx',
    651: 'xxxxxx',
    652: 'xxxxxx',
    653: 'xxxxxx',
    654: 'xxxxxx',
    655: 'xxxxxx',
    656: 'xxxxxx',
    657: 'xxxxxx',
    658: 'xxxxxx',
    659: 'xxxxxx'
  }
};

}});

window.require.define({"data/languages/fox.lang": function(exports, require, module) {
  
module.exports = {
  name: "fox",
  version: 0,
  "extends": {
    "friendly.js": 0
  },
  words: {
    500: {
      word: "fox",
      img: "http://i.imgur.com/mIkYE.png",
      group: "objects"
    },
    501: {
      word: ".look",
      print: "look",
      group: "methods",
      follows: 500
    },
    504: {
      word: ".touch",
      print: "touch",
      group: "methods",
      follows: 500
    },
    502: {
      word: ".move",
      print: "move",
      group: "methods",
      follows: 500
    },
    503: {
      word: ".turn",
      print: "turn",
      group: "methods",
      follows: 500
    },
    510: {
      word: "forward",
      group: "arguments",
      follows: "methods"
    },
    511: {
      word: "back",
      group: "arguments",
      follows: "methods"
    },
    512: {
      word: "left",
      group: "arguments",
      follows: "methods"
    },
    513: {
      word: "right",
      group: "arguments",
      follows: "methods"
    },
    520: {
      word: "empty",
      group: "objects"
    },
    521: {
      word: "wall",
      img: "http://i.imgur.com/3nZae.png",
      group: "objects"
    },
    522: {
      word: "cake",
      img: "http://i.imgur.com/uS9s8.png",
      group: "objects"
    },
    525: {
      word: "goblin",
      img: "http://i.imgur.com/g3Mix.png",
      group: "objects"
    }
  }
};

}});

window.require.define({"data/languages/friendly.js.lang": function(exports, require, module) {
  
module.exports = {
  name: 'friendly.js',
  version: 0,
  "extends": {
    'js': 0
  },
  words: {
    38: {
      word: ' === ',
      print: 'is'
    },
    39: {
      word: ' !== ',
      print: "isn't"
    },
    44: {
      word: ' && ',
      print: 'and'
    },
    45: {
      word: ' || ',
      print: 'or'
    },
    46: {
      word: ' ! ',
      print: 'not'
    }
  },
  replace: [
    {
      replace: "{{methods}} *?{{not arguments}}",
      "with": "$1()"
    }, {
      replace: "{{methods}} *?{{arguments}}",
      "with": "$1($2)"
    }
  ]
};

}});

window.require.define({"data/languages/js.lang": function(exports, require, module) {
  
module.exports = {
  name: 'js',
  format: 'js_beautify',
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

window.require.define({"data/missions/fox.mission": function(exports, require, module) {
  
module.exports = {
  language: {
    fox: 0
  },
  initialize: function(mission) {
    var $el, getSprite, name, template, _i, _len, _ref, _ths;
    _ths = this;
    template = require('data/missions/templates/sample');
    $el = $(mission.el);
    $el.addClass('sample');
    $el.html(template());
    mission.rc.options.add({
      "with": this,
      callback: this.toggleGoblin,
      label: "Goblin",
      type: 'toggle-button',
      value: this.goblin,
      "true": "Turn off Goblin",
      "false": "Turn on Goblin"
    });
    getSprite = function(name) {
      var el;
      el = $el.find("." + name);
      el.on('load', function() {
        return _ths.reset();
      });
      return _ths.sprite[name].image = el[0];
    };
    _ref = ['player', 'cake', 'wall', 'bg', 'goblin'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      getSprite(name);
    }
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
    this.drawSprite({
      x: 2,
      y: 2,
      rot: 1
    }, 'player');
    if (this.goblin) {
      return this.drawSprite({
        x: 17,
        y: 12,
        rot: 1
      }, 'goblin');
    }
  },
  run: function(str) {
    var Character, animator, back, cake, characters, displayMap, empty, forward, fox, gameMap, goblin, i, left, lookGoblin, moveGoblin, player, right, success, wall, _i, _ref, _results, _ths;
    this.reset();
    _ths = this;
    gameMap = Util.clone(this.map);
    displayMap = this.displayMap = Util.clone(this.map);
    animator = this.animator;
    empty = 0;
    wall = 1;
    cake = 2;
    forward = 0;
    back = 2;
    right = 1;
    left = 3;
    characters = [];
    Character = (function() {

      function Character(name, pos, direction, player) {
        this.name = name;
        this.pos = pos;
        this.direction = direction != null ? direction : 0;
        this.player = player != null ? player : false;
        characters.push(this);
        this;

      }

      Character.prototype.look = function(direction) {
        var change, char, tile, _i, _len;
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
          for (_i = 0, _len = characters.length; _i < _len; _i++) {
            char = characters[_i];
            if (change.x === char.pos.x && change.y === char.pos.y) {
              tile = char;
            }
          }
        }
        return tile;
      };

      Character.prototype.move = function(direction) {
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
          animator.animate(this.name, 200, change);
          if (this.player && gameMap[change.y][change.x] === cake) {
            gameMap[change.y][change.x] = empty;
            return animator.callback(this.name, function() {
              displayMap[change.y][change.x] = empty;
              _ths.score++;
              return _ths.updateScore();
            });
          }
        }
      };

      Character.prototype.touch = function(direction) {
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
      };

      Character.prototype.turn = function(direction) {
        direction = (this.direction + direction) % 4;
        animator.animate(this.name, 1, {
          rot: direction
        });
        return this.direction = direction;
      };

      return Character;

    })();
    fox = player = new Character('player', {
      x: 2,
      y: 2
    }, 0, true);
    goblin = new Character('goblin', {
      x: 17,
      y: 14
    }, 2);
    animator.register('player', {
      x: player.pos.x,
      y: player.pos.y,
      rot: 0,
      draw: function(geom) {
        return _ths.drawSprite(geom, 'player');
      }
    });
    animator.register('goblin', {
      x: 17,
      y: 14,
      rot: 0,
      draw: function(geom) {
        return _ths.drawSprite(geom, 'goblin');
      }
    });
    moveGoblin = function() {
      lookGoblin();
      goblin.move();
      return lookGoblin();
    };
    lookGoblin = function() {
      console.log(goblin.look(left));
      if (goblin.look(left) === player) {
        goblin.turn(left);
      }
      if (goblin.look(right) === player) {
        goblin.turn(right);
      }
      if (goblin.touch() === wall) {
        str = "" + goblin.direction + " " + (goblin.pos.x < player.pos.x) + " " + (goblin.pos.y < player.pos.y);
        switch (str) {
          case "0 true false":
          case "0 false false":
          case "1 true true":
          case "1 true false":
          case "2 true true":
          case "2 false true":
          case "3 false true":
          case "3 false false":
            return goblin.turn(left);
          default:
            return goblin.turn(right);
        }
      }
    };
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
        if (this.goblin) {
          moveGoblin();
        }
        _results.push(animator.callback('player', function() {
          _ths.remaining--;
          return _ths.updateScore();
        }));
      }
      return _results;
    }
  },
  animator: new Animator(false),
  drawSprite: function(geom, name) {
    var ctx, rot, size, sprite, x, y;
    size = this.size;
    ctx = this.ctx;
    sprite = this.sprite[name];
    x = geom.x;
    y = geom.y;
    rot = Math.round(geom.rot);
    sprite.current = ['right', 'down', 'left', 'up'][rot % 4];
    if ((sprite.stage += 0.2) >= sprite[sprite.current].length) {
      sprite.stage = 0;
    }
    return ctx.drawImage(sprite.image, Math.floor(sprite.stage) * sprite.tile, sprite[sprite.current].row * sprite.tile, sprite.tile, sprite.tile, x * size, y * size, size, size);
  },
  drawScene: function() {
    var bgSprite, cakeSprite, ctx, height, m, size, wallSprite, width, x, y, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
    width = this.width;
    height = this.height;
    size = this.size;
    ctx = this.ctx;
    m = this.displayMap || this.map;
    cakeSprite = this.sprite.cake;
    wallSprite = this.sprite.wall;
    bgSprite = this.sprite.bg;
    size = this.size;
    if ((cakeSprite.stage += 0.2) >= cakeSprite[cakeSprite.current].length) {
      cakeSprite.stage = 0;
    }
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
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
    for (y = _k = 0, _ref2 = m.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; y = 0 <= _ref2 ? ++_k : --_k) {
      for (x = _l = 0, _ref3 = m[y].length; 0 <= _ref3 ? _l < _ref3 : _l > _ref3; x = 0 <= _ref3 ? ++_l : --_l) {
        ctx.drawImage(bgSprite.image, x * size, y * size);
        if (m[y][x]) {
          if (m[y][x] === 1) {
            ctx.drawImage(wallSprite.image, x * size, y * size);
          }
          if (m[y][x] === 2) {
            ctx.drawImage(cakeSprite.image, Math.floor(cakeSprite.stage) * cakeSprite.tile, cakeSprite[cakeSprite.current].row * cakeSprite.tile, cakeSprite.tile, cakeSprite.tile, x * size, y * size, size, size);
          }
        }
      }
    }
    return null;
  },
  updateScore: function() {
    $('#score').text("Score: " + this.score);
    return $('#remain').text("Remaining: " + this.remaining);
  },
  toggleGoblin: function(val) {
    this.goblin = val;
    return this.reset();
  },
  map: [[2, 2, 2, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 2, 2, 2], [2, 2, 0, 0, 0, 0, 0, 1, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 2, 2], [2, 0, 0, 0, 2, 0, 0, 1, 0, 2, 2, 0, 1, 0, 0, 2, 0, 0, 0, 2], [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0], [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0], [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0], [2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2], [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2], [2, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 1, 0, 2, 2, 0, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0], [0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0], [0, 2, 0, 2, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 2, 0, 2, 0], [0, 2, 0, 2, 0, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 0, 2, 0, 2, 0], [0, 0, 0, 2, 0, 1, 2, 2, 0, 0, 0, 0, 2, 2, 1, 0, 2, 0, 0, 0], [0, 0, 0, 0, 0, 1, 2, 2, 2, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 0]],
  sprite: {
    player: {
      right: {
        row: 0,
        length: 4
      },
      left: {
        row: 1,
        length: 4
      },
      up: {
        row: 2,
        length: 8
      },
      down: {
        row: 3,
        length: 4
      },
      current: 'down',
      stage: 0,
      tile: 32
    },
    goblin: {
      right: {
        row: 0,
        length: 3
      },
      left: {
        row: 1,
        length: 3
      },
      up: {
        row: 2,
        length: 4
      },
      down: {
        row: 3,
        length: 4
      },
      current: 'left',
      stage: 0,
      tile: 32
    },
    cake: {
      cake: {
        row: 0,
        length: 3
      },
      current: 'cake',
      stage: 0,
      tile: 32
    },
    wall: {
      tile: 32
    },
    bg: {
      tile: 32
    }
  },
  goblin: true
};

}});

window.require.define({"data/missions/templates/sample": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<canvas width=\"640\" height=\"480\"></canvas>\n<h3 id=\"remain\">Remaining:</h3>\n<h3 id=\"score\">Score:</h3>\n<p>Images and stuff lovingly &quot;borrowed&quot; from Mozilla's BrowserQuest.</p>\n<img class=\"player\" style=\"display: none;\" src=\"/missions/sample/ff.png\">\n<img class=\"cake\" style=\"display: none;\" src=\"/missions/sample/cake.png\">\n<img class=\"wall\" style=\"display: none;\" src=\"/missions/sample/wall.png\">\n<img class=\"bg\" style=\"display: none;\" src=\"/missions/sample/bg.png\">\n<img class=\"goblin\" style=\"display: none;\" src=\"/missions/sample/goblin.png\">";});
}});

window.require.define({"home": function(exports, require, module) {
  var Loader, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('templates/home');

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
        if (index === 1) {
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
      if (index === 1) {
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

window.require.define({"initialize": function(exports, require, module) {
  var App, CodeCards, Home, Remote, Router,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

require('lib/util');

Router = require('router');

Home = require('home');

CodeCards = require('CodeCards/CodeCards');

Remote = require('remote');

module.exports = App = (function(_super) {

  __extends(App, _super);

  function App() {
    return App.__super__.constructor.apply(this, arguments);
  }

  App.prototype.initialize = function() {
    var router, _ths;
    window.Util.animationFrame();
    this.cont = $('#container');
    this.$body = $(document.body);
    router = new Router;
    _ths = this;
    router.on('route:root', function() {
      return _ths.start(Home, 'home');
    });
    router.on('route:codecards', function() {
      return _ths.start(CodeCards, 'codeCards');
    });
    router.on('route:remote', function() {
      return _ths.start(Remote, 'remote');
    });
    Backbone.history.start();
    return window.router = router;
  };

  App.prototype.start = function(page, name) {
    this.$body.addClass('transitioning');
    window.scrollTo(0, 0);
    return this.unrenderCurrent(function() {
      this[name] = new page({
        el: this.cont
      });
      this.current = this[name];
      return this.renderCurrent();
    });
  };

  App.prototype.renderCurrent = function() {
    var _ths;
    this.cont.addClass(this.current.name);
    _ths = this;
    return this.current.render(function() {
      return _ths.$body.removeClass('transitioning');
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

window.require.define({"lib/highlighter": function(exports, require, module) {
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

window.require.define({"lib/stats": function(exports, require, module) {
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

window.require.define({"lib/usermedia": function(exports, require, module) {
  var UserMedia,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = UserMedia = (function(_super) {

  __extends(UserMedia, _super);

  function UserMedia() {
    return UserMedia.__super__.constructor.apply(this, arguments);
  }

  UserMedia.prototype.initialize = function() {
    var error, success, _ths;
    _ths = this;
    success = function(stream) {
      var ctx, vendorURL, video;
      video = document.createElement('video');
      video.autoplay = true;
      console.log(stream);
      if (navigator.mozGetUserMedia) {
        video.mozSrcObject = stream;
      } else {
        vendorURL = window.URL || window.webkitURL;
        video.src = vendorURL.createObjectURL(stream);
      }
      video.play();
      $(document.body).append(video);
      _ths.ctx = ctx = _ths.el.getContext('2d');
      return Util.on('animationFrame', function() {
        if (!_ths.paused) {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            if (_ths.el.isSetUp) {
              ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
              _ths.imageData = _ths.ctx.getImageData(0, 0, _ths.el.width, _ths.el.height);
              return _ths.trigger('imageData');
            } else if (video.videoWidth) {
              _ths.el.setAttribute('width', video.videoWidth);
              _ths.el.setAttribute('height', video.videoHeight);
              _ths.el.width = video.videoWidth;
              _ths.el.height = video.videoHeight;
              return _ths.el.isSetUp = true;
            }
          }
        }
      });
    };
    error = function() {
      return console.log('User Media denied :(');
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

window.require.define({"remote": function(exports, require, module) {
  var RC, Remote, UI,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

UI = require('ui/ui');

RC = require('remote/RC');

module.exports = Remote = (function(_super) {

  __extends(Remote, _super);

  function Remote() {
    return Remote.__super__.constructor.apply(this, arguments);
  }

  Remote.prototype.initialize = function() {
    var rc;
    rc = this.rc = new RC.Remote({
      el: this.el
    });
    rc.connect();
    return rc.on('client-join', this.connectionEstablished, this);
  };

  Remote.prototype.connectionEstablished = function(data) {
    var pin;
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
    return this.$('.hide').removeClass('hide');
  };

  Remote.prototype.setupNavBehaviour = function() {
    var navItems, pages;
    navItems = this.$('nav li');
    pages = this.$('section');
    navItems.off('click');
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
    var rc, showThings, _ths;
    if (callback == null) {
      callback = (function() {
        return null;
      });
    }
    if (ctx == null) {
      ctx = this;
    }
    rc = this.rc;
    _ths = this;
    showThings = function(pin) {
      rc.render(pin);
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
    };
    if (rc.hasPin) {
      return showThings(rc.pin);
    } else {
      return rc.on('pin', showThings);
    }
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
    this.rc.socket.disconnect();
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

window.require.define({"remote/RC": function(exports, require, module) {
  var Local, Option, RC, Remote, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Option = require('remote/option');

template = require('remote/template');

module.exports = {};

RC = (function(_super) {

  __extends(RC, _super);

  function RC() {
    return RC.__super__.constructor.apply(this, arguments);
  }

  RC.prototype.initialize = function() {
    var _ths;
    this.groups = {};
    _ths = this;
    if (this.type === 'local') {
      this.render(false);
    }
    this.options = new Backbone.Collection;
    this.options.model = Option;
    this.options.getExportable = function() {
      return this.map(function(val) {
        return val.getExportable();
      });
    };
    this.options.on('add', function(added) {
      var group, id, model, view;
      id = added.attributes.id;
      model = this.where({
        id: id
      })[0];
      group = model.get('group');
      view = model.createView();
      if (view) {
        if (!_ths.groups[group]) {
          _ths.createGroup(group);
        }
        return _ths.groups[group].append(view.el);
      }
    });
    this.options.on('change', function(change) {
      this.send('update', change.getExportable());
      if (this.type === 'local') {
        return this.update(change.toJSON());
      }
    }, this);
    return this.on('client-update remote-update', function(update) {
      var model;
      model = this.options.where({
        id: update.id
      });
      model[0].silentUpdate(update.value);
      if (this.type === 'local') {
        return this.update(this.options.where({
          id: update.id
        })[0].toJSON());
      }
    });
  };

  RC.prototype.update = function(obj) {
    if (typeof obj.property !== 'undefined') {
      obj["with"][obj.property] = obj.value;
    }
    if (typeof obj.event !== 'undefined') {
      obj["with"].trigger(obj.event, obj.value);
    }
    if (typeof obj.callback === 'function') {
      if (typeof obj["with"] !== 'undefined') {
        return obj.callback.apply(obj["with"], [obj.value]);
      } else {
        return obj.callback(obj.value);
      }
    }
  };

  RC.prototype.createGroup = function(name) {
    var el, li, safeName;
    safeName = name.toLowerCase().replace(' ', '-');
    li = $('<li></li>').text(name).attr('title', safeName);
    li.appendTo(this.$('nav ul'));
    el = $('<section></section>').attr('id', safeName);
    el.append($('<h2></h2>').text(name));
    el.appendTo(this.$('#groups'));
    this.groups[name] = el;
    this.setupNavBehaviour();
    if (_.keys(this.groups).length === 1) {
      return li.trigger('click');
    }
  };

  RC.prototype.render = function(pin) {
    this.$el.html(template({
      pin: pin
    }));
    return this.createGroup('General');
  };

  RC.prototype.setupNavBehaviour = function() {
    var navItems, pages;
    navItems = this.$('nav li');
    pages = this.$('section');
    navItems.off('click');
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

  RC.prototype.send = function() {
    return null;
  };

  return RC;

})(Backbone.View);

module.exports.Local = Local = (function(_super) {

  __extends(Local, _super);

  function Local() {
    return Local.__super__.constructor.apply(this, arguments);
  }

  Local.prototype.connect = function(pin) {
    var socket, _ths;
    _ths = this;
    this.trigger('status', 'Connecting...');
    socket = io.connect("http://" + window.location.host, {
      'force new connection': true
    });
    socket.on('error', function(e) {
      _ths.trigger('status', 'Could not connect.');
      return Util.alert('Could note establish a connection :(');
    });
    socket.on('deny', function() {
      _ths.trigger('status', 'Wrong pin.');
      return Util.alert('There wasn\'t a remote with that pin online. Are you sure it was correct?');
    });
    socket.on('accept', function() {
      _ths.trigger('status', 'Connected: ' + pin);
      return _ths.send = function(event, data) {
        return socket.emit('client', {
          event: event,
          data: data
        });
      };
    });
    socket.emit('new client', {
      pin: pin,
      options: _ths.options.getExportable()
    });
    return socket.on('remote', function(data) {
      return _ths.trigger("remote-" + data.event, data.data);
    });
  };

  Local.prototype.type = 'local';

  return Local;

})(RC);

module.exports.Remote = Remote = (function(_super) {

  __extends(Remote, _super);

  function Remote() {
    return Remote.__super__.constructor.apply(this, arguments);
  }

  Remote.prototype.connect = function() {
    var socket, _ths;
    this.connected = false;
    this.hasPin = false;
    _ths = this;
    socket = io.connect('http://' + window.location.host, {
      'force new connection': true
    });
    socket.on('connect', function() {
      return this.connected = true;
    });
    socket.on('error', function() {
      Util.alert('Could not connect to remote server');
      return router.navigate('/', {
        trigger: true
      });
    });
    socket.on('client', function(data) {
      return _ths.trigger("client-" + data.event, data.data);
    });
    this.on('client-join', function(data) {
      return this.options.add(data.options);
    });
    this.send = function(event, data) {
      return socket.emit('remote', {
        event: event,
        data: data
      });
    };
    socket.emit('new remote');
    return socket.on('accept', function(pin) {
      _ths.pin = pin;
      _ths.trigger('pin', pin);
      return _ths.hasPin = true;
    });
  };

  Remote.prototype.type = 'remote';

  return Remote;

})(RC);

}});

window.require.define({"remote/option": function(exports, require, module) {
  var Option, UI,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

UI = require('ui/ui');

module.exports = Option = (function(_super) {

  __extends(Option, _super);

  function Option() {
    return Option.__super__.constructor.apply(this, arguments);
  }

  Option.prototype.initialize = function() {
    if (!this.has('id')) {
      this.set('id', this.cid);
    }
    if ((!this.has('value')) && (this.has('with')) && (this.has('property'))) {
      this.set('value', this.get('with')[this.get('property')]);
    }
    if (!this.has('group')) {
      return this.set('group', 'General');
    }
  };

  Option.prototype.createView = function() {
    this.view = UI.createFrom(this.toJSON());
    if (this.view) {
      this.view.on('change', function(value) {
        return this.set('value', value);
      }, this);
      return this.view;
    } else {
      return false;
    }
  };

  Option.prototype.getExportable = function() {
    var val;
    val = this.toJSON();
    val["with"] = void 0;
    val.view = void 0;
    return val;
  };

  Option.prototype.silentUpdate = function(val) {
    this.set('value', val, {
      silent: true
    });
    if (this.view) {
      return this.view.silentUpdate(val);
    }
  };

  return Option;

})(Backbone.Model);

}});

window.require.define({"remote/template": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n<div class=\"pin\">\n  <p>Here's your pin!</p>\n  <h3>";
  foundHelper = helpers.pin;
  stack1 = foundHelper || depth0.pin;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "pin", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h3>\n  <span>Enter it on the device you wish to control.</span>\n  <p class=\"minor\">Waiting for connection...</p>\n</div>\n";
  return buffer;}

function program3(depth0,data) {
  
  
  return " class=\"hide\"";}

function program5(depth0,data) {
  
  
  return " class=\"hide\"";}

  foundHelper = helpers.pin;
  stack1 = foundHelper || depth0.pin;
  stack2 = helpers['if'];
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n<nav";
  foundHelper = helpers.pin;
  stack1 = foundHelper || depth0.pin;
  stack2 = helpers['if'];
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n  <ul>\n  </ul>\n</nav>\n<div";
  foundHelper = helpers.pin;
  stack1 = foundHelper || depth0.pin;
  stack2 = helpers['if'];
  tmp1 = self.program(5, program5, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " id=\"groups\">\n</div>";
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
    "CodeCards": "codecards",
    "remote": "remote",
    ":404": "root"
  };

  return Router;

})(Backbone.Router);

}});

window.require.define({"templates/CodeCards": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<nav>\n  <a class=\"logo\" href=\"#\">\n    <h3 class=\"decoded\">Decoded</h3>\n    <h1><span>{</span>code<span>}</span>cards</h1>\n  </a>\n  <section class=\"pin-entry hide\"></section>\n</nav>\n<section>\n  <div id=\"camview\">\n    <div class=\"cnvs\">\n      <canvas id=\"canvas\" width=\"640\" height=\"480\"></canvas>\n    </div>\n    <a class=\"toggler\"></a>\n    <div id=\"local-RC\" class=\"remote local\"></div>\n  </div>\n  <div id=\"mainview\">\n    <div id=\"code\">\n      <h3 id=\"code-status\">Please allow your webcam...</h3>\n      <div></div>\n    </div>\n    <div id=\"mission\">\n    </div>\n  </div>\n</section>";});
}});

window.require.define({"templates/home": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<header class=\"logo\">\n  <h3 class=\"decoded\">Decoded</h3>\n  <h1><span>{</span>code<span>}</span>cards</h1>\n</header>\n\n<a class=\"icon source\" href=\"#CodeCards\">\n  <img src=\"/svg/source-code.svg\">\n  <h3>CodeCards</h3>\n</a>\n\n<a class=\"icon remote\" href=\"#remote\">\n  <img src=\"/svg/remote.svg\">\n  <h3>Remote Control</h3>\n</a>";});
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

  Slider.prototype.tagName = "div";

  Slider.prototype.className = "slider";

  Slider.prototype.initialize = function() {
    var el, o, _ths;
    _ths = this;
    o = this.options;
    el = this.$el;
    this.model = new Backbone.Model({
      label: typeof o.label !== void 0 ? o.label : el.data('label' || 'Label'),
      max: typeof o.max !== void 0 ? o.max : parseFloat(el.data('max' || 100)),
      min: typeof o.min !== void 0 ? o.min : parseFloat(el.data('min' || 0)),
      value: typeof o.value !== void 0 ? o.value : parseFloat(el.data('value' || 50)),
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

  Slider.prototype.silentUpdate = function(val) {
    this.model.set('value', val, {
      silent: true
    });
    this.o = this.model.toJSON();
    return this.update(false);
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

  Slider.prototype.update = function(tellTheWord) {
    var o, v;
    if (tellTheWord == null) {
      tellTheWord = true;
    }
    o = this.o;
    v = this.model.get('value');
    this.thumb.css('left', ((v - o.min) / (o.max - o.min)) * 100 + '%');
    this.input.val(v);
    if (tellTheWord) {
      return this.trigger('change', v);
    }
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
      _ths.update();
      return _ths.trigger('change', _ths.o.value);
    });
    this.model.trigger('change');
    return this.render();
  };

  Toggle.prototype.silentUpdate = function(val) {
    this.model.set('value', val, {
      silent: true
    });
    return this.update();
  };

  Toggle.prototype.update = function() {
    this.o = this.model.toJSON();
    this.o.text = this.o.value ? this.o["true"] : this.o["false"];
    return this.$('button').text(this.o.text);
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
  Toggle: require('ui/toggle'),
  createFrom: function(model) {
    var el;
    el = null;
    switch (model.type) {
      case 'range':
        el = new this.Slider(model);
        break;
      case 'toggle-button':
        el = new this.Toggle(model);
    }
    return el;
  }
};

}});

