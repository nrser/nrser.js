// @flow

// system
import util from 'util';
import { exec } from 'child_process';

// deps
import babel from 'gulp-babel';
import notifier from 'node-notifier';
import path from 'path';
import spawnMocha from 'gulp-spawn-mocha';
import gutil from 'gulp-util';
import _ from 'lodash';
import glob from 'glob';
import debug from 'gulp-debug';
import t from 'tcomb';
import gaze from 'gaze';

// package
import fs from '../fs';
import * as errors from '../errors';
import { squish } from '../string';
import { dump, getPackageName, Src, hasGlobPatterns } from './util';
// import { Src } from './util/Src';
import {
  Task,
  BabelTask,
  CleanTask,
  WatchTask,
  WatchBabelTask,
} from './tasks';

// types
import type {
  TaskId,
  TaskName,
  AbsPath,
  DoneCallback,
  GulpType,
} from './types';

export class Ugh {
  gulp: GulpType;
  
  packageDir: string;
  packageName: string;
  jsExts: Array<string>;
  babelRelativeDest: string;
  
  /**
  * Task instances by name.
  */
  tasksByName: {[name: TaskName]: Task};
  
  constructor(
    gulp: *,
    {
      // the current working directory to base off
      // this defaults to the cwd that the script is invoked from, though 
      // you might want to change it for testing at least and maybe for 
      // including tasks from submodules.
      packageDir = process.cwd(),
      
      // name of the package, used in notifs so you can tell where they're
      // coming from
      packageName = getPackageName(packageDir),
      
      // javascript extensions to build / watch
      jsExts = ['js', 'jsx', 'es', 'es6'],
      
      // default destination for babel builds relative to the source dir
      babelRelativeDest = '../lib',
    }: {
      packageDir?: string,
      
      packageName?: string,
      
      jsExts?: Array<string>,
      
      babelRelativeDest?: string,
    } = {}
  ) {
    this.gulp = gulp;
    
    this.packageDir = packageDir;
    
    this.packageName = packageName;
    
    this.jsExts = jsExts;
    
    this.babelRelativeDest = babelRelativeDest;
    
    this.tasksByName = {};
  }
  
  // public API
  // ==========
  
  // getting tasks
  // -------------
  
  get tasks(): Array<Task> {
    return _.values(this.tasksByName);
  }
  
  get babelTasks(): Array<BabelTask> {
    return _.filter(this.tasks, (task: Task): boolean => {
      return task instanceof BabelTask;
    });
  }
  
  get babelTaskNames(): Array<TaskName> {
    return _.map(this.babelTasks, (task: BabelTask): TaskName => {
      return task.name;
    });
  }
  
  get cleanTasks(): Array<CleanTask> {
    return _.filter(this.tasks, (task: Task): boolean => {
      return task instanceof CleanTask;
    });
  }
  
  get cleanTaskNames(): Array<TaskName> {
    return _.map(this.cleanTasks, (task: CleanTask): TaskName => {
      return task.name;
    });
  }
  
  get watchTasks(): Array<WatchTask> {
    return _.filter(this.tasks, (task: Task): boolean => {
      return task instanceof WatchTask;
    });
  }
  
  get watchTaskNames(): Array<TaskName> {
    return _.map(this.watchTasks, (task: WatchTask): TaskName => {
      return task.name;
    });
  }
  
  get watchBabelTasks(): Array<WatchBabelTask> {
    return _.filter(this.tasks, (task: Task): boolean => {
      return task instanceof WatchBabelTask;
    });
  }
  
  get watchBabelTaskNames(): Array<TaskName> {
    return _.map(this.watchBabelTasks, (task: WatchBabelTask): TaskName => {
      return task.name;
    });
  }
  
  /**
  * create a clean task with the provided name that cleans the dest directory.
  * 
  * adds that task name to `this.taskNames.clean` and overwrites the general
  * `clean` task to invoke all of the clean tasks.
  */
  clean({
    id,
    dest,
  }: {
    id: TaskId,
    dest: string,
  }): void {
    const task = new CleanTask({id, dest});
    
    this.gulp.task(task.name, (callback) => {
      this.doClean(task.name, task.dest, callback);
    });
    
    this.tasksByName[task.name] = task;
    
    this.gulp.task('clean', this.cleanTaskNames);
  }
  
  /**
  * create a babel:<name> task to build the source and associated clean and
  * watch tasks (unless told not to). also overwrites the general `babel` task
  * to invoke all of them.
  */
  babel({
    id,
    src,
    dest, // flow doesn't like = this.relative(src, this.babelRelativeDest),
    clean = true,
    watch = true,
  }: {
    id: string,
    src: string | Src,
    dest?: string,
    clean?: boolean,
    watch?: boolean,
  }): void {
    if (typeof dest === 'undefined') {
      dest = this.relative(src, this.babelRelativeDest);
    }
    
    const task = new BabelTask({
      id,
      src: this.toBabelSrc(src),
      dest: dest,
    });
    
    this.gulp.task(task.name, (onDone) => {
      this.doBabel(task.name, task.src, task.dest)
    });
    
    this.tasksByName[task.name] = task;
    
    if (clean) {
      this.clean(task);
    }
    
    if (watch) {
      this.watchBabel(task);
    }
    
    this.gulp.task('babel', this.babelTaskNames);
  }
  
