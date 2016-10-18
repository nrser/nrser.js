// package
import * as errors from '../../errors';
import { Pattern } from '../util';
import { WatchTask } from './WatchTask';
import { Ugh } from '../Ugh';
import { Scheduler } from '../util/Scheduler';

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
  * pattern for files to watch.
  */
  watch: Array<Pattern>;
  
  /**
  * scheduler to spawn mocha
  */
  scheduler: Scheduler;
  
  constructor({ugh, id, tests, watch}: {
    ugh: Ugh,
    id: TaskId,
    tests: Pattern,
    watch: Array<Pattern>,
  }) {
    super({ugh, id, name: `watch:mocha:${ id }`, watch});
    
    this.tests = tests;
    
    this.scheduler = new Scheduler(
      this.name,
      (onDone: DoneCallback) => {
        this.ugh.doMocha(this.name, this.tests, onDone);
      },
      {
        log: this.log.bind(this),
      },
    );
  }
  
  start(onDone: DoneCallback) /* tcomb fail : void */ {
    super.start(onDone);
    
    // kick off
    this.log("kicking off mocha...");
    this.scheduler.schedule();
  }
  
  onAll(event: GazeEvent, filePattern: Pattern): void {
    this.scheduler.schedule();
  }
}