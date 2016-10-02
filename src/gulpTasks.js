import babel from 'gulp-babel';
import notifier from 'node-notifier';
import path from 'path';
import del from 'del';
import spawnMocha from 'gulp-spawn-mocha';
import gutil from 'gulp-util';
import fs from 'fs';
import changed from 'gulp-changed';
import _ from 'lodash';
import glob from 'glob';
import debug from 'gulp-debug';
import t from 'tcomb';
import util from 'util';
import gaze from 'gaze';
import { exec } from 'child_process';

export const BuildDir = t.struct({
  name: t.String,
  src: t.String,
  dest: t.String
});

// class BabelConfig extends t.struct({
//   dirs: t.list(t.String),
//   exts: t.list(t.String),
// }) {
//   constructor({
//     srcDirs = ['src', 'test'],
//     exts = ['js', 'jsx', 'es', 'es6'],
//     
//   })
// }

/**
* reads the `package.json` file in the current directory to get the
* package name, falling back to the directory name.
*/
function getName() {
  try {
    return JSON.parse(fs.readFileSync('./package.json')).name;
  } catch (error) {
    return path.basename(process.cwd());
  }
}

export class GulpTasks {
  constructor(gulp, {
    // name of the package
    name = getName(),
    
    // // directories that 
    // babelDirs = ['src', 'test/src'],
    // 
    // extensions to have babel compile
    babelExts = ['js', 'jsx', 'es', 'es6'],
    // 
    // // name of the babel source directories
    // srcDirname = 'src',
    // 
    // // name of the babel destination directories (siblings to the source 
    // // directories) 
    // destDirname = 'lib',
    // 
    // // name of the test directory
    // testDirname = 'test',
    // 
    // srcTemplate = "./<%= srcDirname %>/**/*.<%= compileExts %>",
    //   
    // destTemplate = "./<%= destDirname %>",
    //   
    // testSrcTemplate = "./<%= testDirname %>/<%= srcDirname %>/**/*.<%= compileExts %>",
    //   
    // testDestTemplate = "./<%= testDirname %>/<%= destDirname %>",
    //   
    // testFilesTemplate = "./<%= testDirname %>/<%= destDirname %>/**/*.tests.<%= compileExts %>",
    // 
  } = {}) {
    this.gulp = gulp;
    
    this.name = name;
    
    this.babelExtsStr = `{${ babelExts.join(',') }}`;
    
    this.buildDirs = [
      new BuildDir({
        name: 'src',
        src: `src/**/*.${ this.babelExtsStr }`,
        dest: 'lib',
      }),
      
      new BuildDir({
        name: 'test',
        src: `test/src/**/*.${ this.babelExtsStr }`,
        dest: 'test/lib',
      }),
    ];
    
    this.createCleanTasks();
    this.createBabelTasks();
    this.createMochaTask();
    
    this.createBabelWatchTasks();
  }
  
  // util
  // ====
  
  notify(taskName, status, message) {
    notifier.notify({
      title: `${ this.name } [${ taskName }] ${ status }`,
      message,
    });
  }
  
  onError(taskName, error, log = true) {
    this.notify(taskName, 'ERROR', error.message);
    
    // in some situations gulp will log the error on it's own, so
    // allow this to be skipped
    if (log) {      
      gutil.log(`[${ taskName }] ERROR`);
      
      if (error.stack) {
        gutil.log(error.stack.toString());
      } else {
        gutil.log(error.toString());
      }
    }
  }
  
  clean(taskName, dest, callback) {
    exec(`git clean -fdX ${ dest }`, (error, stdout, stderr) => {
      if (error) {
        // let gulp know we fucked up
        callback(error);
        
      } else {
        // log any outputs
        _.each({stdout, stderr}, (output, name) => {
          if (output) {
            gutil.log(`[${ taskName }]`, `${ name }: \n${ output }`);
          }  
        })
        
        // let gulp know we're done here
        callback();
      }
    });
  }
  
  babel(taskName, src, dest) {
    return this.gulp
      .src(src)
      .pipe(babel())
      .on('error', this.onError.bind(this, taskName))
      .pipe(this.gulp.dest(dest))
      .on('end', () => {
        this.notify(taskName, 'COMPILED', `${ src } => ${ dest }`);
      });
  }
  
  // low-level tasks
  // ===============
  //
  // tasks that get a specific thing done
  // 
  
  /**
  * create `clean:*`` tasks for each of the build directories and a
  * `clean` task that runs all of them in parallel.
  */
  createCleanTasks() {
    this.cleanTaskNames = _.map(this.buildDirs, (bd) => {
      const taskName = `clean:${ bd.name }`;
      
      this.gulp.task(taskName, (callback) => {
        this.clean(taskName, bd.dest, callback);
      });
      
      return taskName;
    });
    
    this.gulp.task('clean', this.cleanTaskNames);
  } // createCleanTasks
  
  /**
  * create `babel:*` tasks for each of the build directories and a `babel`
  * task that runs all of them in parallel.
  */
  createBabelTasks() {
    this.babelTaskNames = _.map(this.buildDirs, (bd) => {
      const taskName = `babel:${ bd.name }`;
      
      this.gulp.task(taskName, () => {
        return this.babel(taskName, bd.src, bd.dest);
      });
      
      return taskName;
    });
    
    this.gulp.task('babel', this.babelTaskNames);
  }
  
  
  createMochaTask() {
    const taskName = 'mocha';
    this.mochaFiles = `test/lib/**/*.${ this.babelExtsStr }`;
    
    this.gulp.task(taskName, () => {
      return this.gulp
        .src(this.mochaFiles, {read: false})
        .pipe(spawnMocha({growl: true}))
        .on('error', this.onError.bind(this, taskName));
    });
  }
  
  // high level tasks
  // ================
  //
  // tasks that compose the low-level tasks into more useful functionality
  // 
  
  createBabelWatchTasks() {
    this.babelWatchTaskNames = _.map(this.buildDirs, (bd) => {
      const taskName = `watch:babel:${ bd.name }`;
      
      const log = function(...messages) {
        gutil.log(`[${ taskName }]`, ...messages);
      }
      
      const relPath = function(toPath) {
        return path.relative(process.cwd(), toPath);
      }
      
      this.gulp.task(taskName, (callback) => {
        gaze(bd.src, (initError, watcher) => {
          if (initError) {
            callback(initError);
            return;
          }
          
          watcher.on('added', (filepath) => {
            const rel = relPath(filepath);
            
            log(`added ${ rel }`);
            
            this.babel(taskName, rel, bd.dest);
          });
          
          watcher.on('changed', (filepath) => {
            const rel = relPath(filepath);
            
            log(`changed ${ rel }`);
            
            this.babel(taskName, rel, bd.dest);
          });
          
          watcher.on('deleted', (filepath) => {
            const rel = relPath(filepath);
            
            log(`deleted ${ rel }`);
            
            throw "THIS DOESN'T WORK";
            
            this.clean(taskName, rel, (error) => {
              if (error) {
                this.onError(taskName, error);
              } else {
                this.notify(taskName, 'REMOVED', `${ rel } from ${ bd.dest }`);
              }
            });
          });
        });
      }); // task
      
      return taskName;
    });
    
    this.gulp.task('watch:babel', this.babelWatchTaskNames);
  }
  
}
