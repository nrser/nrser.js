// @flow

// deps
import _ from 'lodash';

// package
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { Task } from './Task';
import { Scheduler } from '../util/Scheduler';

// types
import type { TaskId, TaskName, DoneCallback } from '../types';

export class MochaTask extends Task {
  /**
  * pattern for the test files to run.
  */
  tests: Pattern;
  
  /**
  * scheduler to spawn mocha. since mocha collects many files it is managed
  * by a scheduler so that it doesn't step on itself.
  */
  scheduler: Scheduler;
  
  constructor({ugh, id, tests}: {
    ugh: Ugh,
    id: TaskId,
    tests: Pattern,
  }) {
    super({ugh, id});
    
    this.tests = tests;
    
    this.scheduler = new Scheduler(
      this.name,
      (onDone: DoneCallback) => {
        this.pipeline(onDone);
      },
      {
        log: this.log.bind(this),
      },
    );
  }
  
  run(onDone?: DoneCallback): void {
    this.scheduler.schedule(onDone);
  }
  
  /**
  * run the mocha gulp pipeline.
  * 
  * if `onDone` is provided, calls with an error if one occurs or
  * with no arguments when done.
  */
  pipeline(onDone?: DoneCallback): void {
    const spawnMocha = require('gulp-spawn-mocha');
    
    const details = {tests: this.tests};
    
    this.log(`pipelining mocha`, details);
    
    // fucking 'end' gets emitted after error?!
    const onceOnDone = _.once(onDone);
    
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
        
        if (onDone) {
          onceOnDone(error);
        }
      })
      .on('end', () => {
        if (onDone) {
          onceOnDone();
        }
      });
  } // #pipeline
}