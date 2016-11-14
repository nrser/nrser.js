// @flow

// system
import path from 'path';

// deps
import _ from 'lodash';
import Promise from 'bluebird';

// nrser
import * as errors from '../../errors';

// ugh
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { WatchFilesTask } from './WatchFilesTask';
import { LessTask } from './LessTask';

// types
import type {
  TaskId,
  TaskName,
  AbsPath,
  GazeEvent,
  DoneCallback,
} from '../types';

export class WatchLessTask extends WatchFilesTask {
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
      id: lessTask.name.id,
      watch: (watch === undefined) ? [lessTask.src] : watch,
    });
    
    this.lessTask = lessTask;
  }
  
  start(): Promise<void> {
    const promise = super.start();
    
    // kick off
    // TOOD this will still run if gaze errors on init... that's generally not
    //      handled well at all.
    this.log("kicking off...");
    this.lessTask.run();
    
    return promise;
  }
  
  onAddedOrChanged(filePattern: Pattern): void {
    if (this.lessTask.src.match(filePattern)) {
      // if the watched file is in the source pattern run individually on that
      // file
      this.lessTask.run(filePattern);
      
    } else {
      // run the whole thing
      this.lessTask.run();
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
      this.lessTask.cleanTask.run(
        path.join(this.lessTask.dest, filePattern.pattern)
      );
      
    } else {
      // run the whole thing
      this.lessTask.run();
    }
  }
}