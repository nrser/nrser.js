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
// TODO remove
// var mocha = require('gulp-mocha');
var spawnMocha = require('gulp-spawn-mocha')
var gutil = require('gulp-util');
// TODO remove
// var notifierReporter = require('mocha-notifier-reporter');
var fs = require('fs');
var path = require('path');
var changed = require('gulp-changed');
var _ = require('lodash');

var packageJSON = JSON.parse(fs.readFileSync('./package.json'));

var NAME = packageJSON.name;
var SRC = 'src';
var DEST = path.dirname(packageJSON.main);

/**
* handle a stream error by notifying and logging and ending the stream
*/
function onError(title, state, error) {
  console.error(error.message);
  
  if (error.codeFrame) {
    console.error(error.codeFrame.toString());
  } else if (error.stack) {
    console.error(error.stack.toString());
  }
  
  if (state) {
    state.error = error;
  }
  
  notifier.notify({
    title: title,
    message: "ERROR COMPILING!",
  });
  
  this.emit('end');
}

/**
* returns a gulp stream or vinyl files that compiles javascript in 
* `<baseDir>/src` to `<baseDir>/<DEST>`.
* 
* @param {string} baseDir
*   directory with `src` and `dest` folders, relative to the project root.
* 
* @return {Stream<VinylFile>}
*   stream of vinyl files.
*/
function build(baseDir, src, dest) {
  // this is set to a compilation error if there is one, and it's presence
  // is used to determine if the build failed.
  var state = {};
  var title = path.join(NAME, baseDir, src);
  
  // clear out the `dist` directory
  // del.sync([path.join(__dirname, baseDir, dest, '**', '*')]);
  
  return gulp
    // get all the .js files in the src dir
    .src(path.join(baseDir, src, '**', '*.js'))
    // build only those that changed
    .pipe(changed(path.join(baseDir, dest)))
    // compile them
    .pipe(babel())
    // we need to handle any error that occurred so that we can emit 'end'
    // and continue watching. also dispatch a notif that we failed.
    .on('error', _.curry(onError)(title, state))
    // write the compiled sources to the dist dir
    .pipe(gulp.dest(path.join(baseDir, dest)))
    // at the end, if we didn't set an error, notify about the success
    .on('end', function() {
      if (!state.error) {
        notifier.notify({
          title: title,
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
function test(dest) {
  return gulp.src(path.join('test', dest, '**', '*.tests.js'))
    // .pipe(mocha({reporter: notifierReporter.decorate('spec')}))
    .pipe(spawnMocha({
      growl: true,
    }))
    .on('error', _.curry(onError)(NAME + 'test', null));
}

// tasks
// =====

gulp.task('clean:src', function() {
  del(path.join(DEST, '**', '*'));
});

gulp.task('clean:test', function() {
  del(path.join('test', DEST, '**', '*'));
});

gulp.task('clean', ['clean:src', 'clean:test']);

/**
* compile module source in `/src` to `/dist`.
*/
gulp.task('build:src', function() {
  return build('.', SRC, DEST);
});

/**
* compile tests source in `/test/src` to `/test/dist`.
*/
gulp.task('build:test', function() {
  return build('test', SRC, DEST);
});

/**
* compile both module and tests sources.
*/
gulp.task('build', ['build:src', 'build:test']);

/**
* watch the module and tests sources, re-compiling when they change.
*/
gulp.task('build:watch', ['build'], function() {
  gulp.watch(path.join(SRC, '**', '*.js'), ['build:src']);
  gulp.watch(path.join('test', SRC, '**', '*.js'), ['build:test'])
});

/**
* run the tests after compiling the module source.
*/
gulp.task('build:src:thenTest', ['build:src'], function(){ 
  return test(DEST);
});

/**
* run the tests after compiling the tests source.
*/
gulp.task('build:test:thenTest', ['build:test'], function() {
  return test(DEST);
});

/**
* run the tests, compiling everything first.
*/
gulp.task('test', ['build'], function() {
  return test(DEST);
});

/**
* watch the module and tests sources, re-compiling and re-running the tests
* when they change.
*/
gulp.task('test:watch', ['test'], function() {
  gulp.watch(path.join(SRC, '**', '*.js'), ['build:src:thenTest']);
  gulp.watch(path.join('test', SRC, '**', '*.js'), ['build:test:thenTest'])
});

/**
* general "watch everything", which is just `test:watch`.
*/
gulp.task('watch', ['test:watch']);
