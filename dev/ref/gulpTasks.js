"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

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

const babel = require('gulp-babel');
const notifier = require('node-notifier');
const path = require('path');
const del = require('del');
const spawnMocha = require('gulp-spawn-mocha')
const gutil = require('gulp-util');
const fs = require('fs');
const changed = require('gulp-changed');
const _ = require('lodash');
const glob = require('glob');
const cleanDest = require('gulp-clean-dest');
const debug = require('gulp-debug');
const t = require('tcomb');
const util = require('util');
const gaze = require('gaze');

const BuildDir = t.struct({
  name: t.String,
  src: t.String,
  dest: t.String
});

const packageJSON = JSON.parse(fs.readFileSync('./package.json'));

// tasks
// =====

/**
* the module exports a function that is invoked with the requiring package's
* `gulp` instance so that the tasks are bound to that (if we just require
* `gulp` here we will be adding tasks to nrser's gulp instance, and they 
* won't be visible from the requiring package).
* 
* example usage:
* 
*     const gulp = require('gulp');
*     const gulpTasks = require('nrser/lib/gulpTasks')(gulp);
* 
* returns an object that exposes this module's functions and computed
* values.
*/
module.exports = function(gulp, options) {
  const errors = {};
  
  /**
  * handle a stream error by notifying and logging
  */
  const onError = function onError(title, errorsKey, error) {
    // console.error('I HAD AN ERROR', error.message);
    // 
    // if (error.codeFrame) {
    //   console.error(error.codeFrame.toString());
    // } else if (error.stack) {
    //   console.error(error.stack.toString());
    // }
    // 
    // if (errorsKey) {
    //   errors[errorsKey] = error;
    // }
    
    notifier.notify({
      title: 'ERROR ' + title,
      message: error.message,
    });
    
    // we used to 
    //
    //    this.emit('end');
    //
    // to allow the pipe to keep going, which allowed gulp.watch to keep
    // watching without stopping on the error.
    //
  }
  
  options = t.Object(options || {});
  
  const name = options.name || 
    packageJSON.name;
    
  const compileExts = options.compileExts ||
    ['js', 'jsx', 'es', 'es6'];
  
  const srcDirname = options.srcDirname ||
    'src';
    
  const destDirname = options.destDirname ||
    'lib';
    
  const testDirname = options.testDirname     ||  'test';
  
  
  const srcTemplate = options.srcTemplate ||
    "./<%= srcDirname %>/**/*.<%= compileExts %>";
    
  const destTemplate = options.destTemplate || 
    "./<%= destDirname %>";
    
  const testSrcTemplate = options.testSrcTemplate ||
    "./<%= testDirname %>/<%= srcDirname %>/**/*.<%= compileExts %>";
    
  const testDestTemplate = options.testDestTemplate ||
    "./<%= testDirname %>/<%= destDirname %>";
    
  const testFilesTemplate = options.testFilesTemplate ||
    "./<%= testDirname %>/<%= destDirname %>/**/*.tests.<%= compileExts %>";

  const compileExtsStr = _.isArray(compileExts) ? (
    '{' + compileExts.join(',') + '}'
  ) : (
    compileExts
  );
  
  const templateValues = {
    srcDirname: srcDirname,
    destDirname: destDirname,
    testDirname: testDirname,
    compileExts: compileExtsStr,
  };

  const src = _.template(srcTemplate)(templateValues);
  const dest = _.template(destTemplate)(templateValues);
  const testSrc = _.template(testSrcTemplate)(templateValues);
  const testDest = _.template(testDestTemplate)(templateValues);
  
  const extraBuildDirs = _.map(options.extraBuildDirs || [], (props) => {
    return new BuildDir(props);
  });
  
  const buildDirs = options.buildDirs || [
    new BuildDir({name: 'src', src: src, dest: dest}),
    new BuildDir({name: 'test', src: testSrc, dest: testDest}),
  ].concat(extraBuildDirs);
  
  const testFiles = _.template(testFilesTemplate)(templateValues);
  
  // util functions
  // ==============
  
  /**
  * send a notification that an error occurred 
  */
  function notifyOfError(source, error) {
    notifier.notify({
      title: "ERROR: " + name + " - " + source,
      message: error.message,
    });
  }
  
  /**
  * sends a notification about an error then throws it.
  */
  function notifyAndThrow(source, error) {
    notifyOfError(source, error);
    throw error;
  }
  
  /**
  * use gaze to watch things so that 
  */
  function watch(patterns, taskName) {
    gaze(patterns, (initError, watcher) => {
      if (initError) {
        notifyAndThrow('gaze', gutil.PluginError('gaze', initError));
      }
      
      watcher.on('all', (event, filepath) => {
        gulp.start(taskName);
      });
    });
    
    gulp.start(taskName);
  }
  
  function Watcher(options) {
    options = options || {};
    this.src = options.src;
    this.dest = options.dest;
  }
  
  /**
  * returns a gulp stream of vinyl files that run the tests in `/test/dist`
  * with mocha.
  * 
  * @return {Stream<VinylFile>}
  *   stream of vinyl files.
  */
  function test(name, testFiles) {
    if (!_.isEmpty(errors)) {
      notifier.notify({
        title: "test " + name,
        message: "won't test due to errors in " + _.keys(errors),
      });
      
      return;
    }
    
    return gulp.src(testFiles, {read: false})
      // .pipe(mocha({reporter: notifierReporter.decorate('spec')}))
      .pipe(spawnMocha({growl: true}))
      .on('error', _.curry(onError)('test ' + name, null));
  }
  
  // /**
  // * clean:* tasks
  // * 
  // * clean individual dest directories.
  // */
  // _.each(buildDirs, (bd) => {
  //   gulp.task('clean:' + bd.name, () => {
  //     return gulp.src(bd.src, {read: false})
  //       .pipe(cleanDest(bd.dest));
  //   });
  // });
  
  // /**
  // * clean task
  // * 
  // * clean all dest directories.
  // */
  // gulp.task('clean', _.map(buildDirs, bd => 'clean:' + bd.name));
  
  /**
  * build:* tasks
  * 
  * compile source for individual build directories.
  */
  _.each(buildDirs, (bd) => {
    const taskName = 'build:' + bd.name;
    
    gulp.task(taskName, () => {
      // clear any previous error
      delete errors[taskName];
      
      const title = name + ' ' + taskName;
      
      return gulp
        // get all the .js files in the src dir
        .src(bd.src)
        // build only those that changed
        .pipe(changed(bd.dest))
        // delete the previously built files
        .pipe(cleanDest(bd.dest))
        // compile them
        .pipe(babel())
        // we need to handle any error that occurred so that we can emit 'end'
        // and continue watching. also dispatch a notif that we failed.
        .on('error', _.curry(onError)(title, taskName))
        // write the compiled sources to the dist dir
        .pipe(gulp.dest(bd.dest))
        // at the end, if we didn't set an error, notify about the success
        .on('end', function() {
          if (errors[taskName]) {
            console.log(errors);
            this.emit('error', errors[taskName]);
          } else {
            notifier.notify({
              title: title,
              message: "compiled.",
            });
          }
        });
    });
  });
  
  /**
  * build task
  * 
  * compile all sources.
  */
  gulp.task('build', _.map(buildDirs, bd => 'build:' + bd.name));
  
  /**
  * build:watch task
  * 
  * watch all sources, re-compiling when they change.
  */
  gulp.task('build:watch', ['build'], () => {
    _.each(buildDirs, (bd) => {
      gulp.watch(bd.src, ['build:' + bd.name]);
    });
  });
  
  /**
  * run the tests.
  */
  gulp.task('test', () => {
    return test(name, testFiles);
  });
  
  /**
  * build then run the tests.
  */
  gulp.task('build:then:test', ['build'], () => {
    return test(name, testFiles);
  });
  
  /**
  * watch the files, building then testing when they change
  */
  gulp.task('test:watch', ['build:then:test'], () => {
    gulp.watch(_.map(buildDirs, bd => bd.src), ['build:then:test']);
  });
  
  /**
  * general "watch everything", which is just `test:watch`.
  * 
  * this can be overridden in the packages themselves to add more stuff.
  */
  // gulp.task('watch', ['test:watch']);
  
  // const tempGlob = 'tmp/gulpTest/**/*';
  // 
  // gulp.task('temp:T1', () => {
  //   gulp.src(tempGlob)
  //     .pipe(debug({title: 'T1'}))
  //     .pipe(babel())
  //     .on('error', function(error) {
  //       gutil.log("[temp:T1]", "error: " + error.message);
  //       this.emit('end');
  //     });
  // });
  // 
  // gulp.task('temp:T2', ['temp:T1'], () => {
  //   gulp.src(tempGlob)
  //     .pipe(debug({title: 'T2'}));
  // });
  // 
  // gulp.task('temp:watch', ['temp:T2'], () => {
  //   gulp.watch(tempGlob, ['temp:T2']);
  // });
  
  return {
    name: name,
    compileExts: compileExts,
    buildDirs: buildDirs,
    testFiles: testFiles,
  };
};