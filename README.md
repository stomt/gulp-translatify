# gulp-translatify

Replaces long descriptive translation variables of [angular-translate](https://github.com/angular-translate/angular-translate) with shortcodes.

## Usage

```JavaScript
var translatify = require('gulp-translatify');

var translationFiles = [
  'app/files/lang-de.js',
  'app/files/lang-en.js'
];

gulp.task('translatify', function() {
  return gulp.src([
    'dist/scripts.js',
  ])
    .pipe(translatify(translationFiles))
    .pipe(gulp.dest('dist'));
});
```