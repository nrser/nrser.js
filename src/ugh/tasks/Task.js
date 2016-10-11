// package
import * as errors from '../../errors';

// types
import type { TaskId, TaskName, GulpTask } from '../types';

export class Task {
  id: TaskId;
  name: TaskName;
  _gulpTask: ?GulpTask;
  
  constructor(id: TaskId, name: TaskName) {
    this.id = id;
    this.name = name;
  }
  
  get gulpTask(): GulpTask {
    if (typeof this._gulpTask === 'undefined') {
      throw new Error("no gulp task has been assigned");
    }
    
    return this._gulpTask;
  }
  
  set gulpTask(gulpTask: GulpTask): void {
    if (typeof this._gulpTask !== 'undefined') {
      throw new NrserError("gulp task already set", {gulpTask: this.gulpTask});
    }
    
    this._gulpTask = gulpTask;
  }
}
