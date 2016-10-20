// @flow

// package
import * as errors from '../../errors';
import { Pattern } from '../util';
import { WatchTask } from './WatchTask';
import { MochaTask } from './MochaTask';
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
  * pattern for files to watch.
  */
  watch: Array<Pattern>;
  
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
      id: mochaTask.id,
      name: `watch:mocha:${ mochaTask.id }`,
      watch
    });
    
    this.mochaTask = mochaTask;
  }
  
  start(onDone?: DoneCallback): void {
    super.start(onDone);
    
    // kick off
    this.log("kicking off mocha...");
    
    // NOTE `onDone` is for the *entire watch task* - we **don't** want to 
    //      provide it to the watched {MochaTask#run}
    this.mochaTask.run();
  }
  
  onAll(event: GazeEvent, filePattern: Pattern): void {
    this.mochaTask.run();
  }
}