'use strict';

let gulp = require('gulp');

gulp.task('watch-sass', function () {
    return gulp.watch('./assets/sass/**', {cwd: './'}, ['sass'])
});

gulp.task('watch-assets', function () {
    return gulp.watch(['./assets/images/**', './assets/javascripts/**'],
        {cwd: './'}, ['lint-client', 'copy-assets'])
});

gulp.task('watch-tests', function () {
    return gulp.watch(['./test/**/*.js'], {cwd: './'}, ['test'])
});

gulp.task('watch-client-js', () => gulp.watch([], {cwd: './'}, ['webpack']));
