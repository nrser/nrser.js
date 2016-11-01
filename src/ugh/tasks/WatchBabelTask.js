// @flow

// system
import path from 'path';

// package
import * as errors from '../../errors';
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { WatchFilesTask } from './WatchFilesTask';
import { BabelTask } from './BabelTask';

// types
import type { TaskId, TaskName, AbsPath } from '../types';

/**
* little struct that hold info about a watch babel task that's been created.
*/
export class WatchBabelTask extends WatchFilesTask {  
  babelTask: BabelTask;
  
  constructor({ugh, babelTask, watch}: {
    ugh: Ugh,
    babelTask: BabelTask,
    watch?: Array<Pattern>,
  }) {
    super({
      ugh,
      id: babelTask.name.id,
      watch: (watch === undefined) ? [babelTask.src] : watch,
    });
    
    this.babelTask = babelTask;
  }
  
  start(onDone?: DoneCallback): void {
    super.start(onDone);
        
    // kick off
    this.log("kicking off...");
    
    this.babelTask.run();
  }
  
  onAddedOrChanged(filePattern: Pattern): void {
    this.babelTask.runOne(filePattern);
  }
  
  onAdded(filePattern: Pattern): void {
    this.onAddedOrChanged(filePattern);
  }
  
  onChanged(filePattern: Pattern): void {
    this.onAddedOrChanged(filePattern);
  }
  
  onDeleted(filePattern: Pattern): void {
    if (this.babelTask.cleanTask) {
      this.babelTask.cleanTask.runOne(
        path.join(this.babelTask.dest, filePattern.pattern)
      );
    }
  }
}
