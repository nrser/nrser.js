// package
import * as errors from '../../errors';
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
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
  
  /**
  * patterns to watch
  */
  watch: Array<Pattern>;
  
  constructor({ugh, id, src, dest, watch}: {
    ugh: Ugh,
    id: TaskId,
    src: Pattern,
    dest: AbsPath,
    watch?: Array<Pattern>,
  }) {
    super({
      ugh,
      id,
      name: `watch:less:${ id }`,
      watch: (watch === undefined) ? [src] : watch,
    });
    
    this.src = src;
    this.dest = dest;
    this.watch = watch;
  }
  
  onDeleted(filepath) {
    
  }
}