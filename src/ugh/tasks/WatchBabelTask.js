// deps
import { Gaze } from 'gaze';

// package
import * as errors from '../../errors';
import { Src } from '../util';
import { WatchTask } from './WatchTask';

// types
import type { TaskId, TaskName, AbsPath } from '../types';

/**
* little struct that hold info about a babel task that's been created.
* 
* needed because other tasks may need access to info about where babel
* sources and destinations are.
*/
export class WatchBabelTask extends WatchTask {
  src: Src;
  dest: AbsPath;
  
  constructor({id, src, dest}: {
    id: TaskId,
    src: Src,
    dest: AbsPath,
  }) {
    super(id, `watch:babel:${ id }`);
    
    this.src = src;
    this.dest = dest;
  }
}