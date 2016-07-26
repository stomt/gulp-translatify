var through = require('through2');
var gutil = require('gulp-util');
var Translatify = require('./translatify.js');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-translatify';

// plugin level function (dealing with files)
function gulpTranslatify(translationFiles) {
  if (!translationFiles) {
    throw new PluginError(PLUGIN_NAME, 'Missing translation files!');
  }

  // init translatify
  var translatify = new Translatify(translationFiles);

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return cb();
    }

    if (file.isBuffer()) {
      var parsed = translatify.optimize(file.contents.toString());
      file.contents = new Buffer(parsed);
    }

    // make sure the file goes through the next gulp plugin
    this.push(file);

    // tell the stream engine that we are done with this file
    cb();
  });

  // returning the file stream
  return stream;
}

// exporting the plugin main function
module.exports = gulpTranslatify;