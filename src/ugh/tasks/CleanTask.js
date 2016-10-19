// @flow

// package
import { Pattern } from '../util';
import { Task } from './Task';
import { Ugh } from '../Ugh';

// types
import type { TaskId, TaskName, DoneCallback } from '../types';

/**
* little struct that hold info about a babel task that's been created.
* 
* needed because other tasks may need access to info about where babel
* sources and destinations are.
*/
export class CleanTask extends Task {
  dest: string;
  
  constructor({ugh, id, dest}: {
    ugh: Ugh,
    id: TaskId,
    dest: string,
  }) {
    super({ugh, id, name: `clean:${ id }`});
    
    this.dest = dest;
  }
  
  run(onDone?: DoneCallback): void {
    this.ugh.runCleanPipeline(this.name, this.dest, onDone);
  }
  
  runOne(dest: string, onDone?: DoneCallback): void {
    this.ugh.runCleanPipeline(this.name, dest, onDone);
  }
}