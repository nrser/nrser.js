// system
import path from 'path';

// deps
import _ from 'lodash';

import type { $Refinement } from 'tcomb';

export type AbsPath = string & $Refinement<typeof path.isAbsolute>;

export type AbsDir = AbsPath;

/**
* a task 'id' is the part that identifies *which* thing the task is
* operating on.
*/
function isTaskId(string: string): boolean {
  return string.length > 0;
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
};

// export type GulpType = {
//   task: Function,
//   src: Function,
//   tasks: {[name: TaskName]: GulpTask},
// };

export type DoneCallback = (error?: Error) => void;

export type GazeEvent = 'added' | 'changed' | 'deleted';