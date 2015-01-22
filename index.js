var Broc = require("./brco.js");
var broc = new Broc();

if(process.argv.indexOf('--build') > -1){
  broc.run('build');
}
if(process.argv.indexOf('--serve') > -1){
  broc.run('serve');
}
