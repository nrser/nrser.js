// @flow

// deps
import _ from 'lodash';


// nrser
import * as errors from '../../errors';

// ugh
import { Pattern } from '../util';
import { WatchFilesTask } from './WatchFilesTask';
import { MochaTask } from './MochaTask';
import { BuildTask } from './BuildTask';
import { Ugh } from '../Ugh';

// types
import type {
  TaskId,
  TaskName,
  AbsPath,
  GazeEvent,
  DoneCallback,
} from '../types';

/**
* little struct that hold info about a watch mocha task that's been created.
*/
export class WatchMochaTask extends WatchFilesTask {
  /**
  * Pattern for the tests to run.
  */
  tests: Pattern;
  
  /**
  * associated mocha task
  */
  mochaTask: MochaTask;
  
  constructor({ugh, mochaTask, watch}: {
    ugh: Ugh,
    mochaTask: MochaTask,
    watch: Array<Pattern>,
  }) {
    super({
      ugh,
      id: mochaTask.name.id,
      watch
    });
    
    this.mochaTask = mochaTask;
    
  }
  
  start(onDone?: DoneCallback): void {
    // super.start(onDone);
    
    const buildTasks = this.ugh.getTasksForType(BuildTask);
    
    _.each(buildTasks, (buildTask): void => {
      buildTask.emitter.on('done', () => {
        this.log(
          `build task ${ buildTask.name.toString() } completed.`
        );
        
        const stillRunning = _.filter(buildTasks, (task) => task.running);
        
        if (stillRunning.length > 0) {
          this.log(
            `other build tasks are still running`,
            _.map(stillRunning, (task) => task.name.toString())
          );
        } else {
          this.log(`everything is done, running mocha.`);
          
          this.mochaTask.run();
        }
      })
    });
    
    // kick off
    // this.log("kicking off...");
    
    // NOTE `onDone` is for the *entire watch task* - we **don't** want to 
    //      provide it to the kick off task
    // this.mochaTask.run();
  }
}