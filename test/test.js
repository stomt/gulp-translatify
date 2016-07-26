var gulp = require('gulp');
var expect = require('chai').expect;
var translatify = require('../');
var through = require('through2');
var fs = require('fs');

describe('gulp-translatify', function() {
	var filenameIn = __dirname + '/fixture/scripts.js';
	var filenameOut = __dirname + '/expected/scripts.js';

	it('should...', function(done) {
		return gulp.src(filenameIn)
			.pipe(translatify('text'))
			.pipe(through.obj(function(file, encoding, callback){
				var source = fs.readFileSync(filenameOut);

				expect(source.toString()).to.be.equal(file.contents.toString());
				done();
			}));
	});

});
