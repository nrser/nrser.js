// @flow

// deps
import _ from 'lodash';

// package
import * as errors from '../../errors';
import { Ugh } from '../Ugh';
import { TaskName } from '../util/TaskName';

// types
import type { TaskId, TaskTypeName } from '../types';

export class Task {
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
  
  constructor({ugh, id} : {
    ugh: Ugh,
    id: TaskId,
  }) {
    this.ugh = ugh;
    this.name = new TaskName({
      id,
      typeName: this.constructor.typeName,
      packageName: this.ugh.packageName,
    });
  }
  
  log(...messages: Array<*>): void {
    this.ugh.log(this.name, ...messages);
  }
  
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
    this.pkg.logError(this.name, error, {details, notify});
  }
  
  /**
  * dispatches a notification.
  */
  notify(status: string, message: string): void {
    this.ugh.notify(this.name, status, message);
  }
  
  /**
  * run pipe on all source files
  */
  run(onDone?: DoneCallback): void {
    throw new errors.NotImplementedError();
  }
}
