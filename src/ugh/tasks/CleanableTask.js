import { Task } from './Task';

/**
* task that can have a CleanTask associated.
*/
export class CleanableTask extends Task {
  /**
  * associated clean task, if any
  */
  _cleanTask: ?CleanTask;
  
  constructor(...args) {
    super(...args);
  }
  
  get cleanTask(): ?CleanTask {
    return this._cleanTask;
  }
  
  set cleanTask(cleanTask: CleanTask): void {
    if (this._cleanTask !== undefined) {
      throw new errors.StateError(`cleanTask already set`);
    }
    
    this._cleanTask = cleanTask;
  }
}