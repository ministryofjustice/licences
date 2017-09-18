'use strict';

let gulp = require('gulp');
let mocha = require('gulp-spawn-mocha');
let fs = require('fs');
let runSequence = require('run-sequence');

gulp.task('test', function (done) {
    runSequence(
        'set-test-env',
        'runtest',
        'set-dev-env', done)
});

gulp.task('runtest', function () {
    return gulp.src(['test/**/*.js'])
        .pipe(mocha({
            timeout: 5000,
            reporter: 'list',
            istanbul: {
                dir: 'build/reports/coverage'
            }
        }));
});

gulp.task('unittestreport', function () {
    return gulp.src(['test/**/*.js'])
        .pipe(mocha({
            timeout: 3000,
            reporter: 'mocha-junit-reporter',
            istanbul: {
                dir: 'build/reports/coverage'
            }
        }));
});

gulp.task('set-test-env', function() {
    return process.env.NODE_ENV = 'test';
});

gulp.task('set-dev-env', function() {
    return process.env.NODE_ENV = 'dev';
});
