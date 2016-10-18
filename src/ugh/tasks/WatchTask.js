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
  
  start(onDone: DoneCallback) {
    this.watcher = gaze(
      this.watchPaths,
      (initError: ?Error, watcher: gaze.Gaze): void => {
        if (initError) {
          // there was an error initializing the gazeInstance
          // this is the only time we callback and end the task
          this.logError(initError);
          onDone(initError);
          return;
          
        } else {
          this.log(`initialized, watching...`, {paths: this.watchPaths});
          
        }
        
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
        )
        
        // watcher.on('added', (filepath: string): void => {
        //   this.onAdded(this.filepathToPattern(filepath));
        // });
        // 
        // watcher.on('changed', (filepath: string): void => {
        //   this.onChanged(this.filepathToPattern(filepath));
        // });
        // 
        // watcher.on('deleted', (filepath: string): void => {
        //   this.onDeleted(this.filepathToPattern(filepath));
        // });
      } // gaze init
    ); // gaze()
  } // #start
  
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