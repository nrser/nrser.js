import _ from 'lodash';

import type { $Refinement } from 'tcomb';

function isAbsPath(string: string): boolean {
  return string.startsWith('/');
}

export type AbsPath = string & $Refinement<typeof isAbsPath>;

/**
* a task 'id' is the part that identifies *which* thing the task is operating on.
* 
* it's the last part of the Gulp task name, the 'src' in 'babel:src', 
* 'watch:babel:src', etc.
*/
function isTaskId(string: string): boolean {
  return string.length > 0 && string.indexOf(':') === -1;
}

export type TaskId = string & $Refinement<typeof isTaskId>;

function isTaskName(string: string): boolean {
  return string.length > 0 && _.every(
    string.split(':'),
    (part: string): boolean => string.length > 0
  )
}
export type TaskName = string & $Refinement<typeof isTaskName>;

export type GulpTask = {
  name: TaskName,
  dep: Array<TaskName>,
  fn: Function,
}

export type DoneCallback = (error?: Error) => void;