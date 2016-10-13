// package
import * as errors from '../../errors';
import { Pattern } from '../util';
import { WatchTask } from './WatchTask';

// types
import type { TaskId, TaskName, AbsPath } from '../types';

/**
* little struct that hold info about a watch babel task that's been created.
*/
export class WatchBabelTask extends WatchTask {
  src: Pattern;
  dest: AbsPath;
  
  constructor({id, src, dest}: {
    id: TaskId,
    src: Pattern,
    dest: AbsPath,
  }) {
    super(id, `watch:babel:${ id }`);
    
    this.src = src;
    this.dest = dest;
  }
}