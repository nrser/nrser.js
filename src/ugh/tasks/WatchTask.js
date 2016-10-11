// deps
import { Gaze } from 'gaze';

// package
import * as errors from '../../errors';
import { Task } from './Task';

/**
* little struct that hold info about a babel task that's been created.
* 
* needed because other tasks may need access to info about where babel
* sources and destinations are.
*/
export class WatchTask extends Task {
  _watcher: ?Gaze;
  
  constructor(...args) {
    super(...args);
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
}