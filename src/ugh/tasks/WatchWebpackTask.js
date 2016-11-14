// @flow

// deps
import _ from 'lodash';
import Promise from 'bluebird';

// nrser
import * as errors from '../../errors';
import { Deferred } from '../../Deferred';

// ugh
import { Pattern } from '../util';
import { WatchTask } from './WatchTask';
import { WatchFilesTask } from './WatchFilesTask';
import { WebpackTask } from './WebpackTask';
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
export class WatchWebpackTask extends WatchTask {
  /**
  * associated mocha task
  */
  webpackTask: WebpackTask;
  
  deferred: Deferred<void>;
  
  constructor({ugh, webpackTask}: {
    ugh: Ugh,
    webpackTask: WebpackTask,
  }) {
    super({ugh, id: webpackTask.name.id});
    
    this.webpackTask = webpackTask;
  }
  
  start(): Promise<void> {
    this.deferred = new Deferred();
    
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
          
          this.webpackTask.run();
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