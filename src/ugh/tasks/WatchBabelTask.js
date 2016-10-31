// @flow

// system
import path from 'path';

// package
import * as errors from '../../errors';
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { WatchTask } from './WatchTask';
import { BabelTask } from './BabelTask';

// types
import type { TaskId, TaskName, AbsPath } from '../types';

/**
* little struct that hold info about a watch babel task that's been created.
*/
export class WatchBabelTask extends WatchTask {  
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
    const start = () => {
      super.start.bind(onDone);
    }
    
    // kick off
    this.log("kicking off...");
    
    // NOTE `onDone` is for the *entire watch task* - we **don't** want to 
    //      provide it to the kick off task
    if (this.babelTask.cleanTask) {
      this.log("clean task present, running that first...");
      
      this.babelTask.cleanTask.run((error: ?Error) => {
        if (error) {
          this.log("clean task errored, starting watch now.");
          start();
          
        } else {
          this.log("done cleaning, running babel...");
          this.babelTask.run((error: ?Error) => {
            this.log("babel done, starting watch...");
            start();
          });
        }
      })
    } else {
      this.log("no clean task, running babel...");
      
      this.babelTask.run((error: ?Error) => {
        this.log("babel done, starting watch...");
        start();
      });
    }
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
