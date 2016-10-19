// @flow

// system
import path from 'path';

// deps
import _ from 'lodash';
import gaze, { Gaze } from 'gaze';

// package
import * as errors from '../../errors';
import { Ugh } from '../Ugh';
import { Task } from './Task';
import { findOnly } from '../../collection';
import { Pattern } from '../util/Pattern';

// types
import type {
  TaskId,
  TaskName,
  AbsPath,
  DoneCallback,
  GazeEvent,
} from '../types';

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
  
  /**
  * 'private' variables holding the gaze instance watching the files, if any.
  */
  _watcher: ?Gaze;
  
  /**
  * callback optionally provided to {#start} to fire when done (either with
  * an error when initialization fails, or with no args when {#stop} is
  * called - errors occurring in the triggered operations are reported 
  * but the task continues to run).
  */
  onDone: ?DoneCallback;
  
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
      throw new errors.StateError("watcher instance already set.");
    }
    
    this._watcher = watcher;
  }
  
  get watchPaths() {
    return _.map(this.watch, pattern => pattern.path);
  }
  
  /**
  * find which watch pattern a filepath came from.
  */
  getWatchPattern(filepath: string): Pattern {
    const absPath = this.ugh.resolve(filepath);
    
    return findOnly(this.watch, (pattern: Pattern): boolean => {
      return pattern.match(absPath);
    });
  }
  
  /**
  * convert a filepath to a pattern based off the watch pattern that
  * it came from.
  */
  filepathToPattern(filepath: string): Pattern {
    const watchPattern = this.getWatchPattern(filepath);
    
    return new Pattern({
      base: watchPattern.base,
      pattern: path.relative(watchPattern.base, filepath),
    });
  }
  
  /**
  * start the gaze watcher.
  * 
  * `onInitError` is  DoneCallback that is *only* erred-back when gaze
  * initialization fails - 
  */
  start(onDone?: DoneCallback) {
    if (this.watcher !== undefined) {
      throw new errors.StateError(`already watching`);
    }
    
    gaze(
      this.watchPaths,
      (initError: ?Error, watcher: gaze.Gaze): void => {
        if (initError) {
          // there was an error initializing the gazeInstance
          // this is the only time we callback and end the task
          this.logError(initError);
          
          // if we received a DoneCallback, fire that with the error.
          if (onDone) {
            onDone(initError);
            return;
          }
          
          // otherwise it's not handled, so throw it (better than just
          // swallowing it i guess)
          throw initError;
          
        } else {
          this.log(`initialized, watching...`, {paths: this.watchPaths});
          
        }
        
        this.watcher = watcher;
        
        _.each(
          {
            added: this.onAdded,
            changed: this.onChanged,
            deleted: this.onDeleted,
          },
          (method: Function, event: GazeEvent): void => {
            watcher.on(event, (filepath: string): void => {
              const filePattern = this.filepathToPattern(filepath);
              this.log(`handling ${ event } event`, {filepath, filePattern});
              
              method.call(this, this.filepathToPattern(filepath));
            });
          }
        );
      } // gaze init
    ); // gaze()
    
    this.onDone = onDone;
  } // #start
  
  /**
  * stops watching and fires the onDone callback with no arguments if one was
  * provided to {#start}.
  */
  stop(): void {
    this.watcher.close();
    delete this._watcher;
    
    // if we received an onDone callback, fire it.
    // we don't use this but it seems good to have in there for completeness /
    // consistency's sake, rather than just never firing unless there was an
    // init error.
    if (this.onDone) {
      this.onDone();
    }
    
    delete this.onDone;
  } // #stop
  
  onAdded(filePattern: Pattern): void {
    this.onAll('added', filePattern);
  }
  
  onChanged(filePattern: Pattern): void {
    this.onAll('changed', filePattern);
  }
  
  onDeleted(filePattern: Pattern): void {
    this.onAll('deleted', filePattern);
  }
  
  onAll(event: GazeEvent, filePattern: Pattern): void {
    this.ugh.log(this.name, "no handler in place", {event, filePattern});
  }
}