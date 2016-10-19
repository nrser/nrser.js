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
  * the corresponding less task
  */
  lessTask: LessTask;
  
  /**
  * patterns to watch
  */
  watch: Array<Pattern>;
  
  constructor({ugh, lessTask, watch}: {
    ugh: Ugh,
    lessTask: LessTask,
    watch?: Array<Pattern>,
  }) {
    super({
      ugh,
      id: lessTask.id,
      name: `watch:less:${ lessTask.id }`,
      watch: (watch === undefined) ? [lessTask.src] : watch,
    });
    
    this.lessTask = lessTask;
    this.watch = watch;
  }
  
  runAll(onDone?: DoneCallback): void {
    this.lessTask.run(onDone);
  }
  
  start(onDone: DoneCallback): void {
    super.start(onDone);
    
    // kick off
    // TOOD this will still run if gaze errors on init... that's generally not
    //      handled well at all.
    this.log("kicking off...");
    this.lessTask.runAll();
  }
  
  onAddedOrChanged(filePattern: Pattern): void {
    if (this.lessTask.src.match(filePattern)) {
      // if the watched file is in the source pattern run individually on that
      // file
      this.lessTask.runOne(filePattern);
      
    } else {
      // run the whole thing
      this.lessTask.runAll();
    }
  }
  
  onAdded(filePattern: Pattern): void {
    this.onAddedOrChanged(filePattern);
  }
  
  onChanged(filePattern: Pattern): void {
    this.onAddedOrChanged(filePattern);
  }
  
  onDeleted(filePattern: Pattern): void {
    if (this.lessTask.src.match(filePattern) && this.lessTask.cleanTask) {
      // if the watched file is in the source pattern remove that destination
      // (if there is an associated clean task)
      this.lessTask.cleanTask.runOne(filePattern.path);
      
    } else {
      // run the whole thing
      this.lessTask.runAll();
    }
  }
}