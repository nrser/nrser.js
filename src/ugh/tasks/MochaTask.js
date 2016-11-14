// @flow

// deps
import _ from 'lodash';
import Promise from 'bluebird';

// package
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { Task } from './Task';
import { BuildTask } from './BuildTask';
import { Scheduler } from '../util/Scheduler';

// types
import type { TaskId, TaskName, DoneCallback } from '../types';

export class MochaTask extends Task {
  static WAIT_MS = 300;
  
  /**
  * pattern for the test files to run.
  */
  tests: Pattern;
  
  constructor({ugh, id, tests}: {
    ugh: Ugh,
    id: TaskId,
    tests: Pattern,
  }) {
    super({ugh, id});
    
    this.tests = tests;
  }
  
  /**
  * depend on a build.
  */
  deps(): Array<Task> {
    return this.ugh.getTasksForType(BuildTask);
  }
  
  /**
  * run the mocha gulp execute.
  * 
  * if `onDone` is provided, calls with an error if one occurs or
  * with no arguments when done.
  */
  execute(): Promise<void> {
    const spawnMocha = require('gulp-spawn-mocha');
    
    const details = {tests: this.tests};
    
    this.log(`executing mocha`, details);
    
    return new Promise((resolve, reject) => {
      
      // fucking 'end' gets emitted after error?!
      const resolveOnce = _.once(resolve);
      
      this.ugh.gulp
        .src(this.tests.path, {read: false})
        .pipe(spawnMocha({
          growl: true,
          reporter: 'min',
          env: {
            NODE_ENV: 'test',
            // NODE_PATH: `${ process.env.NODE_PATH }:${ tempPath }`,
          },
        }))
        .on('error', (error) => {
          // mocha takes care of it's own logging and notifs
          this.logError(error, {details});
          
          reject(error);
        })
        .on('end', () => {
          resolveOnce();
        });
    });
  } // #execute
}