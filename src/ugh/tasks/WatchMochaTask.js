// @flow

// deps
import _ from 'lodash';
import Q from 'q';

// nrser
import * as errors from '../../errors';

// ugh
import { Pattern } from '../util';
import { WatchTask } from './WatchTask';
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
export class WatchMochaTask extends WatchTask {
  /**
  * Pattern for the tests to run.
  */
  tests: Pattern;
  
  /**
  * associated mocha task
  */
  mochaTask: MochaTask;
  
  deferred: Q.Defer;
  
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
  
  start(): Q.Promise<void> {
    this.deferred = Q.defer();
    
    const buildTasks = this.ugh.getTasksForType(BuildTask);
    
    _.each(buildTasks, (buildTask): void => {
      buildTask.on('success', () => {
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
    
    // boot up the watch tasks for the builds
    _.each(this.ugh.getTasksForType(WatchFilesTask), (task) => {
      task.run();
    });
    
    return this.deferred.promise;
  }
}