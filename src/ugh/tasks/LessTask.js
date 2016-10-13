// package
import { Pattern } from '../util';

import { Task } from './Task';

// types
import type { TaskId, TaskName, AbsDir } from '../types';

export class LessTask extends Task {
  /**
  * pattern for less files to source.
  */
  src: Pattern;
  
  /**
  * directory to output them.
  */
  dest: AbsDir;
  
  constructor({id, tests}: {
    id: TaskId,
    tests: Pattern,
  }) {
    super(id, `mocha:${ id }`);
    
    this.tests = tests;
  }
}