'use strict';

let gulp = require('gulp');
let eslint = require('gulp-eslint');

gulp.task('lint-client', function () {
    return gulp.src(['./assets/javascripts/application.js'])
        .pipe(eslint())
        .pipe(eslint.format());
});


gulp.task('lint-server', function () {
    return gulp.src(['./server.js', './data/*.js', './routes/*.js', './server/*.js', './utils/*.js'])
        .pipe(eslint())
        .pipe(eslint.format());
});
