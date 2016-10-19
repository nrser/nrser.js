// @flow

// package
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { CleanableTask } from './CleanableTask';
import * as errors from '../../errors';
import { Scheduler } from '../util/Scheduler';

// types
import type { 
  TaskId,
  TaskName,
  AbsDir,
  AbsPath,
  DoneCallback,
} from '../types';

export class LessTask extends CleanableTask {
  /**
  * pattern for less files to source.
  */
  src: Pattern;
  
  /**
  * directory to output them.
  */
  dest: AbsDir;
  
  /**
  * scheduler to build less
  */
  scheduler: Scheduler;
  
  constructor({ugh, id, src, dest}: {
    ugh: Ugh,
    id: TaskId,
    src: Pattern,
    dest: AbsDir,
  }) {
    super({ugh, id, name: `less:${ id }`});
    
    this.src = src;
    this.dest = dest;
    
    this.scheduler = new Scheduler(
      this.name,
      (onDone: DoneCallback) => {
        this.ugh.runLessPipeline(this.name, this.src, this.dest, onDone);
      },
      {
        log: this.log.bind(this),
      },
    );
  }
  
  /**
  * run pipe on all source files
  */
  run(onDone?: DoneCallback): void {
    this.scheduler.schedule(onDone);
  }
  
  /**
  * run the pipeline on a single source file
  */
  runOne(filePattern: Pattern, onDone?: DoneCallback): void {
    this.ugh.runLessPipeline(this.name, filePattern, this.dest, onDone);
  }
}