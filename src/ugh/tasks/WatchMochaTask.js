// package
import * as errors from '../../errors';
import { Pattern } from '../util';
import { WatchTask } from './WatchTask';
import { Ugh } from '../Ugh';

// types
import type { TaskId, TaskName, AbsPath } from '../types';

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
  
  constructor({ugh, id, tests, watch}: {
    ugh: Ugh,
    id: TaskId,
    tests: Pattern,
    watch: Array<Pattern>,
  }) {
    super({ugh, id, name: `watch:mocha:${ id }`, watch});
    
    this.tests = tests;
  }
}