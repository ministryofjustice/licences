'use strict';

let gulp = require('gulp');

gulp.task('copy-govuk-modules', [
    'copy-toolkit',
    'copy-template-assets',
    'copy-elements-sass',
    'copy-template'
]);

gulp.task('copy-toolkit', function () {
    return gulp.src(['node_modules/govuk_frontend_toolkit/**'])
        .pipe(gulp.dest('./govuk_modules/govuk_frontend_toolkit/'))
});

gulp.task('copy-template', function () {
    return gulp.src(['node_modules/govuk_template_jinja/views/layouts/**'])
        .pipe(gulp.dest('./govuk_modules/govuk_template/layouts/'))
});

gulp.task('copy-template-assets', function () {
    return gulp.src(['node_modules/govuk_template_jinja/assets/**'])
        .pipe(gulp.dest('./govuk_modules/govuk_template/assets/'))
});

gulp.task('copy-elements-sass', function () {
    return gulp.src(['node_modules/govuk-elements-sass/public/sass/**'])
        .pipe(gulp.dest('./govuk_modules/govuk-elements-sass/'))
});
