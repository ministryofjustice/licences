'use strict';

let fs = require('fs');
let path = require('path');
let gulp = require('gulp');
let nodemon = require('gulp-nodemon');

gulp.task('server', function () {
  nodemon({
    script: 'server.js',
    ext: 'js, json',
    ignore: ['public/*',
      'assets/*',
      'govuk_modules*',
      'node_modules*']
  }).on('quit', function () {
    // remove .port.tmp if it exists
    try {
      fs.unlinkSync(path.join(__dirname, '/../.port.tmp'))
    } catch (e) {}

    process.exit(0)
  })
});
