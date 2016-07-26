var gulp = require('gulp');
var expect = require('chai').expect;
var translatify = require('../');
var through = require('through2');
var fs = require('fs');

describe('gulp-translatify', function() {
	var filenameIn = __dirname + '/fixture/scripts.js';
	var filenameOut = __dirname + '/expected/scripts.js';
	var translationFiles = [
		__dirname + '/fixture/lang-de.js',
		__dirname + '/fixture/lang-en.js'
	];

	it('should...', function(done) {
		return gulp.src(filenameIn)
			.pipe(translatify(translationFiles))
			.pipe(through.obj(function(file, encoding, callback){
				var expected = fs.readFileSync(filenameOut);
				expect(file.contents.toString()).to.be.equal(expected.toString());
				done();
			}));
	});

});
