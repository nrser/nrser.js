// package
import { Pattern } from '../util';

import { Task } from './Task';

// types
import type { TaskId, TaskName } from '../types';

export class MochaTask extends Task {
  /**
  * pattern for the test files to run.
  */
  tests: Pattern;
  
  constructor({id, tests}: {
    id: TaskId,
    tests: Pattern,
  }) {
    super(id, `mocha:${ id }`);
    
    this.tests = tests;
  }
}