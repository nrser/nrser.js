// @flow

// system
import util from 'util';
import { exec } from 'child_process';
import os from 'os';

// deps
// ====

// nrser deps used
import _ from 'lodash';
import t from 'tcomb';

// ugh-specific deps that need to be co-installed
// 
// NOTE gulp itself is missing since we pass it in from the gulpfile so we
//      add tasks to the same instance .
//
import notifier from 'node-notifier';
import gutil from 'gulp-util';
import glob from 'glob';
import gaze from 'gaze';

// package
import '../metalogger';
import fs from '../fs';
import * as path from '../path';
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

/**
* something that can be used to create a single Pattern.
*/
type Patternable = string | Pattern | {base: string, pattern: string};

/**
* something that can be used to create an array of Patterns.
*/
type Patternables = Patternable | Array<Patternable>;

export class Ugh {
  _gulp: ?Object;
  
  packageDir: AbsPath;
  packageName: string;
  jsExts: Array<string>;
  babelRelativeDest: string;
  
  /**
  * Task instances by name.
  */
  tasksByName: {[name: TaskName]: Task};
  
  constructor(
    // gulp: Object,
    {
      // the current working directory to base off
      // this defaults to the cwd that the script is invoked from, though 
      // you might want to change it for testing at least and maybe for 
      // including tasks from submodules.
      // packageDir = process.cwd(),
      packageDir,
      
      // name of the package, used in notifs so you can tell where they're
      // coming from
      packageName = getPackageName(packageDir),
      
      // javascript extensions to build / watch
      jsExts = ['js', 'jsx', 'es', 'es6'],
      
      // default destination for babel builds relative to the source dir
      babelRelativeDest = '../lib',
    }: {
      // packageDir?: string,
      packageDir: AbsPath,
      
      packageName?: string,
      
      jsExts?: Array<string>,
      
      babelRelativeDest?: string,
    } = {}
  ) {
    this.packageDir = packageDir;
    
    this.packageName = packageName;
    
    this.jsExts = jsExts;
    
    this.babelRelativeDest = babelRelativeDest;
    
    this.tasksByName = {};
  }
  
  // public API
  // =========================================================================
  
  get gulp(): Object {
    if (this._gulp === undefined) {
      throw new errors.StateError(`gulp not set`);
    }
    
    return this._gulp;
  }
  
  createGulpTasks(gulp: Object, namespace?: string): void {
    // if (this._gulp !== undefined) {
    //   throw new errors.StateError(`gulp already set`);
    // }
    
    this._gulp = gulp;
    
    const namespaced = (name: TaskName): TaskName => {
      if (namespace) {
        return `${ namespace }:${ name }`;
      } else {
        return name;
      }
    }
    
    this.gulp.task(namespaced('ugh:tasks'), () => {
      this.log('ugh:tasks', dump(this.tasksByName));
    });
    
    _.each(
      [
        this.cleanTasks,
        this.babelTasks,
        this.watchBabelTasks,
        this.mochaTasks,
        this.watchMochaTasks,
        this.lessTasks,
        this.watchLessTasks,
      ],
      (tasks: Array<Task>): void => {
        _.each(tasks, (task: Task): void => {
          this.gulp.task(namespaced(task.name), task.run.bind(task));
        });
      }
    );
    
    _.each(
      {
        clean: this.cleanTaskNames,
        babel: this.babelTaskNames,
        'watch:babel': this.watchBabelTaskNames,
        mocha: this.mochaTaskNames,
        'watch:mocha': this.watchMochaTaskNames,
        less: this.lessTaskNames,
        'watch:less': this.watchLessTaskNames,
        watch: this.watchTaskNames,
      },
      (deps: Array<TaskName>, name: TaskName): void => {
        this.gulp.task(namespaced(name), deps);
      }
    );
  }
  
  // getting tasks
  // -------------------------------------------------------------------------
  
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
  
  get watchMochaTasks(): Array<WatchMochaTask> {
    return this.getTasksForType(WatchMochaTask);
  }
  
