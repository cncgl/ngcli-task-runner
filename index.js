var Broc = require("./broc.js");
var broc = new Broc();
var Server = require("karma").Server;
var path = require("path");

if(process.argv.indexOf('--build') > -1){
  broc.run('build');
}
if(process.argv.indexOf('--serve') > -1){
  broc.run('serve');
}
if(process.argv.indexOf('--test') > -1){
  karmaFile = path.join(__dirname+'/../../','karma.conf.js');
  singleRun = false;
  config = {
    configFile: karmaFile,
    singleRun: singleRun
  };
  var server = new Server(config);
  server.start();
}
