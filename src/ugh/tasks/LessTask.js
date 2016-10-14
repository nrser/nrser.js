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
  
  constructor({id, src, dest}: {
    id: TaskId,
    src: Pattern,
    dest: AbsDir,
  }) {
    super(id, `less:${ id }`);
    
    this.src = src;
    this.dest = dest;
  }
}