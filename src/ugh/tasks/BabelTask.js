// package
import { Src } from '../util';

import { Task } from './Task';

// types
import type { TaskId, TaskName } from '../types';

/**
* little struct that hold info about a babel task that's been created.
* 
* needed because other tasks may need access to info about where babel
* sources and destinations are.
*/
export class BabelTask extends Task {
  src: Src;
  
  constructor({id, src, dest}: {
    id: TaskId,
    src: Src,
    dest: string,
  }) {
    super(id, `babel:${ id }`);
    
    this.src = src;
    this.dest = dest;
  }
}