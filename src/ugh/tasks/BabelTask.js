// @flow

// deps
import Q from 'q';

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
  * runs the babel gulp pipeline.
  * 
  * if `onDone` is provided, calls with an error if one occurs or
  * with no arguments when done.
  */
  execute(src: Pattern = this.src): Q.Promise<void> {
    const babel = require('gulp-babel');
    
    const details = {src, dest: this.dest};
    
    return new Q.Promise((resolve, reject) => {
      
      const onError = (error: Error) => {
        this._running = false;
        
        this.logError(error, {details});
        
        reject(error);
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
          
          resolve();
        });
    });
  }
}