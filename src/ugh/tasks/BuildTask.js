// deps
import _ from 'lodash';

// nrser
import * as errors from '../../errors';

// ugh
import { Task } from './Task';
import { CleanTask } from './CleanTask';

/**
* super class for all tasks that are part of building. these will all be
* dependencies of composite `build` and `build:<packageName` tasks.
* 
* they also may have an clean task that they depend on that will be run
* before them.
*/
export class BuildTask extends Task {
  /**
  * flag set to true when running.
  */
  _running: boolean;
  
  /**
  * optional associated clean task to depend on
  */
  cleanTask: ?CleanTask;
  
  constructor({ugh, id, cleanTask} : {
    ugh: Ugh,
    id: TaskId,
    cleanTask?: ?CleanTask,
  }) {
    super({ugh, id});
    this.cleanTask = cleanTask;
  }
  
  /**
  * get any tasks that this task depends on.
  */
  deps(): Array<Task> {
    if (this.cleanTask) {
      return [this.cleanTask];
    }
    
    return super.deps();
  }
}
