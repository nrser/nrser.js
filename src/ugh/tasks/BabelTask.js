// package
import { Pattern } from '../util';
import { Task } from './Task';

// types
import type { TaskId, TaskName, AbsDir } from '../types';

export class BabelTask extends Task {
  /**
  * pattern to find source files.
  */
  src: Pattern;
  
  /**
  * directory to output them to.
  */
  dest: AbsDir;
  
  constructor({id, src, dest}: {
    id: TaskId,
    src: Pattern,
    dest: AbsDir,
  }) {
    super(id, `babel:${ id }`);
    
    this.src = src;
    this.dest = dest;
  }
}