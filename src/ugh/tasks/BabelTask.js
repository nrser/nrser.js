// @flow

// package
import { Pattern } from '../util';
import { CleanableTask } from './CleanableTask';
import { Ugh } from '../Ugh';

// types
import type { TaskId, TaskName, AbsDir, DoneCallback } from '../types';

export class BabelTask extends CleanableTask {
  /**
  * pattern to find source files.
  */
  src: Pattern;
  
  /**
  * directory to output them to.
  */
  dest: AbsDir;
  
  constructor({ugh, id, src, dest}: {
    ugh: Ugh,
    id: TaskId,
    src: Pattern,
    dest: AbsDir,
  }) {
    super({ugh, id});
    
    this.src = src;
    this.dest = dest;
  }
  
  /**
  * run pipe on all source files
  */
  run(onDone?: DoneCallback): void {
    this.pipeline(this.src, onDone);
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
      this.logError(error, {details});
      
      if (onDone) {
        onDone(error);
      }
    };
    
    this.ugh.gulp
      .src(src.path, {base: src.base})
      
      .pipe(babel())
      .on('error', onError)
      
      .pipe(this.ugh.gulp.dest(this.dest))
      .on('error', onError)
      
      .on('end', () => {
        this.notify(
          'COMPILED',
          `${ this.ugh.relative(src.path) } => ${ this.ugh.relative(this.dest) }`
        );
        
        if (onDone) {
          onDone();
        }
      });
  }
}