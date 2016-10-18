// package
import { Pattern } from '../util';
import { Task } from './Task';
import { Ugh } from '../Ugh';

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
  
  constructor({ugh, id, src, dest}: {
    ugh: Ugh,
    id: TaskId,
    src: Pattern,
    dest: AbsDir,
  }) {
    super({ugh, id, name: `babel:${ id }`});
    
    this.src = src;
    this.dest = dest;
  }
}