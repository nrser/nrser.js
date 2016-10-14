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
import {
  dump,
  getPackageName,
  Pattern,
  hasGlobPattern,
  Scheduler,
} from './util';

import {
  Task,
  BabelTask,
  CleanTask,
  MochaTask,
  LessTask,
  WatchTask,
  WatchBabelTask,
  WatchMochaTask,
  WatchLessTask,
} from './tasks';

// types
import type {
  TaskId,
  TaskName,
  AbsPath,
  AbsDir,
  DoneCallback,
} from './types';

export class Ugh {
  gulp: Object;
  
  packageDir: string;
  packageName: string;
  jsExts: Array<string>;
  babelRelativeDest: string;
  
  /**
  * Task instances by name.
  */
  tasksByName: {[name: TaskName]: Task};
  
  constructor(
    gulp: Object,
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
    
    gulp.task('ugh:tasks', () => {
      gutil.log(dump(this.tasksByName));
    })
  }
  
  // public API
  // ==========
  
  // getting tasks
  // -------------
  
  get tasks(): Array<Task> {
    return _.values(this.tasksByName);
  }
  
  getTasksForType<T>(taskClass: Class<T>): Array<T> {
    return _.filter(this.tasks, (task: Task): boolean => {
      return task instanceof taskClass;
    });
  }
  
  get cleanTasks(): Array<CleanTask> {
    return this.getTasksForType(CleanTask);
  }
  
  get babelTasks(): Array<BabelTask> {
    return this.getTasksForType(BabelTask);
  }
  
  get mochaTasks(): Array<MochaTask> {
    return this.getTasksForType(MochaTask);
  }
  
  get lessTasks(): Array<LessTask> {
    return this.getTasksForType(LessTask);
  }
  
  get watchTasks(): Array<WatchTask> {
    return this.getTasksForType(WatchTask);
  }
  
  get watchBabelTasks(): Array<WatchBabelTask> {
    return this.getTasksForType(WatchBabelTask);
  }
  
  getTaskNamesForType<T>(taskClass: Class<T>): Array<TaskName> {
    return _.map(
      this.getTasksForType(taskClass),
      (task: Task): TaskName => {
        return task.name;
      }
    );
  }
  
  get cleanTaskNames(): Array<TaskName> {
    return this.getTaskNamesForType(CleanTask);
  }
  
  get babelTaskNames(): Array<TaskName> {
    return this.getTaskNamesForType(BabelTask);
  }
  
  get mochaTaskNames(): Array<TaskName> {
    return this.getTaskNamesForType(MochaTask);
  }
  
  get babelTaskNames(): Array<TaskName> {
    return this.getTaskNamesForType(BabelTask);
  }
  
  get watchTaskNames(): Array<TaskName> {
    return this.getTaskNamesForType(WatchTask);
  }
  
  get watchBabelTaskNames(): Array<TaskName> {
    return this.getTaskNamesForType(WatchBabelTask);
  }
  
  get watchMochaTaskNames(): Array<TaskName> {
    return this.getTaskNamesForType(WatchMochaTask);
  }
  
