// @flow

// package
import { Pattern } from '../util';
import { CleanableTask } from './CleanableTask';
import { Ugh } from '../Ugh';

// types
import type { TaskId, TaskName, AbsDir } from '../types';

export class BabelTask extends CleanableTask {
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
  
  /**
  * run pipe on all source files
  */
  run(onDone?: DoneCallback): void {
    this.ugh.runBabelPipeline(this.name, this.src, this.dest, onDone);
  }
  
  /**
  * run the pipeline on a single source file
  */
  runOne(filePattern: Pattern, onDone?: DoneCallback): void {
    this.ugh.runBabelPipeline(this.name, filePattern, this.dest, onDone);
  }
}