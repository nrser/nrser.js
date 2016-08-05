var gulp = require('gulp');
var babel = require('gulp-babel');
var notify = require('gulp-notify');
var notifier = require('node-notifier');

var title = "nrser.js";
var SRC = 'src/**/*.js';

function notif(message) {
  return {
    title: "nrser.js",
    message: message
  };
}

gulp.task('build', function() {
  var hadError = false;
  
  return gulp.src(SRC)
    .pipe(babel())
    .on('error', notify.onError(function(error) {
      process.stderr.write(error.toString() + "\n\n");
      process.stderr.write(error.codeFrame.toString() + "\n\n");
      hadError = true;
      return notif("ERROR COMPILING");
    }))
    .pipe(gulp.dest('dist'))
    .on('end', function() {
      if (!hadError) {
        notifier.notify(notif("compiled"));
      }
    });
});

gulp.task('watch', ['build'], function() {
  gulp.watch(SRC, ['build']);
});