  /**
  * creates a task to watch babel sources and compile them. also updated the
  * general 'watch:babel' task to invoke all 'watch:babel:*' tasks.
  */
  watchBabel({
    id,
    src,
    dest, // flow doesn't like = this.relative(src, this.babelRelativeDest),
  } : {
    id: TaskId,
    src: string | Src,
    dest?: string,
  }): void {
    if (typeof dest === 'undefined') {
      dest = this.relative(src, this.babelRelativeDest);
    }
    
    const task = new WatchBabelTask({
      id,
      src: this.toBabelSrc(src),
      dest: this.resolve(dest),
    });
    
    /**
    * log some shit under the package and task name
    */
    const log = (...messages) => {
      gutil.log(`${ this.packageName } [${ task.name }]`, ...messages);
    }
    
    /**
    * returns the `[eventName, handler]` values to handle events that should
    * trigger a build (added and changed).
    */
    const buildHandler = (eventName: string) => {
      return [
        eventName,
        (filepath: string): void => {
          // the src should be the filepath but with the same base the `src`
          // that got passed in so that gulp gets the file to the right
          // destination
          const src = new Src(filepath, task.src.base);
          
          log(`${ eventName.toUpperCase() } ${ filepath }.`);
          
          this.doBabel(task.name, src, task.dest);
        }
      ];
    }
    
    this.gulp.task(task.name, (callback) => {
      task.watcher = gaze(
        task.src.pattern,
        (initError: ?Error, watcher: gaze.Gaze) => {
          if (initError) {
            // there was an error initializing the gazeInstance
            // this is the only time we callback and end the task
            this.logError(task.name, initError);
            callback(initError);
            return;
          } else {
            log(`initialized, watching ${ task.src.pattern }...`);
          }
          
          watcher.on(...buildHandler('added'));
          watcher.on(...buildHandler('changed'));
          
          watcher.on('deleted', (filepath) => {
            // we need to find the relative path from the base of the task's src
            const relToSrcBase: string = path.relative(
              task.src.base,
              filepath
            );
            
            // then we can construct the destination path
            const dest = path.join(task.dest, relToSrcBase);
            
            log(`DELETED ${ filepath }.`);
            
            this.doClean(task.name, dest);
          });
          
        }
      ); // gaze
    }); // task
    
    this.tasksByName[task.name] = task;
    
    this.gulp.task('watch:babel', this.watchBabelTaskNames);
  }
  
  /**
  * create a mocha task.
  */
  // mocha({
  //   id,
  //   src,
  // }: {
  //   id: TaskId,
  //   src: string | Src,
  // }): void {
  //   const taskName: TaskName = `mocha:${ id }`;
  //   
  //   this.gulp.task(taskName, (callback) => {
  //     this.doMocha(taskName, src, callback);
  //   });
  //   
  //   this.gulp.task('mocha', Array.from(this.taskNames.mocha));
  // }
  
  /**
  * create a task to watch compiled code for changes and run tests.
  * 
  * this works when compilation is being done *incrementally* - since each
  * source file is processed individually when it changes and if compilation 
  * fails the destination directory is not changed the gazeInstance is not
  * triggered unless compilation succeeded or we removed a file, which is
  * what we want (i think).
  * 
  * uses a scheduler to wait a little to catch multiple changes in one 
  * pass (hopefully saving multiple files at once / really close to each other)
  * to avoid over-running of mocha. also avoids running mocha over it's self
  * if another change event comes in during the run.
  */
  // watchMocha({id, tests, watch}: {  
  //   id: TaskId,
  //   tests: Src,
  //   watch: string | Src | Array<string> | Array<Src>,
  // }) {
  //   const taskName = watchMochaTaskName(id);
  //     
  //   const log = function(...messages) {
  //     gutil.log(`[${ taskName }]`, ...messages);
  //   }
  //     
  //   const scheduler = new Scheduler(
  //     taskName,
  //     (onDone) => {
  //       this.doMocha(taskName, tests, onDone);
  //     },
  //     {log},
  //   );
  //   
  //   this.gulp.task(taskName, (callback) => {
  //     gaze(md.watch, (initError, gazeInstance) => {
  //       if (initError) {
  //         // there was an error initializing the gazeInstance
  //         // this is the only time we callback and end the task
  //         this.logError(taskName, error);
  //         callback(initError);
  //         return;
  //       }
  //       
  //       gazeInstance.on('all', (event, filepath) => {
  //         const rel = this.relative(filepath);
  //         
  //         log(`CHANGED ${ rel }.`);
  //         
  //         scheduler.schedule();
  //       });
  //       
  //     }); // gaze
  //   }); // task
  //   
  //   this.taskNames.watch.mocha.add(taskName);
  // 
  //   this.gulp.task('watch:mocha', Array.from(this.taskNames.watch.mocha));
  // }
  
