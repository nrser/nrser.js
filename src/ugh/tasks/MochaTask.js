// @flow

// package
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { Task } from './Task';
import { Scheduler } from '../util/Scheduler';

// types
import type { TaskId, TaskName, DoneCallback } from '../types';

export class MochaTask extends Task {
  /**
  * pattern for the test files to run.
  */
  tests: Pattern;
  
  /**
  * scheduler to spawn mocha. since mocha collects many files it is managed
  * by a scheduler so that it doesn't step on itself.
  */
  scheduler: Scheduler;
  
  constructor({ugh, id, tests}: {
    ugh: Ugh,
    id: TaskId,
    tests: Pattern,
  }) {
    super({ugh, id, name: `mocha:${ id }`});
    
    this.tests = tests;
    
    this.scheduler = new Scheduler(
      this.name,
      (onDone: DoneCallback) => {
        this.ugh.runMochaPipeline(this.name, this.tests, onDone);
      },
      {
        log: this.log.bind(this),
      },
    );
  }
  
  run(onDone?: DoneCallback): void {
    this.scheduler.schedule(onDone);
  }
}