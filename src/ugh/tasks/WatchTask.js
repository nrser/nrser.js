// deps
import { Gaze } from 'gaze';

// package
import * as errors from '../../errors';
import { Ugh } from '../Ugh';
import { Task } from './Task';
import { findOne } from '../../collection';
import { Pattern } from '../util/Pattern';

// types
import type { TaskId, TaskName } from '../types';

/**
* little struct that hold info about a babel task that's been created.
* 
* needed because other tasks may need access to info about where babel
* sources and destinations are.
*/
export class WatchTask extends Task {
  /**
  * patterns that this task watches.
  */
  watch: Array<Pattern>;
  
  _watcher: ?Gaze;
  
  constructor({ugh, id, name, watch}: {
    ugh: Ugh,
    id: TaskId,
    name: TaskName,
    watch: Array<Pattern>,
  }) {
    super({ugh, id, name});
    
    this.watch = watch;
  }
  
  get watcher(): ?Gaze {
    return this._watcher;
  }
  
  set watcher(watcher: Gaze): void {
    if (typeof this._watcher !== 'undefined') {
      throw new errors.NrserError("watcher instance already set.");
    }
    
    this._watcher = watcher;
  }
  
  get watchPaths() {
    return _.map(this.watch, pattern => pattern.path);
  }
  
  /**
  * find which watch pattern a filepath came from.
  */
  getWatchForFilepath(filepath: AbsPath): Pattern {
    return findOne(this.watch, (pattern: Pattern): boolean => {
      return pattern.match(filepath);
    });
  }
  
  start(onDone: DoneCallback) {
    this.watcher = gaze(
      this.watchPaths,
      (initError: ?Error, watcher: gaze.Gaze): void => {
        if (initError) {
          // there was an error initializing the gazeInstance
          // this is the only time we callback and end the task
          this.ugh.logError(this.name, initError);
          onDone(initError);
          return;
        } else {
          log(`initialized, watching...`, {paths: this.watchPaths});
        }
      }
    );
  }
}