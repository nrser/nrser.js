// package
import * as errors from '../../errors';
import { Pattern } from '../util';
import { WatchTask } from './WatchTask';

// types
import type { TaskId, TaskName, AbsPath } from '../types';

export class WatchLessTask extends WatchTask {
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
    dest: AbsPath,
  }) {
    super(id, `watch:less:${ id }`);
    
    this.src = src;
    this.dest = dest;
  }
}