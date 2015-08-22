// Build file for the project!

import gulp from 'gulp';
import gutil from 'gulp-util';
import connect from 'gulp-connect';
import sourcemaps from 'gulp-sourcemaps';
import browserify from 'browserify';
import babelify from 'babelify';
import watchify from 'watchify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

gulp.task('connect', _ => {
  connect.server({ root: 'game', livereload: true });
});

gulp.task('source', _ => {
  let bundler = browserify({
    entries: ['src/game.js'],
    debug: true,
    transform: [babelify]
  });

  return bundler.bundle()
    .pipe(source('game.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('game'))
    .pipe(connect.reload());
});

gulp.task('watch', _ => {
  gulp.watch('src/**/*.js', ['source']);
});

gulp.task('default', ['connect', 'watch']);
