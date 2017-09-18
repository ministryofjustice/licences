'use strict';

let gulp = require('gulp');
let clean = require('gulp-clean');

gulp.task('clean', function () {
    return gulp.src([
        'public/*',
        'govuk_modules/*',
        '.port.tmp',
        '*.log',
        'build/*',
        'uploads/*',
        'test-results.xml',
    ], {read: false})
        .pipe(clean())
});