  get watchLessTaskNames(): Array<TaskName> {
    return this.getTaskNamesForType(WatchLessTask);
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
    src: string | Pattern,
    dest?: string,
    clean?: boolean,
    watch?: boolean,
  }): void {
    if (typeof dest === 'undefined') {
      dest = this.relative(src, this.babelRelativeDest);
    }
    
    const task = new BabelTask({
      id,
      src: this.toJSPattern(src),
      dest: this.resolveDir(dest),
    });
    
    this.gulp.task(task.name, (onDone) => {
      this.doBabel(task.name, task.src, task.dest)
    });
    
    this.tasksByName[task.name] = task;
    this.gulp.task('babel', this.babelTaskNames);
    
    if (clean) {
      this.clean(task);
    }
    
    if (watch) {
      this.watchBabel(task);
    }
  }
  
  /**
  * creates a task to watch babel sources and compile them.
  * 
  * also re-defines:
  * 
  * -   `watch:babel` task to invoke all WatchBabelTask instances.
  * -   `watch` task to invoke all WatchTask instance.
  */
  watchBabel({
    id,
    src,
    dest, // flow doesn't like = this.relative(src, this.babelRelativeDest),
  } : {
    id: TaskId,
    src: string | Pattern,
    dest?: string,
  }): void {
    // if we didn't get a dest, resolve to relative of the src
    if (dest === undefined) {
      dest = this.relative(src, this.babelRelativeDest);
    }
    
    const task = new WatchBabelTask({
      id,
      src: this.toJSPattern(src),
      dest: this.resolveDir(dest),
    });
    
    /**
    * log some shit under the package and task name
    */
    const log = (...messages) => {
      gutil.log(`${ this.packageName } [${ task.name }]`, ...messages);
    }
    
    this.gulp.task(task.name, (callback: DoneCallback) => {
      task.watcher = gaze(
        task.src.path,
        (initError: ?Error, watcher: gaze.Gaze) => {
          if (initError) {
            // there was an error initializing the gazeInstance
            // this is the only time we callback and end the task
            this.logError(task.name, initError);
            callback(initError);
            return;
          } else {
            log(`initialized, watching ${ this.relative(task.src.path) }...`);
          }
          
          _.each(['added', 'changed'], (eventName: string): void => {
            watcher.on(eventName, (filepath: string): void => {
              // the src should be the filepath but with the same base the `src`
              // that got passed in so that gulp gets the file to the right
              // destination
              const src = new Pattern({
                pattern: path.relative(task.src.base, filepath),
                base: task.src.base,
              });
              
              log(`${ eventName.toUpperCase() } ${ filepath }.`);
              
              this.doBabel(task.name, src, task.dest);
            });
          });
          
          watcher.on('deleted', (filepath) => {
            // we need to find the relative path from the base of the task's src
            const relToPatternBase: string = path.relative(
              task.src.base,
              filepath
            );
            
            // then we can construct the destination path
            const dest = path.join(task.dest, relToPatternBase);
            
            log(`DELETED ${ filepath }.`);
            
            this.doClean(task.name, dest);
          });
          
        }
      ); // gaze
    }); // task
    
    this.tasksByName[task.name] = task;
    
    // re-define watch:babel to run all the WatchBabel tasks
    this.gulp.task('watch:babel', this.watchBabelTaskNames);
    
    // re-define watch to run all the Watch tasks
    this.gulp.task('watch', this.watchTaskNames);
  }
  
  /**
  * creates a mocha task to run mocha and a watch task that watches
  * all the babel destinations and runs when they change.
  */
  mocha({
    id,
    tests,
    watch,
  }: {
    id: TaskId,
    tests: string | Pattern,
    watch?: false | string | Pattern | Array<string|Pattern>,
  }): void {
    const task = new MochaTask({
      id,
      tests: this.toTestsPattern(tests)}
    );
    
    this.gulp.task(task.name, (callback: DoneCallback) => {
      this.doMocha(task.name, task.tests, callback);
    });
    
    this.tasksByName[task.name] = task;
    
    this.gulp.task('mocha', this.mochaTaskNames);
    
    // create a watch task unless `watch` is false
    if (watch !== false) {      
      this.watchMocha({
        id,
        tests,
        watch,
      });
    }
  }
  
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
  watchMocha({
    id,
    tests,
    watch,
  }: {  
    id: TaskId,
    tests: string | Pattern,
    watch?: string | Pattern | Array<string|Pattern>,
  }) {
    // resolve / default watch patterns
    let watchPatterns: Array<Pattern>;
    
    if (watch === undefined) {
      // default to all the babel destinations
      watchPatterns = _.map(
        this.babelTasks,
        (babelTask: BabelTask): Pattern => {
          return this.toJSPattern(babelTask.dest);
        });
        
    } else {
      if (!Array.isArray(watch)) {
        watch = [watch];
      }
      
      // map those into JS patterns
      watchPatterns = _.map(watch, this.toJSPattern.bind(this));
    }
    
    const task = new WatchMochaTask({
      id,
      tests: this.toTestsPattern(tests),
      watch: watchPatterns,
    });
      
    const log = function(...messages) {
      gutil.log(`[${ task.name }]`, ...messages);
    }
      
    const scheduler = new Scheduler(
      task.name,
      (onDone: DoneCallback) => {
        this.doMocha(task.name, task.tests, onDone);
      },
      {log},
    );
    
    this.gulp.task(task.name, [`mocha:${ task.id }`], (callback) => {
      task.watcher = gaze(
        _.map(task.watch, pattern => pattern.path),
        
        (initError: ?Error, watcher: gaze.Gaze) => {
          if (initError) {
            // there was an error initializing the gazeInstance
            // this is the only time we callback and end the task
            this.logError(task.name, initError);
            callback(initError);
            return;
          }
          
          watcher.on('all', (event, filepath) => {
            const rel = this.relative(filepath);
            
            log(`${ event } ${ rel }.`);
            
            scheduler.schedule();
          });
          
        }
      ); // gaze
      
      // kick off
      this.log(task.name, "kicking off mocha...");
    }); // task
    
    // add the task to the instance
    this.tasksByName[task.name] = task;
    
    // re-define the watch:mocha task to invoke 'watch:mocha:*'
    this.gulp.task('watch:mocha', this.watchMochaTaskNames);
    
    // re-define watch to run all the Watch tasks
    this.gulp.task('watch', this.watchTaskNames);
  }
  
  /**
  * auto-create tasks depending on what's present
  */
  autoTasks() {
    // add a build and watch task for `./src` if it's a directory
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
      this.mocha({
        id: 'test',
        tests: this.relative('test', 'src', this.babelRelativeDest),
      });
    }
  }
  
  // private API
  // ===========
  
  // util
  // ----
  
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
  * log to gulp-util.log with the package name and task name.
  */
  log(taskName: TaskName, ...messages: Array<*>): void {
    gutil.log(`${ this.packageName } [${ taskName }]`, ...messages);
  }
  
  logger(taskName: TaskName): (...message: Array<*>) => void {
    return (...messages: Array<*>): void => {
      this.log(taskName, ...message);
    };
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
    const log = this.logger(taskName);
    
    log('ERROR');
    
    if (error.stack) {
      log(error.stack.toString());
    } else {
      log(error.toString());
    }
    
    if (details) {
      let detailsMessage = `\ndetails:\n`;
      if (typeof details === 'string') {
        detailsMessage += details;
      } else {
        detailsMessage += dump(details);
      }
      
      log(detailsMessage);
    }
    
    if (notify) {
      this.notifyOfError(taskName, error);
    }
  }
  
  /**
  * resolve path against the package dir.
  */
  resolve(...segments: Array<string|Pattern>): AbsPath { 
    return path.resolve(
      this.packageDir,
      ..._.map(segments, segment => (
        segment instanceof Pattern ? segment.base : segment
      ))
    );
  }
  
  resolveDir(...segments: Array<string|Pattern>): AbsDir {
    const resolved = this.resolve(...segments);
    
    fs.ensureDirSync(resolved);
    
    return resolved;
  }
  
  /**
  * resolve a path against the package dir and return it's representation
  * relative to there.
  */
  relative(...segments: Array<string|Pattern>): string {
    return path.relative(this.packageDir, this.resolve(...segments));
  }
  
  /**
  * takes a sources argument, which may be a string path, 
  */
  toPattern(input: string | Pattern, defaultPattern: string): Pattern {
    if (input instanceof Pattern) {
      return input;
    }
    
    if (hasGlobPattern(input)) {
      return new Pattern.fromPath(input);
      
    } else {
      return new Pattern({
        pattern: defaultPattern,
        base: this.resolveDir(input),
      });
      
    }
  }
  
  /**
  * gets a Pattern instance to find js files.
  */
  toJSPattern(input: string | Pattern): Pattern {
    return this.toPattern(input, `**/*.${ this.jsExtsPattern }`);
  }
  
  /**
  * get a Pattern instance to find test files.
  */
  toTestsPattern(input: string | Pattern): Pattern {
    return this.toPattern(input, `**/*.test?(s).${ this.jsExtsPattern }`);
  }
  
  // do stuff
  // --------
  
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
        this.notify(taskName, 'CLEANED', this.relative(dest));
        
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
  doBabel(
    taskName: TaskName,
    src: Pattern,
    dest: AbsDir,
    callback?: DoneCallback,
  ) {
    const onError = (error: Error) => {
      this.logError(taskName, error, {src, dest});
      
      if (callback) {
        callback(error);
      }
    };
    
    this.gulp
      .src(src.path, {base: src.base})
      
      .pipe(babel())
      .on('error', onError)
      
      .pipe(this.gulp.dest(dest))
      .on('error', onError)
      
      .on('end', () => {
        this.notify(
          taskName,
          'COMPILED',
          `${ this.relative(src.path) } => ${ this.relative(dest) }`
        );
        
        if (callback) {
          callback();
        }
      });
  }
    
  doMocha(
    taskName: TaskName,
    tests: Pattern,
    callback?: DoneCallback,
  ) {
    this.log(taskName, `doing mocha`, {tests});
    
    // fucking 'end' gets emitted after error?!
    const onceCallback = _.once(callback);
    
    this.gulp
      .src(tests.path, {read: false})
      .pipe(spawnMocha({growl: true, reporter: 'min'}))
      .on('error', (error) => {
        // mocha takes care of it's own logging and notifs
        this.logError(taskName, error);
        
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
  
} // Ugh
