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

import { Scheduler } from './Scheduler';

type TaskName = string;

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
* dumps a value to a string in a way that shouldn't ever fail
*/
export function dump(value: *): string {
  try {
    const print = require('./print');
    return print(value);
    
  } catch (error) {
    const inspect = require('util').inspect;
    return inspect(value);
    
  }
}

/**
* reads the `package.json` file in the current directory to get the
* package name, falling back to the directory name.
*/
function getName(cwd = process.cwd()) {
  try {
    return JSON.parse(fs.readFileSync('./package.json')).name;
  } catch (error) {
    return path.basename(cwd);
  }
}

export class GulpTasks {
  constructor(gulp, {
    // when true calls {#createTasks} at end of constructor
    createTasks = true,
    
    cwd = process.cwd(),
    
    // name of the package
    name = getName(cwd),
    
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
    
    this.cwd = cwd;
    
    this.name = name;
    
    this.babelExtsStr = `{${ babelExts.join(',') }}`;
    
    this.babelDirs = [
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
    
    this.mochaDirs = [
      {
        name: 'test',
        src: `test/lib/**/*.tests.${ this.babelExtsStr }`,
        watch: [
          `lib/**/*.${ this.babelExtsStr }`,
          `test/lib/**/*.${ this.babelExtsStr }`,
        ],
      },
    ];
    
    if (createTasks) {
      this.createTasks();
    }
  }
  
  // util
  // ====
  
  createTasks() {
    this.createCleanTasks();
    this.createBabelTasks();
    this.createMochaTask();
    
    this.createBabelWatchTasks();
    this.createMochaWatchTasks();
    
    this.gulp.task('watch', ['watch:babel', 'watch:mocha']);
    this.gulp.task('test', ['mocha']);
  }
  
  /**
  * dispatches a notification.
  */
  notify(taskName: TaskName, status: string, message: string): void {
    notifier.notify({
      title: `${ this.name } [${ taskName }] ${ status }`,
      message,
    });
  }
  
  /**
  * dispatches a notification of the error.
  */
  notifyOfError(taskName: TaskName, error: Error): void {
    let message = error.message;
    
    gutil.log(message);
    
    this.notify(taskName, 'ERROR', message);
  }
  
  /**
  * logs an error, including a notification by default.
  */
  logError(
    taskName: TaskName,
    error: Error,
    {
      details,
      notify = true,
    } = {}
  ) /* tcomb plugin bug #129 : void */ {
    gutil.log(`[${ taskName }] ERROR`);
    
    if (error.stack) {
      gutil.log(error.stack.toString());
    } else {
      gutil.log(error.toString());
    }
    
    if (details) {
      let detailsMessage = `\ndetails:\n`;
      if (typeof details === 'string') {
        detailsMessage += details;
      } else {
        detailsMessage += dump(details);
      }
      
      gutil.log(detailsMessage);
    }
    
    if (notify) {
      this.notifyOfError(taskName, error);
    }
  }
  
  clean(taskName: TaskName, dest, callback) {
    exec(`git clean -fdX ${ dest }`, (error, stdout, stderr) => {
      if (error) {
        this.logError(taskName, error);
        
        // let caller know there was a problem if needed
        if (callback) {
          callback(error);
        }
        
      } else {
        // log any outputs
        _.each({stdout, stderr}, (output, name) => {
          if (output) {
            gutil.log(`[${ taskName }]`, `${ name }: \n${ output }`);
          }
        });
        
        // notify the user
        this.notify(taskName, 'CLEANED', dest);
        
        // let caller know we're done here if needed
        if (callback) {
          callback();
        }
      }
    });
  }
  
  /**
  * runs the babel transform stream from a source to a destination.
  * 
  * if `callback` is provided, calls with an error if one occurs or
  * with no arguments when done.
  */
  babel(taskName, src, dest, callback) {
    const onError = (error: Error) => {
      this.logError(taskName, error, {src, dest});
      
      if (callback) {
        callback(error);
      }
    };
    
    this.gulp
      .src(src)
      
      .pipe(babel())
      .on('error', onError)
      
      .pipe(this.gulp.dest(dest))
      .on('error', onError)
      
      .on('end', () => {
        this.notify(taskName, 'COMPILED', `${ src } => ${ dest }`);
        
        if (callback) {
          callback();
        }
      });
  }
  
  mocha(taskName, src, callback) {
    // fucking 'end' gets emitted after error?!
    const onceCallback = _.once(callback);
    
    this.gulp
      .src(src, {read: false})
      .pipe(spawnMocha({growl: true}))
      .on('error', (error) => {
        // mocha takes care of it's own logging and notifs
        if (callback) {
          onceCallback(error);
        }
      })
      .on('end', () => {
        if (callback) {
          onceCallback();
        }
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
    this.cleanTaskNames = _.map(this.babelDirs, (bd) => {
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
    this.babelTaskNames = _.map(this.babelDirs, (bd) => {
      const taskName: TaskName = `babel:${ bd.name }`;
      
      this.gulp.task(taskName, (callback) => {
        this.babel(taskName, bd.src, bd.dest, callback);
      });
      
      return taskName;
    });
    
    this.gulp.task('babel', this.babelTaskNames);
  }
  
  createMochaTask() {
    this.mochaTaskNames = _.map(this.mochaDirs, (md) => {      
      const taskName = `mocha:${ md.name }`;
      
      this.gulp.task(taskName, (callback) => {
        this.mocha(taskName, md.src, callback);
      });
      
      return taskName;
    });
    
    this.gulp.task('mocha', this.mochaTaskNames);
  }
  
  // high level tasks
  // ================
  //
  // tasks that compose the low-level tasks into more useful functionality
  // 
  
  createBabelWatchTasks() {
    this.babelWatchTaskNames = _.map(this.babelDirs, (bd) => {
      const taskName = `watch:babel:${ bd.name }`;
      
      const srcDir = bd.src.split('*')[0];
      
      const log = function(...messages) {
        gutil.log(`[${ taskName }]`, ...messages);
      }
      
      const getSourceAndDest = (filepath) => {
        const srcBase = path.resolve(this.cwd, bd.src.split('*')[0]);
        const relative = path.relative(srcBase, filepath);
        const src = path.relative(this.cwd, filepath);
        const dest = path.relative(
          this.cwd,
          path.resolve(this.cwd, bd.dest, relative)
        );
        
        return {src, dest};
      }
      
      this.gulp.task(taskName, (callback) => {
        gaze(bd.src, (initError, watcher) => {
          if (initError) {
            // there was an error initializing the watcher
            // this is the only time we callback and end the task
            this.logError(taskName, error);
            callback(initError);
            return;
          }
          
          watcher.on('added', (filepath) => {
            const {src, dest} = getSourceAndDest(filepath);
            
            log(`ADDED ${ src }.`);
            
            this.babel(taskName, src, path.dirname(dest));
          });
          
          watcher.on('changed', (filepath) => {
            const {src, dest} = getSourceAndDest(filepath);
            
            log(`MODIFIED ${ src}.`);
            
            this.babel(taskName, src, path.dirname(dest));            
          });
          
          watcher.on('deleted', (filepath) => {
            const {src, dest} = getSourceAndDest(filepath);
            
            log(`REMOVED ${ src }.`);
            
            this.clean(taskName, dest);
          });
          
        }); // gaze
      }); // task
      
      return taskName;
    });
    
    this.gulp.task('watch:babel', this.babelWatchTaskNames);
  }
  
  createMochaWatchTasks() {
    this.mochaWatchTaskNames = _.map(this.mochaDirs, (md) => {
      const taskName = `watch:mocha:${ md.name }`;
      
      const log = function(...messages) {
        gutil.log(`[${ taskName }]`, ...messages);
      }
      
      const scheduler = new Scheduler(
        taskName,
        (onDone) => {
          this.mocha(taskName, md.src, onDone);
        },
        {log},
      );
      
      this.gulp.task(taskName, (callback) => {
        gaze(md.watch, (initError, watcher) => {
          if (initError) {
            // there was an error initializing the watcher
            // this is the only time we callback and end the task
            this.logError(taskName, error);
            callback(initError);
            return;
          }
          
          watcher.on('all', (event, filepath) => {
            log(`CHANGED ${ filepath }.`);
            
            scheduler.schedule();
          });
          
        }); // gaze
      }); // task
      
      return taskName;
    });

    this.gulp.task('watch:mocha', this.mochaWatchTaskNames);
  }
  
}