  /**
  * auto-create tasks depending on what's present
  */
  autoTasks() {
    // add a build and watch task for `./src` if it's a directory
    console.log(this.resolve('src'));
    
    if (fs.isDirSync(this.resolve('src'))) {
      this.babel({
        id: 'src',
        src: 'src'
      });
    }
    
    // add a build and watch for the './test' if it's a directory
    if (fs.isDirSync(this.resolve('test', 'src'))) {
      this.babel({
        id: 'test',
        src: 'test/src'
      });
    }
    
    if (fs.isDirSync(this.resolve('test'))) {
      // this.mocha();
    }
  }
  
  // private API
  // ===========
  
  // util
  // ----
  
  // createTasks() {
  //   this.createCleanTasks();
  //   this.createBabelTasks();
  //   this.createMochaTasks();
  //   
  //   this.createBabelWatchTasks();
  //   this.createMochaWatchTasks();
  //   
  //   this.gulp.task('watch', ['watch:babel', 'watch:mocha']);
  //   this.gulp.task('test', ['mocha']);
  // }
  
  /**
  * the glob pattern for `this.jsExts`, like "{js,jsx,es,es6}".
  * implemented as a getter so that it always reflects the property value.
  */
  get jsExtsPattern(): string {
    return `{${ this.jsExts.join(',') }}`;
  }
  
  /**
  * dispatches a notification.
  */
  notify(taskName: TaskName, status: string, message: string): void {
    notifier.notify({
      title: `${ this.packageName } [${ taskName }] ${ status }`,
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
  * logs an error to the console, including a notification by default.
  */
  logError(
    taskName: TaskName,
    error: Error,
    {
      details,
      notify = true,
    }: {
      details?: *,
      notify?: boolean,
    } = {}
  ): void {
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
  
  /**
  * resolve path against the package dir.
  */
  resolve(...segments: Array<string|Src>): AbsPath { 
    return path.resolve(
      this.packageDir,
      ..._.map(segments, segment => (
        segment instanceof Src ? segment.base : segment
      ))
    );
  }
  
  /**
  * resolve a path against the package dir and return it's representation
  * relative to there.
  */
  relative(...segments: Array<string|Src>): string {
    return path.relative(this.packageDir, this.resolve(...segments));
  }
  
  // clean
  // -----
  
  doClean(taskName: TaskName, dest: string, callback: ?DoneCallback) {
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
  
  // babel
  // -----
  
  /**
  * gets a Src suitable for babel tasks.
  * 
  * input can be:
  * 
  * 1.  just a directory to use as the base. the glob pattern will be
  *     added.
  * 2.  a glob string to match files.
  * 3.  already be a Src, in which case it's just returned.
  */
  toBabelSrc(input: string | Src): Src {
    if (input instanceof Src) {
      return input;
    }
    
    if (!hasGlobPatterns(input)) {
      input = path.join(input, `**/*.${ this.jsExtsPattern }`);
    }
    
    return new Src(this.resolve(input));
  }
  
  /**
  * runs the babel transform stream from a source to a destination.
  * 
  * if `callback` is provided, calls with an error if one occurs or
  * with no arguments when done.
  */
  doBabel(
    taskName: TaskName,
    src: Src,
    dest: string,
    callback: ?DoneCallback,
  ) {
    const onError = (error: Error) => {
      this.logError(taskName, error, {src, dest});
      
      if (callback) {
        callback(error);
      }
    };
    
    this.gulp
      .src(src.pattern, {base: src.base})
      
      .pipe(babel())
      .on('error', onError)
      
      .pipe(this.gulp.dest(dest))
      .on('error', onError)
      
      .on('end', () => {
        this.notify(taskName, 'COMPILED', `${ src.pattern } => ${ dest }`);
        
        if (callback) {
          callback();
        }
      });
  }
  
  // mocha
  // -----
  
  // doMocha(
  //   taskName: string,
  //   src: Src,
  //   callback: (error?: Error) => void
  // ) {
  //   // fucking 'end' gets emitted after error?!
  //   const onceCallback = _.once(callback);
  //   
  //   this.gulp
  //     .src(src, {read: false})
  //     .pipe(spawnMocha({growl: true}))
  //     .on('error', (error) => {
  //       // mocha takes care of it's own logging and notifs
  //       this.logError(taskName, error);
  //       
  //       if (callback) {
  //         onceCallback(error);
  //       }
  //     })
  //     .on('end', () => {
  //       if (callback) {
  //         onceCallback();
  //       }
  //     });
  // }
  
}
