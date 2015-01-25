(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Rivets.js
// version: 0.7.2
// author: Michael Richards
// license: MIT
(function() {
  var Rivets, bindMethod, unbindMethod, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Rivets = {
    options: ['prefix', 'templateDelimiters', 'rootInterface', 'preloadData', 'handler'],
    extensions: ['binders', 'formatters', 'components', 'adapters'],
    "public": {
      binders: {},
      components: {},
      formatters: {},
      adapters: {},
      prefix: 'rv',
      templateDelimiters: ['{', '}'],
      rootInterface: '.',
      preloadData: true,
      handler: function(context, ev, binding) {
        return this.call(context, ev, binding.view.models);
      },
      configure: function(options) {
        var descriptor, key, option, value;
        if (options == null) {
          options = {};
        }
        for (option in options) {
          value = options[option];
          if (option === 'binders' || option === 'components' || option === 'formatters' || option === 'adapters') {
            for (key in value) {
              descriptor = value[key];
              Rivets[option][key] = descriptor;
            }
          } else {
            Rivets["public"][option] = value;
          }
        }
      },
      bind: function(el, models, options) {
        var view;
        if (models == null) {
          models = {};
        }
        if (options == null) {
          options = {};
        }
        view = new Rivets.View(el, models, options);
        view.bind();
        return view;
      }
    }
  };

  if (window['jQuery'] || window['$']) {
    _ref = 'on' in jQuery.prototype ? ['on', 'off'] : ['bind', 'unbind'], bindMethod = _ref[0], unbindMethod = _ref[1];
    Rivets.Util = {
      bindEvent: function(el, event, handler) {
        return jQuery(el)[bindMethod](event, handler);
      },
      unbindEvent: function(el, event, handler) {
        return jQuery(el)[unbindMethod](event, handler);
      },
      getInputValue: function(el) {
        var $el;
        $el = jQuery(el);
        if ($el.attr('type') === 'checkbox') {
          return $el.is(':checked');
        } else {
          return $el.val();
        }
      }
    };
  } else {
    Rivets.Util = {
      bindEvent: (function() {
        if ('addEventListener' in window) {
          return function(el, event, handler) {
            return el.addEventListener(event, handler, false);
          };
        }
        return function(el, event, handler) {
          return el.attachEvent('on' + event, handler);
        };
      })(),
      unbindEvent: (function() {
        if ('removeEventListener' in window) {
          return function(el, event, handler) {
            return el.removeEventListener(event, handler, false);
          };
        }
        return function(el, event, handler) {
          return el.detachEvent('on' + event, handler);
        };
      })(),
      getInputValue: function(el) {
        var o, _i, _len, _results;
        if (el.type === 'checkbox') {
          return el.checked;
        } else if (el.type === 'select-multiple') {
          _results = [];
          for (_i = 0, _len = el.length; _i < _len; _i++) {
            o = el[_i];
            if (o.selected) {
              _results.push(o.value);
            }
          }
          return _results;
        } else {
          return el.value;
        }
      }
    };
  }

  Rivets.TypeParser = (function() {
    function TypeParser() {}

    TypeParser.types = {
      primitive: 0,
      keypath: 1
    };

    TypeParser.parse = function(string) {
      if (/^'.*'$|^".*"$/.test(string)) {
        return {
          type: this.types.primitive,
          value: string.slice(1, -1)
        };
      } else if (string === 'true') {
        return {
          type: this.types.primitive,
          value: true
        };
      } else if (string === 'false') {
        return {
          type: this.types.primitive,
          value: false
        };
      } else if (string === 'null') {
        return {
          type: this.types.primitive,
          value: null
        };
      } else if (string === 'undefined') {
        return {
          type: this.types.primitive,
          value: void 0
        };
      } else if (isNaN(Number(string)) === false) {
        return {
          type: this.types.primitive,
          value: Number(string)
        };
      } else {
        return {
          type: this.types.keypath,
          value: string
        };
      }
    };

    return TypeParser;

  })();

  Rivets.TextTemplateParser = (function() {
    function TextTemplateParser() {}

    TextTemplateParser.types = {
      text: 0,
      binding: 1
    };

    TextTemplateParser.parse = function(template, delimiters) {
      var index, lastIndex, lastToken, length, substring, tokens, value;
      tokens = [];
      length = template.length;
      index = 0;
      lastIndex = 0;
      while (lastIndex < length) {
        index = template.indexOf(delimiters[0], lastIndex);
        if (index < 0) {
          tokens.push({
            type: this.types.text,
            value: template.slice(lastIndex)
          });
          break;
        } else {
          if (index > 0 && lastIndex < index) {
            tokens.push({
              type: this.types.text,
              value: template.slice(lastIndex, index)
            });
          }
          lastIndex = index + delimiters[0].length;
          index = template.indexOf(delimiters[1], lastIndex);
          if (index < 0) {
            substring = template.slice(lastIndex - delimiters[1].length);
            lastToken = tokens[tokens.length - 1];
            if ((lastToken != null ? lastToken.type : void 0) === this.types.text) {
              lastToken.value += substring;
            } else {
              tokens.push({
                type: this.types.text,
                value: substring
              });
            }
            break;
          }
          value = template.slice(lastIndex, index).trim();
          tokens.push({
            type: this.types.binding,
            value: value
          });
          lastIndex = index + delimiters[1].length;
        }
      }
      return tokens;
    };

    return TextTemplateParser;

  })();

  Rivets.View = (function() {
    function View(els, models, options) {
      var k, option, v, _base, _i, _j, _len, _len1, _ref1, _ref2, _ref3, _ref4, _ref5;
      this.els = els;
      this.models = models;
      if (options == null) {
        options = {};
      }
      this.update = __bind(this.update, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.select = __bind(this.select, this);
      this.build = __bind(this.build, this);
      this.componentRegExp = __bind(this.componentRegExp, this);
      this.bindingRegExp = __bind(this.bindingRegExp, this);
      this.options = __bind(this.options, this);
      if (!(this.els.jquery || this.els instanceof Array)) {
        this.els = [this.els];
      }
      _ref1 = Rivets.extensions;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        option = _ref1[_i];
        this[option] = {};
        if (options[option]) {
          _ref2 = options[option];
          for (k in _ref2) {
            v = _ref2[k];
            this[option][k] = v;
          }
        }
        _ref3 = Rivets["public"][option];
        for (k in _ref3) {
          v = _ref3[k];
          if ((_base = this[option])[k] == null) {
            _base[k] = v;
          }
        }
      }
      _ref4 = Rivets.options;
      for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
        option = _ref4[_j];
        this[option] = (_ref5 = options[option]) != null ? _ref5 : Rivets["public"][option];
      }
      this.build();
    }

    View.prototype.options = function() {
      var option, options, _i, _len, _ref1;
      options = {};
      _ref1 = Rivets.extensions.concat(Rivets.options);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        option = _ref1[_i];
        options[option] = this[option];
      }
      return options;
    };

    View.prototype.bindingRegExp = function() {
      return new RegExp("^" + this.prefix + "-");
    };

    View.prototype.componentRegExp = function() {
      return new RegExp("^" + (this.prefix.toUpperCase()) + "-");
    };

    View.prototype.build = function() {
      var bindingRegExp, buildBinding, componentRegExp, el, parse, _i, _len, _ref1;
      this.bindings = [];
      bindingRegExp = this.bindingRegExp();
      componentRegExp = this.componentRegExp();
      buildBinding = (function(_this) {
        return function(binding, node, type, declaration) {
          var context, ctx, dependencies, keypath, options, pipe, pipes;
          options = {};
          pipes = (function() {
            var _i, _len, _ref1, _results;
            _ref1 = declaration.split('|');
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              pipe = _ref1[_i];
              _results.push(pipe.trim());
            }
            return _results;
          })();
          context = (function() {
            var _i, _len, _ref1, _results;
            _ref1 = pipes.shift().split('<');
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              ctx = _ref1[_i];
              _results.push(ctx.trim());
            }
            return _results;
          })();
          keypath = context.shift();
          options.formatters = pipes;
          if (dependencies = context.shift()) {
            options.dependencies = dependencies.split(/\s+/);
          }
          return _this.bindings.push(new Rivets[binding](_this, node, type, keypath, options));
        };
      })(this);
      parse = (function(_this) {
        return function(node) {
          var attribute, attributes, binder, block, childNode, delimiters, identifier, n, parser, regexp, text, token, tokens, type, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref1, _ref2, _ref3, _ref4, _results;
          if (node.nodeType === 3) {
            parser = Rivets.TextTemplateParser;
            if (delimiters = _this.templateDelimiters) {
              if ((tokens = parser.parse(node.data, delimiters)).length) {
                if (!(tokens.length === 1 && tokens[0].type === parser.types.text)) {
                  for (_i = 0, _len = tokens.length; _i < _len; _i++) {
                    token = tokens[_i];
                    text = document.createTextNode(token.value);
                    node.parentNode.insertBefore(text, node);
                    if (token.type === 1) {
                      buildBinding('TextBinding', text, null, token.value);
                    }
                  }
                  node.parentNode.removeChild(node);
                }
              }
            }
          } else if (node.nodeType === 1) {
            if (componentRegExp.test(node.nodeName)) {
              type = node.nodeName.replace(componentRegExp, '').toLowerCase();
              _this.bindings.push(new Rivets.ComponentBinding(_this, node, type));
            } else {
              block = node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE';
              _ref1 = node.attributes;
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                attribute = _ref1[_j];
                if (bindingRegExp.test(attribute.name)) {
                  type = attribute.name.replace(bindingRegExp, '');
                  if (!(binder = _this.binders[type])) {
                    _ref2 = _this.binders;
                    for (identifier in _ref2) {
                      value = _ref2[identifier];
                      if (identifier !== '*' && identifier.indexOf('*') !== -1) {
                        regexp = new RegExp("^" + (identifier.replace(/\*/g, '.+')) + "$");
                        if (regexp.test(type)) {
                          binder = value;
                        }
                      }
                    }
                  }
                  binder || (binder = _this.binders['*']);
                  if (binder.block) {
                    block = true;
                    attributes = [attribute];
                  }
                }
              }
              _ref3 = attributes || node.attributes;
              for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
                attribute = _ref3[_k];
                if (bindingRegExp.test(attribute.name)) {
                  type = attribute.name.replace(bindingRegExp, '');
                  buildBinding('Binding', node, type, attribute.value);
                }
              }
            }
          }
          if (!block) {
            _ref4 = (function() {
              var _len3, _m, _ref4, _results1;
              _ref4 = node.childNodes;
              _results1 = [];
              for (_m = 0, _len3 = _ref4.length; _m < _len3; _m++) {
                n = _ref4[_m];
                _results1.push(n);
              }
              return _results1;
            })();
            _results = [];
            for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
              childNode = _ref4[_l];
              _results.push(parse(childNode));
            }
            return _results;
          }
        };
      })(this);
      _ref1 = this.els;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        el = _ref1[_i];
        parse(el);
      }
      this.bindings.sort(function(a, b) {
        var _ref2, _ref3;
        return (((_ref2 = b.binder) != null ? _ref2.priority : void 0) || 0) - (((_ref3 = a.binder) != null ? _ref3.priority : void 0) || 0);
      });
    };

    View.prototype.select = function(fn) {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        if (fn(binding)) {
          _results.push(binding);
        }
      }
      return _results;
    };

    View.prototype.bind = function() {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.bind());
      }
      return _results;
    };

    View.prototype.unbind = function() {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.unbind());
      }
      return _results;
    };

    View.prototype.sync = function() {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.sync());
      }
      return _results;
    };

    View.prototype.publish = function() {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.select(function(b) {
        return b.binder.publishes;
      });
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.publish());
      }
      return _results;
    };

    View.prototype.update = function(models) {
      var binding, key, model, _i, _len, _ref1, _results;
      if (models == null) {
        models = {};
      }
      for (key in models) {
        model = models[key];
        this.models[key] = model;
      }
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.update(models));
      }
      return _results;
    };

    return View;

  })();

  Rivets.Binding = (function() {
    function Binding(view, el, type, keypath, options) {
      this.view = view;
      this.el = el;
      this.type = type;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.getValue = __bind(this.getValue, this);
      this.update = __bind(this.update, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.set = __bind(this.set, this);
      this.eventHandler = __bind(this.eventHandler, this);
      this.formattedValue = __bind(this.formattedValue, this);
      this.parseTarget = __bind(this.parseTarget, this);
      this.observe = __bind(this.observe, this);
      this.setBinder = __bind(this.setBinder, this);
      this.formatters = this.options.formatters || [];
      this.dependencies = [];
      this.formatterObservers = {};
      this.model = void 0;
      this.setBinder();
    }

    Binding.prototype.setBinder = function() {
      var identifier, regexp, value, _ref1;
      if (!(this.binder = this.view.binders[this.type])) {
        _ref1 = this.view.binders;
        for (identifier in _ref1) {
          value = _ref1[identifier];
          if (identifier !== '*' && identifier.indexOf('*') !== -1) {
            regexp = new RegExp("^" + (identifier.replace(/\*/g, '.+')) + "$");
            if (regexp.test(this.type)) {
              this.binder = value;
              this.args = new RegExp("^" + (identifier.replace(/\*/g, '(.+)')) + "$").exec(this.type);
              this.args.shift();
            }
          }
        }
      }
      this.binder || (this.binder = this.view.binders['*']);
      if (this.binder instanceof Function) {
        return this.binder = {
          routine: this.binder
        };
      }
    };

    Binding.prototype.observe = function(obj, keypath, callback) {
      return Rivets.sightglass(obj, keypath, callback, {
        root: this.view.rootInterface,
        adapters: this.view.adapters
      });
    };

    Binding.prototype.parseTarget = function() {
      var token;
      token = Rivets.TypeParser.parse(this.keypath);
      if (token.type === 0) {
        return this.value = token.value;
      } else {
        this.observer = this.observe(this.view.models, this.keypath, this.sync);
        return this.model = this.observer.target;
      }
    };

    Binding.prototype.formattedValue = function(value) {
      var ai, arg, args, fi, formatter, id, observer, processedArgs, _base, _i, _j, _len, _len1, _ref1;
      _ref1 = this.formatters;
      for (fi = _i = 0, _len = _ref1.length; _i < _len; fi = ++_i) {
        formatter = _ref1[fi];
        args = formatter.match(/[^\s']+|'([^']|'[^\s])*'|"([^"]|"[^\s])*"/g);
        id = args.shift();
        formatter = this.view.formatters[id];
        args = (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = args.length; _j < _len1; _j++) {
            arg = args[_j];
            _results.push(Rivets.TypeParser.parse(arg));
          }
          return _results;
        })();
        processedArgs = [];
        for (ai = _j = 0, _len1 = args.length; _j < _len1; ai = ++_j) {
          arg = args[ai];
          processedArgs.push(arg.type === 0 ? arg.value : ((_base = this.formatterObservers)[fi] || (_base[fi] = {}), !(observer = this.formatterObservers[fi][ai]) ? (observer = this.observe(this.view.models, arg.value, this.sync), this.formatterObservers[fi][ai] = observer) : void 0, observer.value()));
        }
        if ((formatter != null ? formatter.read : void 0) instanceof Function) {
          value = formatter.read.apply(formatter, [value].concat(__slice.call(processedArgs)));
        } else if (formatter instanceof Function) {
          value = formatter.apply(null, [value].concat(__slice.call(processedArgs)));
        }
      }
      return value;
    };

    Binding.prototype.eventHandler = function(fn) {
      var binding, handler;
      handler = (binding = this).view.handler;
      return function(ev) {
        return handler.call(fn, this, ev, binding);
      };
    };

    Binding.prototype.set = function(value) {
      var _ref1;
      value = value instanceof Function && !this.binder["function"] ? this.formattedValue(value.call(this.model)) : this.formattedValue(value);
      return (_ref1 = this.binder.routine) != null ? _ref1.call(this, this.el, value) : void 0;
    };

    Binding.prototype.sync = function() {
      var dependency, observer;
      return this.set((function() {
        var _i, _j, _len, _len1, _ref1, _ref2, _ref3;
        if (this.observer) {
          if (this.model !== this.observer.target) {
            _ref1 = this.dependencies;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              observer = _ref1[_i];
              observer.unobserve();
            }
            this.dependencies = [];
            if (((this.model = this.observer.target) != null) && ((_ref2 = this.options.dependencies) != null ? _ref2.length : void 0)) {
              _ref3 = this.options.dependencies;
              for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
                dependency = _ref3[_j];
                observer = this.observe(this.model, dependency, this.sync);
                this.dependencies.push(observer);
              }
            }
          }
          return this.observer.value();
        } else {
          return this.value;
        }
      }).call(this));
    };

    Binding.prototype.publish = function() {
      var args, formatter, id, value, _i, _len, _ref1, _ref2, _ref3;
      if (this.observer) {
        value = this.getValue(this.el);
        _ref1 = this.formatters.slice(0).reverse();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          formatter = _ref1[_i];
          args = formatter.split(/\s+/);
          id = args.shift();
          if ((_ref2 = this.view.formatters[id]) != null ? _ref2.publish : void 0) {
            value = (_ref3 = this.view.formatters[id]).publish.apply(_ref3, [value].concat(__slice.call(args)));
          }
        }
        return this.observer.setValue(value);
      }
    };

    Binding.prototype.bind = function() {
      var dependency, observer, _i, _len, _ref1, _ref2, _ref3;
      this.parseTarget();
      if ((_ref1 = this.binder.bind) != null) {
        _ref1.call(this, this.el);
      }
      if ((this.model != null) && ((_ref2 = this.options.dependencies) != null ? _ref2.length : void 0)) {
        _ref3 = this.options.dependencies;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          dependency = _ref3[_i];
          observer = this.observe(this.model, dependency, this.sync);
          this.dependencies.push(observer);
        }
      }
      if (this.view.preloadData) {
        return this.sync();
      }
    };

    Binding.prototype.unbind = function() {
      var ai, args, fi, observer, _i, _len, _ref1, _ref2, _ref3, _ref4;
      if ((_ref1 = this.binder.unbind) != null) {
        _ref1.call(this, this.el);
      }
      if ((_ref2 = this.observer) != null) {
        _ref2.unobserve();
      }
      _ref3 = this.dependencies;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        observer = _ref3[_i];
        observer.unobserve();
      }
      this.dependencies = [];
      _ref4 = this.formatterObservers;
      for (fi in _ref4) {
        args = _ref4[fi];
        for (ai in args) {
          observer = args[ai];
          observer.unobserve();
        }
      }
      return this.formatterObservers = {};
    };

    Binding.prototype.update = function(models) {
      var _ref1, _ref2;
      if (models == null) {
        models = {};
      }
      this.model = (_ref1 = this.observer) != null ? _ref1.target : void 0;
      this.unbind();
      if ((_ref2 = this.binder.update) != null) {
        _ref2.call(this, models);
      }
      return this.bind();
    };

    Binding.prototype.getValue = function(el) {
      if (this.binder && (this.binder.getValue != null)) {
        return this.binder.getValue.call(this, el);
      } else {
        return Rivets.Util.getInputValue(el);
      }
    };

    return Binding;

  })();

  Rivets.ComponentBinding = (function(_super) {
    __extends(ComponentBinding, _super);

    function ComponentBinding(view, el, type) {
      var attribute, _i, _len, _ref1, _ref2;
      this.view = view;
      this.el = el;
      this.type = type;
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.update = __bind(this.update, this);
      this.locals = __bind(this.locals, this);
      this.component = this.view.components[this.type];
      this.attributes = {};
      this.inflections = {};
      _ref1 = this.el.attributes || [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        attribute = _ref1[_i];
        if (_ref2 = attribute.name, __indexOf.call(this.component.attributes, _ref2) >= 0) {
          this.attributes[attribute.name] = attribute.value;
        } else {
          this.inflections[attribute.name] = attribute.value;
        }
      }
    }

    ComponentBinding.prototype.sync = function() {};

    ComponentBinding.prototype.locals = function(models) {
      var inverse, key, model, path, result, _i, _len, _ref1, _ref2;
      if (models == null) {
        models = this.view.models;
      }
      result = {};
      _ref1 = this.inflections;
      for (key in _ref1) {
        inverse = _ref1[key];
        _ref2 = inverse.split('.');
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          path = _ref2[_i];
          result[key] = (result[key] || models)[path];
        }
      }
      for (key in models) {
        model = models[key];
        if (result[key] == null) {
          result[key] = model;
        }
      }
      return result;
    };

    ComponentBinding.prototype.update = function(models) {
      var _ref1;
      return (_ref1 = this.componentView) != null ? _ref1.update(this.locals(models)) : void 0;
    };

    ComponentBinding.prototype.bind = function() {
      var el, _ref1;
      if (this.componentView != null) {
        return (_ref1 = this.componentView) != null ? _ref1.bind() : void 0;
      } else {
        el = this.component.build.call(this.attributes);
        (this.componentView = new Rivets.View(el, this.locals(), this.view.options)).bind();
        return this.el.parentNode.replaceChild(el, this.el);
      }
    };

    ComponentBinding.prototype.unbind = function() {
      var _ref1;
      return (_ref1 = this.componentView) != null ? _ref1.unbind() : void 0;
    };

    return ComponentBinding;

  })(Rivets.Binding);

  Rivets.TextBinding = (function(_super) {
    __extends(TextBinding, _super);

    function TextBinding(view, el, type, keypath, options) {
      this.view = view;
      this.el = el;
      this.type = type;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.sync = __bind(this.sync, this);
      this.formatters = this.options.formatters || [];
      this.dependencies = [];
      this.formatterObservers = {};
    }

    TextBinding.prototype.binder = {
      routine: function(node, value) {
        return node.data = value != null ? value : '';
      }
    };

    TextBinding.prototype.sync = function() {
      return TextBinding.__super__.sync.apply(this, arguments);
    };

    return TextBinding;

  })(Rivets.Binding);

  Rivets["public"].binders.text = function(el, value) {
    if (el.textContent != null) {
      return el.textContent = value != null ? value : '';
    } else {
      return el.innerText = value != null ? value : '';
    }
  };

  Rivets["public"].binders.html = function(el, value) {
    return el.innerHTML = value != null ? value : '';
  };

  Rivets["public"].binders.show = function(el, value) {
    return el.style.display = value ? '' : 'none';
  };

  Rivets["public"].binders.hide = function(el, value) {
    return el.style.display = value ? 'none' : '';
  };

  Rivets["public"].binders.enabled = function(el, value) {
    return el.disabled = !value;
  };

  Rivets["public"].binders.disabled = function(el, value) {
    return el.disabled = !!value;
  };

  Rivets["public"].binders.checked = {
    publishes: true,
    priority: 2000,
    bind: function(el) {
      return Rivets.Util.bindEvent(el, 'change', this.publish);
    },
    unbind: function(el) {
      return Rivets.Util.unbindEvent(el, 'change', this.publish);
    },
    routine: function(el, value) {
      var _ref1;
      if (el.type === 'radio') {
        return el.checked = ((_ref1 = el.value) != null ? _ref1.toString() : void 0) === (value != null ? value.toString() : void 0);
      } else {
        return el.checked = !!value;
      }
    }
  };

  Rivets["public"].binders.unchecked = {
    publishes: true,
    priority: 2000,
    bind: function(el) {
      return Rivets.Util.bindEvent(el, 'change', this.publish);
    },
    unbind: function(el) {
      return Rivets.Util.unbindEvent(el, 'change', this.publish);
    },
    routine: function(el, value) {
      var _ref1;
      if (el.type === 'radio') {
        return el.checked = ((_ref1 = el.value) != null ? _ref1.toString() : void 0) !== (value != null ? value.toString() : void 0);
      } else {
        return el.checked = !value;
      }
    }
  };

  Rivets["public"].binders.value = {
    publishes: true,
    priority: 3000,
    bind: function(el) {
      if (!(el.tagName === 'INPUT' && el.type === 'radio')) {
        this.event = el.tagName === 'SELECT' ? 'change' : 'input';
        return Rivets.Util.bindEvent(el, this.event, this.publish);
      }
    },
    unbind: function(el) {
      if (!(el.tagName === 'INPUT' && el.type === 'radio')) {
        return Rivets.Util.unbindEvent(el, this.event, this.publish);
      }
    },
    routine: function(el, value) {
      var o, _i, _len, _ref1, _ref2, _ref3, _results;
      if (el.tagName === 'INPUT' && el.type === 'radio') {
        return el.setAttribute('value', value);
      } else if (window.jQuery != null) {
        el = jQuery(el);
        if ((value != null ? value.toString() : void 0) !== ((_ref1 = el.val()) != null ? _ref1.toString() : void 0)) {
          return el.val(value != null ? value : '');
        }
      } else {
        if (el.type === 'select-multiple') {
          if (value != null) {
            _results = [];
            for (_i = 0, _len = el.length; _i < _len; _i++) {
              o = el[_i];
              _results.push(o.selected = (_ref2 = o.value, __indexOf.call(value, _ref2) >= 0));
            }
            return _results;
          }
        } else if ((value != null ? value.toString() : void 0) !== ((_ref3 = el.value) != null ? _ref3.toString() : void 0)) {
          return el.value = value != null ? value : '';
        }
      }
    }
  };

  Rivets["public"].binders["if"] = {
    block: true,
    priority: 4000,
    bind: function(el) {
      var attr, declaration;
      if (this.marker == null) {
        attr = [this.view.prefix, this.type].join('-').replace('--', '-');
        declaration = el.getAttribute(attr);
        this.marker = document.createComment(" rivets: " + this.type + " " + declaration + " ");
        this.bound = false;
        el.removeAttribute(attr);
        el.parentNode.insertBefore(this.marker, el);
        return el.parentNode.removeChild(el);
      }
    },
    unbind: function() {
      var _ref1;
      return (_ref1 = this.nested) != null ? _ref1.unbind() : void 0;
    },
    routine: function(el, value) {
      var key, model, models, _ref1;
      if (!!value === !this.bound) {
        if (value) {
          models = {};
          _ref1 = this.view.models;
          for (key in _ref1) {
            model = _ref1[key];
            models[key] = model;
          }
          (this.nested || (this.nested = new Rivets.View(el, models, this.view.options()))).bind();
          this.marker.parentNode.insertBefore(el, this.marker.nextSibling);
          return this.bound = true;
        } else {
          el.parentNode.removeChild(el);
          this.nested.unbind();
          return this.bound = false;
        }
      }
    },
    update: function(models) {
      var _ref1;
      return (_ref1 = this.nested) != null ? _ref1.update(models) : void 0;
    }
  };

  Rivets["public"].binders.unless = {
    block: true,
    priority: 4000,
    bind: function(el) {
      return Rivets["public"].binders["if"].bind.call(this, el);
    },
    unbind: function() {
      return Rivets["public"].binders["if"].unbind.call(this);
    },
    routine: function(el, value) {
      return Rivets["public"].binders["if"].routine.call(this, el, !value);
    },
    update: function(models) {
      return Rivets["public"].binders["if"].update.call(this, models);
    }
  };

  Rivets["public"].binders['on-*'] = {
    "function": true,
    priority: 1000,
    unbind: function(el) {
      if (this.handler) {
        return Rivets.Util.unbindEvent(el, this.args[0], this.handler);
      }
    },
    routine: function(el, value) {
      if (this.handler) {
        Rivets.Util.unbindEvent(el, this.args[0], this.handler);
      }
      return Rivets.Util.bindEvent(el, this.args[0], this.handler = this.eventHandler(value));
    }
  };

  Rivets["public"].binders['each-*'] = {
    block: true,
    priority: 4000,
    bind: function(el) {
      var attr, view, _i, _len, _ref1;
      if (this.marker == null) {
        attr = [this.view.prefix, this.type].join('-').replace('--', '-');
        this.marker = document.createComment(" rivets: " + this.type + " ");
        this.iterated = [];
        el.removeAttribute(attr);
        el.parentNode.insertBefore(this.marker, el);
        el.parentNode.removeChild(el);
      } else {
        _ref1 = this.iterated;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          view = _ref1[_i];
          view.bind();
        }
      }
    },
    unbind: function(el) {
      var view, _i, _len, _ref1, _results;
      if (this.iterated != null) {
        _ref1 = this.iterated;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          view = _ref1[_i];
          _results.push(view.unbind());
        }
        return _results;
      }
    },
    routine: function(el, collection) {
      var binding, data, i, index, key, model, modelName, options, previous, template, view, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3, _results;
      modelName = this.args[0];
      collection = collection || [];
      if (this.iterated.length > collection.length) {
        _ref1 = Array(this.iterated.length - collection.length);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          i = _ref1[_i];
          view = this.iterated.pop();
          view.unbind();
          this.marker.parentNode.removeChild(view.els[0]);
        }
      }
      for (index = _j = 0, _len1 = collection.length; _j < _len1; index = ++_j) {
        model = collection[index];
        data = {
          index: index
        };
        data[modelName] = model;
        if (this.iterated[index] == null) {
          _ref2 = this.view.models;
          for (key in _ref2) {
            model = _ref2[key];
            if (data[key] == null) {
              data[key] = model;
            }
          }
          previous = this.iterated.length ? this.iterated[this.iterated.length - 1].els[0] : this.marker;
          options = this.view.options();
          options.preloadData = true;
          template = el.cloneNode(true);
          view = new Rivets.View(template, data, options);
          view.bind();
          this.iterated.push(view);
          this.marker.parentNode.insertBefore(template, previous.nextSibling);
        } else if (this.iterated[index].models[modelName] !== model) {
          this.iterated[index].update(data);
        }
      }
      if (el.nodeName === 'OPTION') {
        _ref3 = this.view.bindings;
        _results = [];
        for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
          binding = _ref3[_k];
          if (binding.el === this.marker.parentNode && binding.type === 'value') {
            _results.push(binding.sync());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    },
    update: function(models) {
      var data, key, model, view, _i, _len, _ref1, _results;
      data = {};
      for (key in models) {
        model = models[key];
        if (key !== this.args[0]) {
          data[key] = model;
        }
      }
      _ref1 = this.iterated;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
        _results.push(view.update(data));
      }
      return _results;
    }
  };

  Rivets["public"].binders['class-*'] = function(el, value) {
    var elClass;
    elClass = " " + el.className + " ";
    if (!value === (elClass.indexOf(" " + this.args[0] + " ") !== -1)) {
      return el.className = value ? "" + el.className + " " + this.args[0] : elClass.replace(" " + this.args[0] + " ", ' ').trim();
    }
  };

  Rivets["public"].binders['*'] = function(el, value) {
    if (value != null) {
      return el.setAttribute(this.type, value);
    } else {
      return el.removeAttribute(this.type);
    }
  };

  Rivets["public"].adapters['.'] = {
    id: '_rv',
    counter: 0,
    weakmap: {},
    weakReference: function(obj) {
      var id, _base, _name;
      if (!obj.hasOwnProperty(this.id)) {
        id = this.counter++;
        Object.defineProperty(obj, this.id, {
          value: id
        });
      }
      return (_base = this.weakmap)[_name = obj[this.id]] || (_base[_name] = {
        callbacks: {}
      });
    },
    cleanupWeakReference: function(ref, id) {
      if (!Object.keys(ref.callbacks).length) {
        if (!(ref.pointers && Object.keys(ref.pointers).length)) {
          return delete this.weakmap[id];
        }
      }
    },
    stubFunction: function(obj, fn) {
      var map, original, weakmap;
      original = obj[fn];
      map = this.weakReference(obj);
      weakmap = this.weakmap;
      return obj[fn] = function() {
        var callback, k, r, response, _i, _len, _ref1, _ref2, _ref3, _ref4;
        response = original.apply(obj, arguments);
        _ref1 = map.pointers;
        for (r in _ref1) {
          k = _ref1[r];
          _ref4 = (_ref2 = (_ref3 = weakmap[r]) != null ? _ref3.callbacks[k] : void 0) != null ? _ref2 : [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            callback = _ref4[_i];
            callback();
          }
        }
        return response;
      };
    },
    observeMutations: function(obj, ref, keypath) {
      var fn, functions, map, _base, _i, _len;
      if (Array.isArray(obj)) {
        map = this.weakReference(obj);
        if (map.pointers == null) {
          map.pointers = {};
          functions = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
          for (_i = 0, _len = functions.length; _i < _len; _i++) {
            fn = functions[_i];
            this.stubFunction(obj, fn);
          }
        }
        if ((_base = map.pointers)[ref] == null) {
          _base[ref] = [];
        }
        if (__indexOf.call(map.pointers[ref], keypath) < 0) {
          return map.pointers[ref].push(keypath);
        }
      }
    },
    unobserveMutations: function(obj, ref, keypath) {
      var idx, map, pointers;
      if (Array.isArray(obj) && (obj[this.id] != null)) {
        map = this.weakReference(obj);
        pointers = map.pointers[ref];
        if ((idx = pointers.indexOf(keypath)) >= 0) {
          pointers.splice(idx, 1);
        }
        if (!pointers.length) {
          delete map.pointers[ref];
        }
        return this.cleanupWeakReference(map, obj[this.id]);
      }
    },
    observe: function(obj, keypath, callback) {
      var callbacks, value;
      callbacks = this.weakReference(obj).callbacks;
      if (callbacks[keypath] == null) {
        callbacks[keypath] = [];
        value = obj[keypath];
        Object.defineProperty(obj, keypath, {
          enumerable: true,
          get: function() {
            return value;
          },
          set: (function(_this) {
            return function(newValue) {
              var _i, _len, _ref1;
              if (newValue !== value) {
                _this.unobserveMutations(value, obj[_this.id], keypath);
                value = newValue;
                if (callbacks[keypath]) {
                  _ref1 = callbacks[keypath].slice();
                  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    callback = _ref1[_i];
                    if (__indexOf.call(callbacks[keypath], callback) >= 0) {
                      callback();
                    }
                  }
                }
                return _this.observeMutations(newValue, obj[_this.id], keypath);
              }
            };
          })(this)
        });
      }
      if (__indexOf.call(callbacks[keypath], callback) < 0) {
        callbacks[keypath].push(callback);
      }
      return this.observeMutations(obj[keypath], obj[this.id], keypath);
    },
    unobserve: function(obj, keypath, callback) {
      var callbacks, idx, map;
      map = this.weakmap[obj[this.id]];
      callbacks = map.callbacks[keypath];
      if ((idx = callbacks.indexOf(callback)) >= 0) {
        callbacks.splice(idx, 1);
        if (!callbacks.length) {
          delete map.callbacks[keypath];
        }
      }
      this.unobserveMutations(obj[keypath], obj[this.id], keypath);
      return this.cleanupWeakReference(map, obj[this.id]);
    },
    get: function(obj, keypath) {
      return obj[keypath];
    },
    set: function(obj, keypath, value) {
      return obj[keypath] = value;
    }
  };

  Rivets.factory = function(sightglass) {
    Rivets.sightglass = sightglass;
    Rivets["public"]._ = Rivets;
    return Rivets["public"];
  };

  if (typeof (typeof module !== "undefined" && module !== null ? module.exports : void 0) === 'object') {
    module.exports = Rivets.factory(require('sightglass'));
  } else if (typeof define === 'function' && define.amd) {
    define(['sightglass'], function(sightglass) {
      return this.rivets = Rivets.factory(sightglass);
    });
  } else {
    this.rivets = Rivets.factory(sightglass);
  }

}).call(this);

},{"sightglass":2}],2:[function(require,module,exports){
(function() {
  // Public sightglass interface.
  function sightglass(obj, keypath, callback, options) {
    return new Observer(obj, keypath, callback, options)
  }

  // Batteries not included.
  sightglass.adapters = {}

  // Constructs a new keypath observer and kicks things off.
  function Observer(obj, keypath, callback, options) {
    this.options = options || {}
    this.options.adapters = this.options.adapters || {}
    this.obj = obj
    this.keypath = keypath
    this.callback = callback
    this.objectPath = []
    this.parse()

    if(isObject(this.target = this.realize())) {
      this.set(true, this.key, this.target, this.callback)
    }
  }

  // Tokenizes the provided keypath string into interface + path tokens for the
  // observer to work with.
  Observer.tokenize = function(keypath, interfaces, root) {
    tokens = []
    current = {i: root, path: ''}

    for (index = 0; index < keypath.length; index++) {
      chr = keypath.charAt(index)

      if(!!~interfaces.indexOf(chr)) {
        tokens.push(current)
        current = {i: chr, path: ''}
      } else {
        current.path += chr
      }
    }

    tokens.push(current)
    return tokens
  }

  // Parses the keypath using the interfaces defined on the view. Sets variables
  // for the tokenized keypath as well as the end key.
  Observer.prototype.parse = function() {
    interfaces = this.interfaces()

    if(!interfaces.length) {
      error('Must define at least one adapter interface.')
    }

    if(!!~interfaces.indexOf(this.keypath[0])) {
      root = this.keypath[0]
      path = this.keypath.substr(1)
    } else {
      if(typeof (root = this.options.root || sightglass.root) === 'undefined') {
        error('Must define a default root adapter.')
      }

      path = this.keypath
    }

    this.tokens = Observer.tokenize(path, interfaces, root)
    this.key = this.tokens.pop()
  }

  // Realizes the full keypath, attaching observers for every key and correcting
  // old observers to any changed objects in the keypath.
  Observer.prototype.realize = function() {
    current = this.obj
    unreached = false

    this.tokens.forEach(function(token, index) {
      if(isObject(current)) {
        if(typeof this.objectPath[index] !== 'undefined') {
          if(current !== (prev = this.objectPath[index])) {
            this.set(false, token, prev, this.update.bind(this))
            this.set(true, token, current, this.update.bind(this))
            this.objectPath[index] = current
          }
        } else {
          this.set(true, token, current, this.update.bind(this))
          this.objectPath[index] = current
        }

        current = this.get(token, current)
      } else {
        if(unreached === false) unreached = index

        if(prev = this.objectPath[index]) {
          this.set(false, token, prev, this.update.bind(this))
        }
      }
    }, this)

    if(unreached !== false) {
      this.objectPath.splice(unreached)
    }

    return current
  }

  // Updates the keypath. This is called when any intermediary key is changed.
  Observer.prototype.update = function() {
    if((next = this.realize()) !== this.target) {
      if(isObject(this.target)) {
        this.set(false, this.key, this.target, this.callback)
      }

      if(isObject(next)) {
        this.set(true, this.key, next, this.callback)
      }

      oldValue = this.value()
      this.target = next

      if(this.value() !== oldValue) this.callback()
    }
  }

  // Reads the current end value of the observed keypath. Returns undefined if
  // the full keypath is unreachable.
  Observer.prototype.value = function() {
    if(isObject(this.target)) {
      return this.get(this.key, this.target)
    }
  }

  // Sets the current end value of the observed keypath. Calling setValue when
  // the full keypath is unreachable is a no-op.
  Observer.prototype.setValue = function(value) {
    if(isObject(this.target)) {
      this.adapter(this.key).set(this.target, this.key.path, value)
    }
  }

  // Gets the provided key on an object.
  Observer.prototype.get = function(key, obj) {
    return this.adapter(key).get(obj, key.path)
  }

  // Observes or unobserves a callback on the object using the provided key.
  Observer.prototype.set = function(active, key, obj, callback) {
    action = active ? 'observe' : 'unobserve'
    this.adapter(key)[action](obj, key.path, callback)
  }

  // Returns an array of all unique adapter interfaces available.
  Observer.prototype.interfaces = function() {
    interfaces = Object.keys(this.options.adapters)

    Object.keys(sightglass.adapters).forEach(function(i) {
      if(!~interfaces.indexOf(i)) {
        interfaces.push(i)
      }
    })

    return interfaces
  }

  // Convenience function to grab the adapter for a specific key.
  Observer.prototype.adapter = function(key) {
    return this.options.adapters[key.i] ||
      sightglass.adapters[key.i]
  }

  // Unobserves the entire keypath.
  Observer.prototype.unobserve = function() {
    this.tokens.forEach(function(token, index) {
      if(obj = this.objectPath[index]) {
        this.set(false, token, obj, this.update.bind(this))
      }
    }, this)

    if(isObject(this.target)) {
      this.set(false, this.key, this.target, this.callback)
    }
  }

  // Check if a value is an object than can be observed.
  function isObject(obj) {
    return typeof obj === 'object' && obj !== null
  }

  // Error thrower.
  function error(message) {
    throw new Error('[sightglass] ' + message)
  }

  // Export module for Node and the browser.
  if(typeof module !== 'undefined' && module.exports) {
    module.exports = sightglass
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return this.sightglass = sightglass
    })
  } else {
    this.sightglass = sightglass
  }
}).call(this)

},{}],3:[function(require,module,exports){
var Facetor,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

module.exports = Facetor = (function() {
  function Facetor(index, originalTags) {
    this.index = index;
    this.originalTags = originalTags != null ? originalTags : [];
    this.init();
  }

  Facetor.prototype.init = function() {
    this.titles = Object.keys(this.index);
    this.tags = this.originalTags.slice();
    this.selection = {};
  };

  Facetor.prototype.filter = function(tag) {
    var item, tags, tg, title, titles, _i, _j, _len, _len1, _ref, _ref1;
    if (this.selection[tag]) {
      return;
    }
    titles = [];
    tags = {};
    _ref = this.titles;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      title = _ref[_i];
      item = this.index[title];
      if (__indexOf.call(item.tags, tag) >= 0) {
        titles.push(title);
        _ref1 = item.tags;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          tg = _ref1[_j];
          if (__indexOf.call(this.tags, tg) >= 0) {
            tags[tg] = true;
          }
        }
      }
    }
    this.titles = titles;
    delete tags[tag];
    this.tags = Object.keys(tags);
    this.selection[tag] = true;
  };

  Facetor.prototype.defilter = function(tag) {
    var selection, _i, _len;
    if (!this.selection[tag]) {
      return;
    }
    delete this.selection[tag];
    selection = Object.keys(this.selection);
    this.init();
    for (_i = 0, _len = selection.length; _i < _len; _i++) {
      tag = selection[_i];
      this.filter(tag);
    }
  };

  return Facetor;

})();



},{}],4:[function(require,module,exports){
var Panel, Store, dummies, i, item, selection, store;

Panel = require("./ui/panel");

Store = require("./store");

dummies = [
  {
    title: "Half-Life",
    tags: ["FPS", "scifi"]
  }, {
    title: "Unreal",
    tags: ["FPS", "scifi"]
  }, {
    title: "Command & Conquer",
    tags: ["RTS", "military", "scifi"]
  }, {
    title: "Portal",
    tags: ["FPS", "puzzle", "scifi"]
  }
];

selection = (function() {
  var _i, _len, _results;
  _results = [];
  for (i = _i = 0, _len = dummies.length; _i < _len; i = ++_i) {
    item = dummies[i];
    if (i === 0 || i === 3) {
      _results.push(item);
    }
  }
  return _results;
})();

store = new Store();

store.load().then(function(store) {
  var browser, rack, rackStore, _i, _j, _len, _len1;
  rackStore = new Store();
  for (_i = 0, _len = selection.length; _i < _len; _i++) {
    item = selection[_i];
    rackStore.absorb(item);
  }
  rack = new Panel(rackStore);
  document.body.appendChild(rack.container);
  for (_j = 0, _len1 = dummies.length; _j < _len1; _j++) {
    item = dummies[_j];
    store.absorb(item);
  }
  browser = new Panel(store, {
    filterable: true
  });
  document.body.appendChild(browser.container);
});



},{"./store":5,"./ui/panel":7}],5:[function(require,module,exports){
var Card, Store, util;

util = require("./util");

module.exports = Store = (function() {
  function Store() {
    this.index = {};
    this.tags = {};
  }

  Store.prototype.load = function(src) {
    return this.retrieve(src).then((function(_this) {
      return function(cards) {
        var data, _i, _len;
        for (_i = 0, _len = cards.length; _i < _len; _i++) {
          data = cards[_i];
          _this.absorb(data);
        }
        return _this;
      };
    })(this));
  };

  Store.prototype.absorb = function(item) {
    var card, tag, title, _base, _i, _len, _ref;
    card = new Card(item);
    title = card.title;
    if (this.index[title]) {
      util.error("duplicate title", title);
    }
    this.index[title] = card;
    _ref = card.tags;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tag = _ref[_i];
      (_base = this.tags)[tag] || (_base[tag] = []);
      this.tags[tag].push(card);
    }
  };

  Store.prototype.retrieve = function(src) {
    return new Promise(function(resolve, reject) {
      setTimeout((function() {
        return resolve([]);
      }), 100);
    });
  };

  return Store;

})();

Card = (function() {
  function Card(data) {
    this.title = data.title;
    this.tags = data.tags || [];
  }

  return Card;

})();



},{"./util":9}],6:[function(require,module,exports){
var FilterSelector, Tag, rivets, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

rivets = require("rivets");

util = require("./util");

module.exports = FilterSelector = (function() {
  function FilterSelector(tags, options) {
    var tag;
    if (options == null) {
      options = {};
    }
    this.onDeselect = __bind(this.onDeselect, this);
    this.onSelect = __bind(this.onSelect, this);
    this.tags = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tags.length; _i < _len; _i++) {
        tag = tags[_i];
        _results.push(new Tag(tag));
      }
      return _results;
    })();
    this.onChange = options.onChange;
    this.container = util.getTemplate("filter-selector");
    rivets.bind(this.container, this);
  }

  FilterSelector.prototype.onSelect = function(ev, rv) {
    this.update(rv.tag, true);
  };

  FilterSelector.prototype.onDeselect = function(ev, rv) {
    this.update(rv.tag, false);
  };

  FilterSelector.prototype.setCandidates = function(tagNames) {
    var tag, _i, _len, _ref, _ref1;
    _ref = this.tags;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tag = _ref[_i];
      tag.set("disabled", (_ref1 = tag.name, __indexOf.call(tagNames, _ref1) < 0));
    }
  };

  FilterSelector.prototype.update = function(tag, selected) {
    var status;
    tag.set("selected", selected);
    status = selected ? "added" : "removed";
    if (this.onChange) {
      this.onChange.call(null, status, tag.name);
    }
  };

  return FilterSelector;

})();

