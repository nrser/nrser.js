// @flow

// system
import { EventEmitter } from 'events';

// deps
import _ from 'lodash';
import Q from 'q';

// nrser
import * as errors from '../../errors';

// ugh
import { Ugh } from '../Ugh';
import { TaskName } from '../util/TaskName';

// types
import type { TaskId, TaskTypeName, DoneCallback } from '../types';

export class Task extends EventEmitter {
  ugh: Ugh;
  name: TaskName;
  
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
  static create(kwds = {}): Task {
    return new this(kwds);
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
  }
  
  // public API
  // ==========
  
  /**
  * any tasks that this task depends on.
  */
  deps(): Array<Task> {
    return [];
  }
  
  /**
  * run pipe on all source files
  */
  run(): Q.Promise<void> {
    throw new errors.NotImplementedError();
  }
  
  // private API
  // ===========
  // 
  // mostly just pass-through stuff for logging / notifications that adds
  // the task information and calls up to the Ugh instance to execute.
  // 
  
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
