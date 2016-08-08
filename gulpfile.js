/**
* using gulp to compile source and tests down to es5 and run tests.
* the 'watch' tasks watch /src and /test/src, re-compiling and running the
* test suite when changes are detected.
* 
* i'm not huge on gulp... i find it a bit difficult and unintuitive, but though
* i'm sure there are all sorts of potential issues here, it pretty much seems
* to work for now.
* 
* the major rational is avoiding the startup cost of importing babel. since
* the 'watch' tasks stay running, the import delay is only incurred when the
* watch task is first started, making the incremental re-runs reasonably 
* fast, though we might need further optimization if/when the project grows
* significantly.
*/

var gulp = require('gulp');
var babel = require('gulp-babel');
var notifier = require('node-notifier');
var path = require('path');
var del = require('del');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var notifierReporter = require('mocha-notifier-reporter');

/**
* returns a gulp stream or vinyl files that compiles javascript in 
* `<baseDir>/src` to `<baseDir>/dist`.
* 
* @param {string} baseDir
*   directory with `src` and `dist`, relative to the project root.
* 
* @return {Stream<VinylFile>}
*   stream of vinyl files.
*/
function build(baseDir) {
  // this is set to a compilation error if there is one, and it's presence
  // is used to determine if the build failed.
  var compilationError = null;
  
  // clear out the `dist` directory
  del.sync([path.join(__dirname, baseDir, 'dist/**/*')]);
  
  return gulp
    // get all the .js files in the src dir
    .src(path.join(baseDir, 'src/**/*.js'), {cwd: __dirname})
    // compile them
    .pipe(babel())
    // we need to handle any error that occurred so that we can emit 'end'
    // and continue watching. also dispatch a notif that we failed.
    .on('error', function(error) {
      console.error(error.toString());
      console.error(error.codeFrame.toString());
      compilationError = error;
      notifier.notify({
        title: path.join("nrser.js", baseDir, 'src'),
        message: "ERROR COMPILING!",
      });
      this.emit('end');
    })
    // write the compiled sources to the dist dir
    .pipe(gulp.dest(path.join(baseDir, 'dist')))
    // at the end, if we didn't set an error, notify about the success
    .on('end', function() {
      if (!compilationError) {
        notifier.notify({
          title: path.join("nrser.js", baseDir, 'src'),
          message: "compiled.",
        });
      }
    });
}

/**
* returns a gulp stream of vinyl files that run the tests in `/test/dist`
* with mocha.
* 
* @return {Stream<VinylFile>}
*   stream of vinyl files.
*/
function test() {
  return gulp.src('test/dist/**/*.tests.js', {cwd: __dirname})
    .pipe(mocha({reporter: notifierReporter.decorate('spec')}))
    .on('error', function() {
      this.emit('end')
    });
}

// tasks
// =====

/**
* compile module source in `/src` to `/dist`.
*/
gulp.task('build:src', function() {
  return build('.');
});

/**
* compile tests source in `/test/src` to `/test/dist`.
*/
gulp.task('build:test', function() {
  return build('test');
});

/**
* compile both module and tests sources.
*/
gulp.task('build', ['build:src', 'build:test']);

/**
* watch the module and tests sources, re-compiling when they change.
*/
gulp.task('build:watch', ['build'], function() {
  gulp.watch('src/**/*.js', ['build:src']);
  gulp.watch('test/src/**/*.js', ['build:test'])
});

/**
* run the tests after compiling the module source.
*/
gulp.task('build:src:thenTest', ['build:src'], test);

/**
* run the tests after compiling the tests source.
*/
gulp.task('build:test:thenTest', ['build:test'], test);

/**
* run the tests, compiling everything first.
*/
gulp.task('test', ['build'], test);

/**
* watch the module and tests sources, re-compiling and re-running the tests
* when they change.
*/
gulp.task('test:watch', ['test'], function() {
  gulp.watch('src/**/*.js', ['build:src:thenTest']);
  gulp.watch('test/src/**/*.js', ['build:tests:thenTest'])
});

/**
* general "watch everything", which is just `test:watch`.
*/
gulp.task('watch', ['test:watch']);
