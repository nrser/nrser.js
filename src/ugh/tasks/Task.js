// @flow

// package
import * as errors from '../../errors';
import { Ugh } from '../Ugh';

// types
import type { TaskId, TaskName } from '../types';

export class Task {
  ugh: Ugh;
  id: TaskId;
  name: TaskName;
  
  constructor({ugh, id, name} : {
    ugh: Ugh,
    id: TaskId,
    name: TaskName,
  }) {
    this.ugh = ugh;
    this.id = id;
    this.name = name;
  }
  
  log(...messages: Array<*>): void {
    this.ugh.log(this.name, ...messages);
  }
  
  logError(error: Error): void {
    this.ugh.logError(this.name, error);
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
