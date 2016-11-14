// @flow

// deps
import Promise from 'bluebird';

// package
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { BuildTask } from './BuildTask';
import { CleanTask } from './CleanTask';
import * as errors from '../../errors';
import { Scheduler } from '../util/Scheduler';

// types
import type { 
  TaskId,
  TaskName,
  AbsDir,
  AbsPath,
  DoneCallback,
} from '../types';

export class LessTask extends BuildTask {
  /**
  * pattern for less files to source.
  */
  src: Pattern;
  
  /**
  * directory to output them.
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
  * run the gulp less execute.
  * 
  * if `onDone` is provided, calls with an error if one occurs or
  * with no arguments when done.
  */
  execute(src: Pattern = this.src): Promise<void> {
    const less = require('gulp-less');
    
    const details = {src, dest: this.dest};
    
    this.log(`executing less`, details);
    
    return new Promise((resolve, reject) => {
    
      const onError = (error: Error) => {
        this.logError(error, {details});
        reject(error);
      };
      
      this.ugh.gulp.src(src.path, {base: src.base})
        .pipe(less())
        .on('error', onError)
        .pipe(this.ugh.gulp.dest(this.dest))
        .on('error', onError)
        .on('end', () => {
          this.notify(
            'COMPILED',
            `${ this.ugh.relative(src.path) } => ${ this.ugh.relative(this.dest) }`
          );
          
          resolve();
        });
    });
  } // #execute
}