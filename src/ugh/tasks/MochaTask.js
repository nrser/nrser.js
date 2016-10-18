// package
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { Task } from './Task';

// types
import type { TaskId, TaskName } from '../types';

export class MochaTask extends Task {
  /**
  * pattern for the test files to run.
  */
  tests: Pattern;
  
  constructor({ugh, id, tests}: {
    ugh: Ugh,
    id: TaskId,
    tests: Pattern,
  }) {
    super({ugh, id, name: `mocha:${ id }`});
    
    this.tests = tests;
  }
}