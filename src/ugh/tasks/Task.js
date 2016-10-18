// package
import * as errors from '../../errors';
import { Ugh } from '../Ugh';

// types
import type { TaskId, TaskName } from '../types';

export class Task {
  ugh: Ugh;
  id: TaskId;
  name: TaskName;
  
  constructor({ugh, id, name} : {
    ugh: Ugh,
    id: TaskId,
    name: TaskName,
  }) {
    this.ugh = ugh;
    this.id = id;
    this.name = name;
  }
}
