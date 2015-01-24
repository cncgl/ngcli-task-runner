path = require "path"
broccoli = require "broccoli"
rimraf = require "rimraf"
Watcher = require "broccoli/lib/watcher"
Lineup = require "lineup"
lineup = new Lineup()
mergeTrees = require "broccoli-merge-trees"
helpers = require "broccoli-kitchen-sink-helpers"
ngCli = require "./helpers.js"
cli = new ngCli()
_ = require "lodash"

class BroccoliBuild

  builder: (tree) ->
    new broccoli.Builder mergeTrees tree,{overwrite:true}

  build: (dest,tree) ->
    lineup.action.info "build","Starting build process"
    builder = @.builder tree
    builder.build()
    .then (output) ->
      lineup.log.success "Build successfull"
      rimraf.sync dest
      helpers.copyRecursivelySync output.directory, dest
      return
    .catch (err) ->
      lineup.log.error err
      return
    return

  readTree: (cb) ->
    cli._getAppAddons (err,addons) ->
      ngTasks = []
      if addons.tasks
        _.each addons.tasks, (task) ->
          ngTasks.push task.init()
        cb(null,_.flatten(ngTasks));
      else
        cb 'no build tasks found'
    return

  serve: (tree,options) ->
    builder = @.builder tree
    broccoli.server.serve builder,{host:options.host,port:options.port,liveReloadPort:options.lrPort}
    return

  watch: (dest,tree) ->
    builder = @.builder tree
    watcher = new Watcher builder, { interval: 100 }
    watcher.on 'change',(results) ->
      lineup.action.info "change","Changes detected"
      rimraf.sync dest
      helpers.copyRecursivelySync results.directory, dest
      lineup.log.success "Build successfull"
      watcher.emit "livereload"
    return

  run: (type) ->
    self = @
    cli._getNgConfig (err,config) ->
      if err
        lineup.log.error err
      else
        self.readTree (err,tree) ->
          if err
            lineup.log.error err
          else
            if type == 'serve'
              if config.run_server
                dist = path.join __dirname,'../../dist'
                self.serve tree,config
              else
                dist = path.join __dirname,'../../dist'
                self.watch dist,tree
            else
              dist = path.join __dirname,'../../dist'
              self.build dist,tree
    return
module.exports = BroccoliBuild