  get watchLessTasks(): Array<WatchLessTask> {
    return this.getTasksForType(WatchLessTask);
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
  
  get lessTaskNames(): Array<TaskName> {
    return this.getTaskNamesForType(LessTask);
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
  
  // creating tasks
  // -------------------------------------------------------------------------
  
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
  }): CleanTask {
    const task = new CleanTask({ugh: this, id, dest});
    
    // this.gulp.task(task.name, task.run.bind(task));
    
    this.tasksByName[task.name] = task;
    
    // this.gulp.task('clean', this.cleanTaskNames);
    
    return task;
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
    src: Patternable,
    dest?: string,
    clean?: boolean,
    watch?: boolean,
  }): BabelTask {
    // if we didn't get a dest, resolve to relative of the src
    if (dest === undefined) {
      dest = this.relative(src, this.babelRelativeDest);
    }
    
    const task = new BabelTask({
      ugh: this,
      id,
      src: this.toJSPattern(src),
      dest: this.resolveDir(dest),
    });
    
    // this.gulp.task(task.name, task.run.bind(task));
    
    this.tasksByName[task.name] = task;
    
    // this.gulp.task('babel', this.babelTaskNames);
    
    if (clean) {
      task.cleanTask = this.clean({
        id: task.name,
        dest: task.dest,
      });
    }
    
    if (watch) {
      this.watchBabel(task);
    }
    
    return task;
  }
  
  /**
  * creates a task to watch babel sources and compile them.
  * 
  * also re-defines:
  * 
  * -   `watch:babel` task to invoke all WatchBabelTask instances.
  * -   `watch` task to invoke all WatchTask instance.
  */
  watchBabel(babelTask: BabelTask): WatchBabelTask {
    const task = new WatchBabelTask({
      ugh: this,
      babelTask,
    });
      
    // this.gulp.task(task.name, task.start.bind(task));
    
    this.tasksByName[task.name] = task;
    
    // re-define watch:babel to run all the WatchBabelTask
    // this.gulp.task('watch:babel', this.watchBabelTaskNames);
    
    // re-define watch to run all the Watch tasks
    // this.gulp.task('watch', this.watchTaskNames);
    
    return task;
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
    tests: Patternable,
    watch?: false | Patternables,
  }): MochaTask {
    const task = new MochaTask({
      ugh: this,
      id,
      tests: this.toTestsPattern(tests)}
    );
    
    // this.gulp.task(task.name, task.run.bind(task));
    
    this.tasksByName[task.name] = task;
    
    // this.gulp.task('mocha', this.mochaTaskNames);
    
    // create a watch task unless `watch` is false
    if (watch !== false) {      
      this.watchMocha(task, watch);
    }
    
    return task;
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
  watchMocha(mochaTask: MochaTask, watch?: Patternables): WatchMochaTask {
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
      ugh: this,
      mochaTask,
      watch: watchPatterns,
    });
    
    // this.gulp.task(task.name, task.start.bind(task));
    
    // add the task to the instance
    this.tasksByName[task.name] = task;
    
    // re-define the watch:mocha task to invoke 'watch:mocha:*'
    // this.gulp.task('watch:mocha', this.watchMochaTaskNames);
    
    // re-define watch to run all the Watch tasks
    // this.gulp.task('watch', this.watchTaskNames);
    
    return task;
  }
  
  /**
  * create a less task and optional watch task.
  */
  less({
    id,
    src,
    dest,
    clean = true,
    watch,
  } : {
    id: TaskId,
    src: Patternable,
    dest: string,
    clean?: boolean,
    watch?: false | Patternables,
  }): LessTask {
    const task = new LessTask({
      ugh: this,
      id,
      src: this.toLessPattern(src),
      dest: this.resolve(dest),
    });
    
    // this.gulp.task(task.name, task.run.bind(task));
    
    this.tasksByName[task.name] = task;
    
    // this.gulp.task('less', this.lessTaskNames);
    
    if (clean) {
      task.cleanTask = this.clean({
        id: task.name,
        dest: task.dest,
      });
    }
    
    if (watch !== false) {
      this.watchLess(task, watch);
    }
    
    return task;
  }
  
  /**
  * create a task to watch less files and incrementally build.
  */
  watchLess(lessTask: LessTask, watch?: Patternables): WatchLessTask {
    let watchPatterns: Array<Pattern>;
    
    if (watch === undefined) {
      // default to the src
      watchPatterns = [lessTask.src];
      
    } else {
      // otherwise make them using {#toLessPattern}
      
      if (!Array.isArray(watch)) {
        watch = [watch];
      }
      
      watchPatterns = _.map(watch, this.toLessPattern.bind(this));
    }
    
    const task = new WatchLessTask({
      ugh: this,
      lessTask: lessTask,
      watch: watchPatterns,
    });
    
    // this.gulp.task(task.name, task.start.bind(task));
    
    this.tasksByName[task.name] = task;
    
    // re-define watch:less to run all the WatchLessTask
    // this.gulp.task('watch:less', this.watchLessTaskNames);
    
    // re-define watch to run all the Watch tasks
    // this.gulp.task('watch', this.watchTaskNames);
    
    return task;
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
  // =========================================================================
  
  // util
  // -------------------------------------------------------------------------
  
  /**
  * the glob pattern for `this.jsExts`, like "{js,jsx,es,es6}".
  * implemented as a getter so that it always reflects the property value.
  */
  get jsExtsPattern(): string {
    return `{${ this.jsExts.join(',') }}`;
  }
  
  // logging and notifications
  // -------------------------------------------------------------------------
  
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
    
    this.log(taskName, message);
    
    this.notify(taskName, 'ERROR', message);
  }
  
  /**
  * log to gulp-util.log with the package name and task name.
  */
  log(taskName: TaskName, ...messages: Array<*>): void {
    gutil.log(
      `${ this.packageName } [${ taskName }]`,
      ..._.map(messages, (message: *): string => {
        if (typeof message === 'string') {
          return message;
        } else {
          return dump(message);
        }
      })
    );
  }
  
  /**
  * get a log function bound to a task name.
  */
  logger(taskName: TaskName): (...messages: Array<*>) => void {
    return (...messages: Array<*>): void => {
      this.log(taskName, ...messages);
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
  
  // paths
  // -------------------------------------------------------------------------
  
  /**
  * resolve path against the package dir.
  */
  resolve(...segments: Array<Patternable>): AbsPath { 
    return path.resolve(
      this.packageDir,
      ..._.map(segments, (segment: Patternable): string => {
        if (typeof segment === 'string') {
          return segment;
        } else if (segment instanceof Pattern) {
          return segment.base;
        } else if (typeof segment === 'object' && segment.base ) {
          return segment.base;
        } else {
          throw new TypeError(`bad segment: ${ dump(segment) }`);
        }
      })
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
  relative(...segments: Array<Patternable>): string {
    return path.relative(this.packageDir, this.resolve(...segments));
  }
  
  // patterns
  // -------------------------------------------------------------------------
  
  /**
  * takes a sources argument, which may be a string path, 
  */
  toPattern(input: Patternable, defaultPattern?: string): Pattern {
    if (input instanceof Pattern) {
      return input;
    }
    
    if (typeof input === 'object') {
      return new Pattern({
        base: this.resolveDir(input.base),
        pattern: input.pattern,
      });
    }
    
    if (hasGlobPattern(input)) {
      return new Pattern.fromPath(this.resolve(input));
      
    } else {
      if (defaultPattern === undefined) {
        throw new TypeError(squish`
          defaultPattern must be supplied if a string with no glob pattern is
          passed.
        `);
      }
      
      return new Pattern({
        pattern: defaultPattern,
        base: this.resolveDir(input),
      });
      
    }
  }
  
  /**
  * gets a Pattern instance to find js files.
  */
  toJSPattern(input: Patternable): Pattern {
    return this.toPattern(input, `**/*.${ this.jsExtsPattern }`);
  }
  
  /**
  * get a Pattern instance to find test files.
  */
  toTestsPattern(input: Patternable): Pattern {
    return this.toPattern(input, `**/*.test?(s).${ this.jsExtsPattern }`);
  }
  
  toLessPattern(input: Patternable): Pattern {
    return this.toPattern(input, '**/*.less');
  }
  
  // actions
  // -------------------------------------------------------------------------
  
  runCleanPipeline(
    taskName: TaskName,
    dest: string,
    callback: ?DoneCallback
  ): void {
    const log = this.logger(taskName);
    
    // for `git clean` to work the way we want it - removing all files from
    // a directory that are ignored by git - even if that directory has
    // checked-in files in it, we want it to end with a slash
    if (fs.isDirSync(dest)) {
      if (!dest.endsWith('/')) {
        dest += '/';
      }
    }
    
    let relDest = this.relative(dest);
    
    const cmd = `git clean -fdX ${ relDest }`;
    
    log("cleaning", {dest, relDest, cmd});
    
    exec(cmd, {cwd: this.packageDir}, (error, stdout, stderr) => {
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
            log(`${ name }: \n${ output }`);
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
  * runs the babel gulp pipeline.
  * 
  * if `onDone` is provided, calls with an error if one occurs or
  * with no arguments when done.
  */
  runBabelPipeline(
    taskName: TaskName,
    src: Pattern,
    dest: AbsDir,
    onDone?: DoneCallback,
  ): void {
    const babel = require('gulp-babel');
    
    const onError = (error: Error) => {
      this.logError(taskName, error, {src, dest});
      
      if (onDone) {
        onDone(error);
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
        
        if (onDone) {
          onDone();
        }
      });
  }
  
  /**
  * run the mocha gulp pipeline.
  * 
  * if `onDone` is provided, calls with an error if one occurs or
  * with no arguments when done.
  */
  runMochaPipeline(
    taskName: TaskName,
    tests: Pattern,
    callback?: DoneCallback,
  ): void {
    const spawnMocha = require('gulp-spawn-mocha');
    
    this.log(taskName, `doing mocha`, {tests});
    
    // fucking 'end' gets emitted after error?!
    const onceCallback = _.once(callback);
    
    this.gulp
      .src(tests.path, {read: false})
      .pipe(spawnMocha({
        growl: true,
        reporter: 'min',
        env: {
          NODE_ENV: 'test',
          // NODE_PATH: `${ process.env.NODE_PATH }:${ tempPath }`,
        },
      }))
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
  
  /**
  * run the gulp less pipeline.
  * 
  * if `onDone` is provided, calls with an error if one occurs or
  * with no arguments when done.
  */
  runLessPipeline(
    taskName: TaskName,
    src: Pattern,
    dest: AbsDir,
    onDone?: DoneCallback,
  ): void {
    const less = require('gulp-less');
    
    const onError = (error: Error) => {
      this.logError(taskName, error, {src, dest});
      
      if (onDone) {
        onDone(error);
      }
    };
    
    this.gulp.src(src.path, {base: src.base})
      .pipe(less())
      .on('error', onError)
      .pipe(this.gulp.dest(dest))
      .on('error', onError)
      .on('end', () => {
        this.notify(
          taskName,
          'COMPILED',
          `${ this.relative(src.path) } => ${ this.relative(dest) }`
        );
        
        if (onDone) {
          onDone();
        }
      });
  }
  
} // Ugh
