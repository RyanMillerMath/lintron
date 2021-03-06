// Generated by CoffeeScript 1.7.1
(function() {
  var ASTApi, ASTLinter, BaseLinter, hasChildren, node_children,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseLinter = require('./base_linter.js');

  node_children = {
    Class: ['variable', 'parent', 'body'],
    Code: ['params', 'body'],
    For: ['body', 'source', 'guard', 'step'],
    If: ['condition', 'body', 'elseBody'],
    Obj: ['properties'],
    Op: ['first', 'second'],
    Switch: ['subject', 'cases', 'otherwise'],
    Try: ['attempt', 'recovery', 'ensure'],
    Value: ['base', 'properties'],
    While: ['condition', 'guard', 'body']
  };

  hasChildren = function(node, children) {
    var _ref;
    return (node != null ? (_ref = node.children) != null ? _ref.length : void 0 : void 0) === children.length && (node != null ? node.children.every(function(elem, i) {
      return elem === children[i];
    }) : void 0);
  };

  ASTApi = (function() {
    function ASTApi(config) {
      this.config = config;
    }

    ASTApi.prototype.getNodeName = function(node) {
      var children, name, _ref;
      name = node != null ? (_ref = node.constructor) != null ? _ref.name : void 0 : void 0;
      if (node_children[name]) {
        return name;
      } else {
        for (name in node_children) {
          if (!__hasProp.call(node_children, name)) continue;
          children = node_children[name];
          if (hasChildren(node, children)) {
            return name;
          }
        }
      }
    };

    return ASTApi;

  })();

  module.exports = ASTLinter = (function(_super) {
    __extends(ASTLinter, _super);

    function ASTLinter(source, config, rules, CoffeeScript) {
      this.CoffeeScript = CoffeeScript;
      ASTLinter.__super__.constructor.call(this, source, config, rules);
      this.astApi = new ASTApi(this.config);
    }

    ASTLinter.prototype.acceptRule = function(rule) {
      return typeof rule.lintAST === 'function';
    };

    ASTLinter.prototype.lint = function() {
      var coffeeError, err, errors, rule, v, _i, _len, _ref;
      errors = [];
      try {
        this.node = this.CoffeeScript.nodes(this.source);
      } catch (_error) {
        coffeeError = _error;
        err = this._parseCoffeeScriptError(coffeeError);
        if (err != null) {
          errors.push(err);
        }
        return errors;
      }
      _ref = this.rules;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rule = _ref[_i];
        this.astApi.createError = (function(_this) {
          return function(attrs) {
            if (attrs == null) {
              attrs = {};
            }
            return _this.createError(rule.rule.name, attrs);
          };
        })(this);
        rule.errors = errors;
        v = this.normalizeResult(rule, rule.lintAST(this.node, this.astApi));
        if (v != null) {
          return v;
        }
      }
      return errors;
    };

    ASTLinter.prototype._parseCoffeeScriptError = function(coffeeError) {
      var attrs, lineNumber, match, message, rule;
      rule = this.config['coffeescript_error'];
      message = coffeeError.toString();
      lineNumber = -1;
      if (coffeeError.location != null) {
        lineNumber = coffeeError.location.first_line + 1;
      } else {
        match = /line (\d+)/.exec(message);
        if ((match != null ? match.length : void 0) > 1) {
          lineNumber = parseInt(match[1], 10);
        }
      }
      attrs = {
        message: message,
        level: rule.level,
        lineNumber: lineNumber
      };
      return this.createError('coffeescript_error', attrs);
    };

    return ASTLinter;

  })(BaseLinter);

}).call(this);
