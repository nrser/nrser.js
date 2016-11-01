// @flow

// system
import path from 'path';

// deps
import Q from 'q';

// nrser
import * as errors from '../../errors';

// ugh
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
  
  start(): Q.Promise<void> {
    const promise = super.start();
        
    // kick off
    this.log("kicking off...");
    this.babelTask.runWithDeps();
    
    return promise;
  }
  
  onAddedOrChanged(filePattern: Pattern): void {
    this.babelTask.run(filePattern);
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