Tag = (function() {
  function Tag(name, selected, disabled) {
    this.name = name;
    this.selected = selected;
    this.disabled = disabled;
    this.set();
  }

  Tag.prototype.set = function(prop, value) {
    if (value !== void 0) {
      this[prop] = value;
    }
    this.selectable = !this.selected && !this.disabled;
  };

  return Tag;

})();



},{"./util":8,"rivets":1}],7:[function(require,module,exports){
var Card, Facetor, FilterSelector, Panel, rivets, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

rivets = require("rivets");

FilterSelector = require("./filter_selector");

Facetor = require("../facetor");

util = require("./util");

module.exports = Panel = (function() {
  function Panel(deck, options) {
    var card, tags, title;
    if (options == null) {
      options = {};
    }
    this.onFilter = __bind(this.onFilter, this);
    this.cards = (function() {
      var _ref, _results;
      _ref = deck.index;
      _results = [];
      for (title in _ref) {
        card = _ref[title];
        _results.push(new Card(card.title, card.tags));
      }
      return _results;
    })();
    this.container = util.getTemplate("panel");
    rivets.bind(this.container, this);
    if (options.filterable) {
      tags = Object.keys(deck.tags);
      this.facetor = new Facetor(deck.index, tags);
      this.filter = new FilterSelector(tags, {
        onChange: this.onFilter
      });
      util.prepend(this.filter.container, this.container);
    }
  }

  Panel.prototype.onFilter = function(status, tag) {
    var card, _i, _len, _ref, _ref1, _results;
    if (status === "added") {
      this.facetor.filter(tag);
    } else {
      this.facetor.defilter(tag);
    }
    this.filter.setCandidates(this.facetor.tags);
    _ref = this.cards;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      card = _ref[_i];
      _results.push(card.disabled = (_ref1 = card.title, __indexOf.call(this.facetor.titles, _ref1) < 0));
    }
    return _results;
  };

  return Panel;

})();

Card = (function() {
  function Card(title, tags, disabled) {
    this.title = title;
    this.tags = tags;
    this.disabled = disabled;
  }

  return Card;

})();



},{"../facetor":3,"./filter_selector":6,"./util":8,"rivets":1}],8:[function(require,module,exports){
exports.getTemplate = function(name) {
  var clone, node;
  node = document.getElementById("" + name + "-template");
  if (!node) {
    return false;
  }
  clone = node.cloneNode(true);
  clone.removeAttribute("id");
  clone.classList.remove("template");
  return clone;
};

exports.prepend = function(node, parent) {
  var ref;
  ref = parent.firstChild;
  if (ref) {
    parent.insertBefore(node, ref);
  } else {
    parent.appendChild(node);
  }
};



},{}],9:[function(require,module,exports){
(function (global){
var __slice = [].slice;

exports.error = function() {
  var args, msg;
  msg = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (!global.console) {
    return;
  }
  if (console.error) {
    console.error.apply(console, [msg].concat(__slice.call(args)));
  } else {
    console.log.apply(console, [msg].concat(__slice.call(args)));
  }
};



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[4]);
