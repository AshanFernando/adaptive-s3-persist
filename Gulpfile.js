'use strict';
var gulp = require('gulp');
var webserver = require('gulp-webserver');

gulp.task('experiment', function() {
    gulp.src('.')
        .pipe(webserver({
            livereload: true,
            open: '/experiment/index.html'
        }));
});

gulp.task('test', function() {
    gulp.src('.')
        .pipe(webserver({
            livereload: true,
            open: '/test/index.html'
        }));
});
