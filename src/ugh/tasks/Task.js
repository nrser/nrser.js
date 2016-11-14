// @flow

// system
import { EventEmitter } from 'events';

// deps
import _ from 'lodash';
import Promise from 'bluebird';
import chalk from 'chalk';

// nrser
import * as errors from '../../errors';
import { squish, I } from '../../string';

// ugh
import { Ugh } from '../Ugh';
import { TaskName } from '../util/TaskName';
import { Scheduler } from '../util/Scheduler';

// types
import type { TaskId, TaskTypeName } from '../types';

export class Task extends EventEmitter {
  static WAIT_MS = 0;
  
  /**
  * flag set to true when running.
  */
  _running: boolean;
  
  ugh: Ugh;
  name: TaskName;
  
  /**
  * schedulers to run execute keyed by the JSON serialization of the
  * arguments to run().
  */
  schedulers: {[key: string]: Scheduler};
  
  static get typeName(): TaskTypeName {
    return _.map(
      _.words(this.name.replace(/Task$/, '')),
      (word: string): string => {
        return word.toLowerCase();
      }
    );
  }
  
  /**
  * static method called by {Ugh.task} so that work can be done *before*
  * instantiating the class (since `super` must be the first call in
  * constructors, making it tricky to work with values before-hand).
  */
  static create({ugh, ...kwds}: {ugh: Ugh, kwds: Array<*>}): Task {
    const task = new this({ugh, ...kwds});
    ugh.add(task);
    return task;
  }
  
  constructor({ugh, id} : {
    ugh: Ugh,
    id: TaskId,
  }) {
    super();
    this.ugh = ugh;
    this.name = new TaskName({
      id,
      typeName: this.constructor.typeName,
      packageName: this.ugh.packageName,
    });
    
    this._running = false;
    this.schedulers = {};
  }
  
  // public API
  // ==========
  
  get running(): boolean {
    return this._running;
  }
  
  /**
  * any tasks that this task depends on.
  */
  deps(): Array<Task> {
    return [];
  }
  
  /**
  * run pipe on all source files
  */
  run(...args: Array<*>): Promise<void> {
    this.log(chalk.yellow("running..."), {args});
    
    let argsKey: string;
    
    try {
      argsKey = JSON.stringify(args);
    } catch(error) {
      return Promise.reject(
        new TypeError(squish(I`
          args must be JSON serializable to form key, found #{ args }.
          error: ${ error.toString() }
        `))
      );
    }
    
    if (!_.has(this.schedulers, argsKey)) {
      this.schedulers[argsKey] = new Scheduler(
        `${ this.name.toString() } ${ argsKey }`,
        () => {
          return this._execute_wrapper(...args);
        },
        {
          timeout: this.constructor.WAIT_MS,
          log: (...messages) => {
            this.log(..._.map(messages, m => chalk.gray(m)))
          },
        },
      )
    }
    
    return this.schedulers[argsKey].schedule();
  }
  
  runWithDeps(): Promise<void> {
    return Promise.all(_.map(this.deps(), task => task.runWithDeps()))
      .then(() => {
        this.run();
      });
  }
  
  // private API
  // ===========
  // 
  // mostly just pass-through stuff for logging / notifications that adds
  // the task information and calls up to the Ugh instance to execute.
  // 
  
  /**
  * function subclasses override to get work done. this is scheduled by
  * run().
  */
  execute(...args: Array<*>): Promise<void> {
    throw new errors.NotImplementedError();
  }
  
  /**
  * internal API that
  * 
  * -   runs all dependent tasks returned by {#deps}
  * -   wraps `execute` in setting and unsetting the `_running` flag
  * -   emits 'success' or 'error' events after it's done.
  */
  _execute_wrapper(...args: Array<*>): Promise<void> {
    this._running = true;
    
    this.log(chalk.yellow("executing..."));
    
    return this.execute(...args)
      .then(() => {
        this.log(chalk.green("success"));
        this.emit('success');
      })
      .catch((error: Error) => {
        this.logError(error);
        this.emit('error', error);
        throw error;
      })
      .finally(() => {
        this._running = false;
      });
  }
  
  /**
  * log to gulp-util.log with the package name and task name.
  */
  log(...messages: Array<*>): void {
    this.ugh.log(this.name, ...messages);
  }
  
  /**
  * logs an error to the console, including a notification by default.
  */
  logError(
    error: Error,
    {
      details,
      notify = true,
    }: {
      details?: *,
      notify?: boolean,
    } = {}
  ): void {
    this.ugh.logError(this.name, error, {details, notify});
  }
  
  /**
  * dispatches a notification.
  */
  notify(status: string, message: string): void {
    this.ugh.notify(this.name, status, message);
  }
}
