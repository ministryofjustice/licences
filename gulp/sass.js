'use strict';

let gulp = require('gulp');
let sass = require('gulp-sass');
let sourcemaps = require('gulp-sourcemaps');
let sassVariables = require('gulp-sass-variables');
let rename = require('gulp-rename');

gulp.task('sass', [
    'standard-sass',
    'sass-old-ie',
]);

gulp.task('standard-sass', function () {
  return gulp.src('assets/sass/*.scss')
  .pipe(sass({outputStyle: 'expanded',
    includePaths: ['govuk_modules/govuk_frontend_toolkit/stylesheets',
      'govuk_modules/govuk_template/assets/stylesheets',
      'govuk_modules/govuk-elements-sass/']}).on('error', sass.logError))
  .pipe(sourcemaps.init())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('public/stylesheets/'))
});

gulp.task('sass-old-ie', function () {
    return gulp.src('assets/sass/application.scss')
    .pipe(sassVariables({
        '$is-ie': true,
        '$ie-version': 8
    }))
    .pipe(sass({outputStyle: 'expanded',
        includePaths: ['govuk_modules/govuk_frontend_toolkit/stylesheets',
            'govuk_modules/govuk_template/assets/stylesheets',
            'govuk_modules/govuk-elements-sass/']}).on('error', sass.logError))
    .pipe(rename('application-oldie.css'))
    .pipe(gulp.dest('public/stylesheets/'));
});



