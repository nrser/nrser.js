// package
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
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
  
  constructor({ugh, id, src, dest}: {
    ugh: Ugh,
    id: TaskId,
    src: Pattern,
    dest: AbsDir,
  }) {
    super(ugh, id, `less:${ id }`);
    
    this.src = src;
    this.dest = dest;
  }
}