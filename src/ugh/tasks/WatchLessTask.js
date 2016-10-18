// system
import path from 'path';

// package
import * as errors from '../../errors';
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { WatchTask } from './WatchTask';

// types
import type {
  TaskId,
  TaskName,
  AbsPath,
  GazeEvent,
  DoneCallback,
} from '../types';

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
  
  start(onDone: DoneCallback): void {
    super.start(onDone);
    
    // kick off
    // TOOD this will still run if gaze errors on init... that's generally not
    //      handled well at all.
    this.log("kicking off...");
    this.ugh.doLess(this.name, this.src, this.dest);
  }
  
  onAdded(filePattern: Pattern): void {
    this.ugh.doLess(this.name, filePattern, this.dest);
  }
  
  onChanged(filePattern: Pattern): void {
    this.ugh.doLess(this.name, filePattern, this.dest);
  }
  
  onDeleted(filePattern: Pattern): void {
    this.doClean(task.name, path.join(this.dest, filePattern.pattern));
  }
}