// @flow

// package
import { Pattern } from '../util';
import { Ugh } from '../Ugh';
import { CleanableTask } from './CleanableTask';
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

export class LessTask extends CleanableTask {
  /**
  * pattern for less files to source.
  */
  src: Pattern;
  
  /**
  * directory to output them.
  */
  dest: AbsDir;
  
  /**
  * scheduler to build less
  */
  scheduler: Scheduler;
  
  constructor({ugh, id, src, dest}: {
    ugh: Ugh,
    id: TaskId,
    src: Pattern,
    dest: AbsDir,
  }) {
    super({ugh, id});
    
    this.src = src;
    this.dest = dest;
    
    this.scheduler = new Scheduler(
      this.name,
      (onDone: DoneCallback) => {
        this.pipeline(this.src, onDone);
      },
      {
        log: this.log.bind(this),
      },
    );
  }
  
  /**
  * run pipe on all source files
  */
  run(onDone?: DoneCallback): void {
    this.scheduler.schedule(onDone);
  }
  
  /**
  * run the pipeline on a single source file
  */
  runOne(filePattern: Pattern, onDone?: DoneCallback): void {
    this.pipeline(filePattern, onDone);
  }
  
  /**
  * run the gulp less pipeline.
  * 
  * if `onDone` is provided, calls with an error if one occurs or
  * with no arguments when done.
  */
  pipeline(src: Pattern, onDone?: DoneCallback): void{
    const less = require('gulp-less');
    
    const details = {src, dest: this.dest};
    
    this.log(`pipelining less`, details);
    
    const onError = (error: Error) => {
      this.logError(error, {details});
      
      if (onDone) {
        onDone(error);
      }
    };
    
    this.ugh.gulp.src(src.path, {base: src.base})
      .pipe(less())
      .on('error', onError)
      .pipe(this.ugh.gulp.dest(dest))
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
  } // #pipeline
}