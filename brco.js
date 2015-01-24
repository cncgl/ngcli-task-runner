// Generated by CoffeeScript 1.8.0
(function() {
  var BroccoliBuild, Lineup, Watcher, broccoli, cli, helpers, lineup, mergeTrees, ngCli, path, rimraf, _;

  path = require("path");

  broccoli = require("broccoli");

  rimraf = require("rimraf");

  Watcher = require("broccoli/lib/watcher");

  Lineup = require("lineup");

  lineup = new Lineup();

  mergeTrees = require("broccoli-merge-trees");

  helpers = require("broccoli-kitchen-sink-helpers");

  ngCli = require("./helpers.js");

  cli = new ngCli();

  _ = require("lodash");

  BroccoliBuild = (function() {
    function BroccoliBuild() {}

    BroccoliBuild.prototype.builder = function(tree) {
      return new broccoli.Builder(mergeTrees(tree, {
        overwrite: true
      }));
    };

    BroccoliBuild.prototype.build = function(dest, tree) {
      var builder;
      lineup.action.info("build", "Starting build process");
      builder = this.builder(tree);
      builder.build().then(function(output) {
        lineup.log.success("Build successfull");
        rimraf.sync(dest);
        helpers.copyRecursivelySync(output.directory, dest);
      })["catch"](function(err) {
        lineup.log.error(err);
      });
    };

    BroccoliBuild.prototype.readTree = function(cb) {
      cli._getAppAddons(function(err, addons) {
        var ngTasks;
        ngTasks = [];
        if (addons.tasks) {
          _.each(addons.tasks, function(task) {
            return ngTasks.push(task.init());
          });
          return cb(null, _.flatten(ngTasks));
        } else {
          return cb('no build tasks found');
        }
      });
    };

    BroccoliBuild.prototype.serve = function(tree, options) {
      var builder;
      builder = this.builder(tree);
      broccoli.server.serve(builder, {
        host: options.host,
        port: options.port,
        liveReloadPort: options.lrPort
      });
    };

    BroccoliBuild.prototype.watch = function(dest, tree) {
      var builder, watcher;
      builder = this.builder(tree);
      watcher = new Watcher(builder, {
        interval: 100
      });
      watcher.on('change', function(results) {
        lineup.action.info("change", "Changes detected");
        rimraf.sync(dest);
        helpers.copyRecursivelySync(results.directory, dest);
        lineup.log.success("Build successfull");
        return watcher.emit("livereload");
      });
    };

    BroccoliBuild.prototype.run = function(type) {
      var self;
      self = this;
      cli._getNgConfig(function(err, config) {
        if (err) {
          return lineup.log.error(err);
        } else {
          return self.readTree(function(err, tree) {
            var dist;
            if (err) {
              return lineup.log.error(err);
            } else {
              if (type === 'serve') {
                if (config.run_server) {
                  dist = path.join(__dirname, '../../dist');
                  return self.serve(tree, config);
                } else {
                  dist = path.join(__dirname, '../../dist');
                  return self.watch(dist, tree);
                }
              } else {
                dist = path.join(__dirname, '../../dist');
                return self.build(dist, tree);
              }
            }
          });
        }
      });
    };

    return BroccoliBuild;

  })();

  module.exports = BroccoliBuild;

}).call(this);
