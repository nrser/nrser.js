// @flow

import * as errors from '../../errors';
import { Task } from './Task';
import { CleanTask } from './CleanTask';

/**
* task that can have a CleanTask associated.
*/
export class CleanableTask extends Task {
  /**
  * associated clean task, if any
  */
  _cleanTask: ?CleanTask;
  
  get cleanTask(): ?CleanTask {
    return this._cleanTask;
  }
  
  set cleanTask(cleanTask: ?CleanTask): void {
    if (this._cleanTask !== undefined) {
      throw new errors.StateError(`cleanTask already set`);
    }
    
    this._cleanTask = cleanTask;
  }
}