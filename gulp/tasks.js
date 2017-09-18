'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');

gulp.task('default', function (done) {
    runSequence(
        'build', done)
});

gulp.task('dev', function (done) {
    runSequence(
        'build',
        'lint',
        'test',
        'watch',
        'server', done)
});

gulp.task('build', function (done) {
    runSequence(
        'clean',
        'generate-assets',done)
});

gulp.task('generate-assets', function (done) {
    runSequence(
        'copy-govuk-modules',
        'sass',
        'copy-assets', done)
});

gulp.task('watch', function (done) {
    runSequence(
        'watch-sass',
        'watch-assets',
        'watch-client-js',
        'watch-tests', done)
});

gulp.task('lint', function (done) {
    runSequence(
        'lint-client',
        'lint-server', done)
});

gulp.task('silent-test', function (done) {
    runSequence(
        'logs-off',
        'test', done)
});

gulp.task('logs-off', function () {
    process.env.NODE_ENV = 'test';
});

