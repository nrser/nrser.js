// system
import path from 'path';

// package
import * as errors from '../../errors';
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { WatchTask } from './WatchTask';

// types
import type { TaskId, TaskName, AbsPath } from '../types';

/**
* little struct that hold info about a watch babel task that's been created.
*/
export class WatchBabelTask extends WatchTask {
  src: Pattern;
  dest: AbsPath;
  
  constructor({ugh, id, src, dest, watch}: {
    ugh: Ugh,
    id: TaskId,
    src: Pattern,
    dest: AbsPath,
    watch?: Array<Pattern>,
  }) {
    super({
      ugh,
      id,
      name: `watch:babel:${ id }`,
      watch: (watch === undefined) ? [src] : watch,
    });
    
    this.src = src;
    this.dest = dest;
  }
  
  onAdded(filePattern: Pattern): void {
    this.ugh.doBabel(this.name, filePattern, this.dest);
  }
  
  onChanged(filePattern: Pattern): void {
    this.ugh.doBabel(this.name, filePattern, this.dest);
  }
  
  onDeleted(filePattern: Pattern): void {
    this.ugh.doClean(this.name, path.join(this.dest, filePattern.pattern));
  }
}
