// package
import { Pattern } from '../util';

import { Task } from './Task';

// types
import type { TaskId, TaskName } from '../types';

/**
* little struct that hold info about a babel task that's been created.
* 
* needed because other tasks may need access to info about where babel
* sources and destinations are.
*/
export class CleanTask extends Task {
  dest: string;
  
  constructor({id, dest}: {
    id: TaskId,
    dest: string,
  }) {
    super(id, `clean:${ id }`);
    
    this.dest = dest;
  }
}