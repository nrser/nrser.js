// @flow

// package
import { Pattern } from '../util';
import { BuildTask } from './BuildTask';
import { CleanTask } from './CleanTask';
import { Ugh } from '../Ugh';

// types
import type { TaskId, TaskName, AbsDir, DoneCallback } from '../types';

export class BabelTask extends BuildTask {
  /**
  * pattern to find source files.
  */
  src: Pattern;
  
  /**
  * directory to output them to.
  */
  dest: AbsDir;
    
  constructor({ugh, id, src, dest, cleanTask}: {
    ugh: Ugh,
    id: TaskId,
    src: Pattern,
    dest: AbsDir,
    cleanTask?: ?CleanTask,
  }) {
    super({ugh, id, cleanTask});
    
    this.src = src;
    this.dest = dest;
  }
  
  /**
  * run pipe on all source files
  */
  run(onDone?: DoneCallback): void {
    if (this.cleanTask) {
      this.cleanTask.run((error?: Error) => {
        if (error) {
          if (onDone) {
            onDone(error);
          } else {
            // pass
          }
        } else {
          this.pipeline(this.src, onDone);
        }
      })
    } else {
      this.pipeline(this.src, onDone);
    }
  }
  
  /**
  * run the pipeline on a single source file
  */
  runOne(filePattern: Pattern, onDone?: DoneCallback): void {
    this.pipeline(filePattern, onDone);
  }
  
  /**
  * runs the babel gulp pipeline.
  * 
  * if `onDone` is provided, calls with an error if one occurs or
  * with no arguments when done.
  */
  pipeline(
    src: Pattern,
    onDone?: DoneCallback,
  ): void {
    const babel = require('gulp-babel');
    
    const details = {src, dest: this.dest};
    
    this.log("pipelining babel", details);
    
    const onError = (error: Error) => {
      this._running = false;
      
      this.logError(error, {details});
      
      // emit an error event
      this.emitter.emit('error', error);
      
      if (onDone) {
        onDone(error);
      }
    };
    
    this._running = true;
    
    this.ugh.gulp
      .src(src.path, {base: src.base})
      
      .pipe(babel())
      .on('error', onError)
      
      .pipe(this.ugh.gulp.dest(this.dest))
      .on('error', onError)
      
      .on('end', () => {
        this._running = false;
        
        this.notify(
          'COMPILED',
          `${ this.ugh.relative(src.path) } => ${ this.ugh.relative(this.dest) }`
        );
        
        // emit a done event so that listen tasks know that we built
        this.emitter.emit('done');
        
        if (onDone) {
          onDone();
        }
      });
  }
}